# RevvDoctor - Scalable Scraper Architecture

## System Overview

```
User Signs Up → Sets Preferences → Daily Scraper Runs → Matches Preferences → Email Digest
                                                                              ↓
                                                                       Dashboard View
```

## Database Schema (Enhanced)

### 1. User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,

  -- Vehicle Preferences
  preferred_makes TEXT[], -- ['BMW', 'Audi', 'Mercedes']
  preferred_models TEXT[], -- ['3 Series', 'A4']
  min_year INT DEFAULT 2015,
  max_year INT,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 50000,
  max_mileage INT DEFAULT 100000,
  preferred_conditions TEXT[], -- ['Excellent', 'Good']
  fuel_types TEXT[], -- ['Petrol', 'Diesel', 'Electric']
  transmission_types TEXT[], -- ['Automatic', 'Manual']

  -- Auction Site Preferences
  enabled_auction_sites TEXT[], -- ['RAW2K', 'Autorola', 'BCA']

  -- Notification Preferences
  email_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'instant'
  email_enabled BOOLEAN DEFAULT TRUE,
  min_vehicles_to_send INT DEFAULT 1, -- Don't send if < 1 vehicle

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Auction Sites Configuration Table
```sql
CREATE TABLE auction_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT UNIQUE NOT NULL, -- 'RAW2K', 'Autorola', 'BCA'
  site_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  scraper_type TEXT, -- 'html', 'api', 'puppeteer'
  rate_limit_per_hour INT DEFAULT 60,
  requires_auth BOOLEAN DEFAULT FALSE,
  last_scraped_at TIMESTAMPTZ,
  scraper_config JSONB, -- Store site-specific config
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Scraper Jobs Table (Job Queue)
```sql
CREATE TABLE scraper_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_site_id UUID REFERENCES auction_sites(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  vehicles_found INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Vehicle Matches Table (Optimized)
```sql
CREATE TABLE vehicle_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,

  -- Vehicle Data
  listing_id TEXT UNIQUE NOT NULL,
  auction_site TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC NOT NULL,
  mileage INT,
  condition TEXT,
  fuel_type TEXT,
  transmission TEXT,
  url TEXT NOT NULL,
  images TEXT[],

  -- Analysis
  verdict TEXT, -- 'HEALTHY', 'AVOID', 'PENDING'
  reason TEXT,
  risk_score INT,
  profit_estimate NUMERIC,
  match_score INT, -- How well it matches user preferences (0-100)

  -- Metadata
  is_sent BOOLEAN DEFAULT FALSE, -- Has this been emailed?
  sent_at TIMESTAMPTZ,
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  auction_date TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_matches_user ON vehicle_matches(user_id, is_sent);
CREATE INDEX idx_vehicle_matches_dealer ON vehicle_matches(dealer_id, created_at);
CREATE INDEX idx_vehicle_matches_listing ON vehicle_matches(listing_id);
```

## Workflow Implementation

### 1. User Onboarding Flow
```typescript
// app/api/onboarding/preferences/route.ts
POST /api/onboarding/preferences
{
  "preferred_makes": ["BMW", "Audi"],
  "min_year": 2018,
  "max_price": 25000,
  "enabled_auction_sites": ["RAW2K", "BCA"],
  "email_frequency": "daily"
}
```

### 2. Demo/Preview Flow (Non-registered users)
```typescript
// app/api/preview/demo-scrape/route.ts
POST /api/preview/demo-scrape
{
  "email": "user@example.com",
  "preferences": {
    "makes": ["BMW"],
    "max_price": 30000
  }
}

// Response: Send immediate email with sample vehicles
```

### 3. Daily Scraper Cron Job
```typescript
// Runs at 6 AM daily
GET /api/cron/scrape-all-sites
Authorization: Bearer CRON_SECRET

Flow:
1. Get all active auction sites
2. For each site, create scraper job
3. Scrape vehicles from site
4. For each vehicle, match against ALL user preferences
5. Insert matches into vehicle_matches table
6. Trigger email digest job
```

### 4. Email Digest Cron Job
```typescript
// Runs at 7 AM daily (after scraper)
GET /api/cron/send-daily-digests
Authorization: Bearer CRON_SECRET

Flow:
1. Get all users with email_enabled=true and email_frequency='daily'
2. For each user, get unsent vehicle_matches from last 24h
3. If count >= min_vehicles_to_send, send email
4. Mark vehicles as is_sent=true
```

## Scraper Strategy

### Option A: Regex-based (Current - NOT RECOMMENDED)
- ❌ Fragile, breaks with HTML changes
- ✅ Fast, no dependencies
- **Use only for simple, stable sites**

### Option B: Puppeteer/Playwright (RECOMMENDED)
- ✅ Handles JavaScript-rendered content
- ✅ Can interact with pages (login, scroll)
- ✅ More reliable
- ❌ Slower, resource-intensive

### Option C: Official APIs (BEST)
- ✅ Most reliable
- ✅ Fastest
- ❌ Requires API access/keys
- **Use when available**

## Email Service Comparison

### Current: Resend
- ✅ Modern, developer-friendly API
- ✅ Good deliverability
- ✅ React Email templates (you're using this!)
- ✅ Free tier: 100 emails/day
- **KEEP THIS - It's perfect for your use case**

### Alternatives:
- **SendGrid**: More enterprise, harder setup
- **Postmark**: Great deliverability, more expensive
- **AWS SES**: Cheapest at scale, harder setup
- **Mailgun**: Good, but Resend is better for React

**Recommendation: KEEP Resend - it's ideal for your stack**

## Security & Performance Improvements

### 1. Rate Limiting
```typescript
// Prevent abuse of demo scrape endpoint
import { Ratelimit } from "@upstash/ratelimit"
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
})
```

### 2. Job Queue (Recommended: Inngest or Trigger.dev)
```typescript
// Instead of synchronous scraping in API route
import { inngest } from "./inngest/client"

inngest.createFunction(
  { id: "scrape-auction-site" },
  { event: "auction/scrape.requested" },
  async ({ event }) => {
    // Scrape in background, with retries
  }
)
```

### 3. Caching Strategy
```typescript
// Cache scraper results for 1 hour to avoid re-scraping
const cacheKey = `scraper:${siteName}:${date}`
const cached = await redis.get(cacheKey)
if (cached) return cached
```
