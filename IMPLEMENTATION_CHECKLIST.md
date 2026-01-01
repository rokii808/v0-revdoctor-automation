# RevvDoctor Implementation Checklist

## Phase 1: Database Setup (Critical - Do First)

### 1.1 Run SQL Migrations in Supabase
\`\`\`sql
-- Copy and run ALL SQL from SECURITY_AUDIT.md section "Priority 1"
-- Then add these new tables:

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,

  -- Vehicle Preferences
  preferred_makes TEXT[],
  preferred_models TEXT[],
  min_year INT DEFAULT 2015,
  max_year INT,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 50000,
  max_mileage INT DEFAULT 100000,
  preferred_conditions TEXT[],
  fuel_types TEXT[],
  transmission_types TEXT[],

  -- Auction Site Preferences
  enabled_auction_sites TEXT[] DEFAULT ARRAY['RAW2K'],

  -- Notification Preferences
  email_frequency TEXT DEFAULT 'daily',
  email_enabled BOOLEAN DEFAULT TRUE,
  min_vehicles_to_send INT DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(dealer_id)
);

CREATE TABLE vehicle_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,

  -- Vehicle Data
  listing_id TEXT NOT NULL,
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
  verdict TEXT,
  reason TEXT,
  risk_score INT,
  profit_estimate NUMERIC,
  match_score INT,

  -- Metadata
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  auction_date TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, dealer_id)
);

CREATE INDEX idx_vehicle_matches_user ON vehicle_matches(user_id, is_sent);
CREATE INDEX idx_vehicle_matches_dealer ON vehicle_matches(dealer_id, created_at);
CREATE INDEX idx_vehicle_matches_listing ON vehicle_matches(listing_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vehicle matches"
  ON vehicle_matches FOR SELECT
  USING (auth.uid() = user_id);
\`\`\`

**Checklist:**
- [ ] Run migrations in Supabase SQL Editor
- [ ] Verify all tables created successfully
- [ ] Verify RLS policies enabled
- [ ] Test queries in Supabase dashboard

---

## Phase 2: Environment Variables

### 2.1 Update .env.local
\`\`\`bash
# Copy from .env.example and fill in:

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # For admin operations

# OpenAI (Optional - uses fallback if missing)
OPENAI_API_KEY=sk-...

# Resend Email (Required for emails)
RESEND_API_KEY=re_...

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cron Security (Required)
CRON_SECRET=generate_a_random_32_character_string_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

**Generate CRON_SECRET:**
\`\`\`bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

**Checklist:**
- [ ] All environment variables set
- [ ] CRON_SECRET is random and secure (not "dev-secret")
- [ ] Supabase keys tested
- [ ] Resend API key tested (send test email)

---

## Phase 3: Security Fixes (Critical)

### 3.1 Fix CRON_SECRET
- [x] Already done in previous edits
- [ ] Verify no "dev-secret" fallback in code

### 3.2 Add Rate Limiting
\`\`\`bash
# Install dependencies
npm install @upstash/ratelimit @upstash/redis
\`\`\`

Create Upstash Redis (free tier):
1. Go to https://upstash.com/
2. Create account → Create Redis database
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Add to `.env.local`

**Checklist:**
- [ ] Upstash Redis created
- [ ] Rate limiting added to demo endpoint
- [ ] Rate limiting tested (try >3 requests)

### 3.3 Enable Email Verification
1. Supabase Dashboard → Authentication → Settings
2. Enable "Confirm email"
3. Configure email templates

**Checklist:**
- [ ] Email verification enabled in Supabase
- [ ] Test signup flow
- [ ] Verify confirmation email received

---

## Phase 4: Feature Implementation

### 4.1 Demo "See It In Action" Feature

**Frontend Component:**
\`\`\`typescript
// components/landing/demo-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DemoForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/demo/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      setResult({ success: res.ok, message: data.message || data.error })
    } catch (error) {
      setResult({ success: false, message: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "See RevvDoctor in Action"}
      </Button>
      {result && (
        <p className={result.success ? "text-green-600" : "text-red-600"}>
          {result.message}
        </p>
      )}
    </form>
  )
}
\`\`\`

Add to landing page:
\`\`\`typescript
// app/page.tsx
import { DemoForm } from "@/components/landing/demo-form"

// In your landing page:
<section className="py-20">
  <h2>Try It Before You Buy</h2>
  <p>Enter your email to receive a sample daily digest</p>
  <DemoForm />
</section>
\`\`\`

**Checklist:**
- [ ] Demo form component created
- [ ] Added to landing page
- [ ] Test demo flow end-to-end
- [ ] Verify email received

### 4.2 User Onboarding Preferences

**Frontend Component:**
\`\`\`typescript
// app/onboarding/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function OnboardingPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState({
    preferred_makes: [] as string[],
    min_year: 2015,
    max_price: 50000,
    max_mileage: 100000,
    enabled_auction_sites: ["RAW2K"],
    email_frequency: "daily",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    })

    if (res.ok) {
      router.push("/dashboard")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8">
      <h1>Set Your Preferences</h1>

      <div className="space-y-6">
        <div>
          <Label>Preferred Makes (comma-separated)</Label>
          <Input
            placeholder="BMW, Audi, Mercedes"
            onChange={(e) => setPreferences({
              ...preferences,
              preferred_makes: e.target.value.split(",").map(s => s.trim())
            })}
          />
        </div>

        <div>
          <Label>Minimum Year</Label>
          <Input
            type="number"
            value={preferences.min_year}
            onChange={(e) => setPreferences({
              ...preferences,
              min_year: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <Label>Maximum Price (£)</Label>
          <Input
            type="number"
            value={preferences.max_price}
            onChange={(e) => setPreferences({
              ...preferences,
              max_price: parseInt(e.target.value)
            })}
          />
        </div>

        <Button type="submit">Save & Continue</Button>
      </div>
    </form>
  )
}
\`\`\`

**Checklist:**
- [ ] Onboarding page created
- [ ] Redirect after signup to onboarding
- [ ] Save preferences to database
- [ ] Test full signup → onboarding → dashboard flow

### 4.3 Dashboard Integration

Update dashboard to show vehicle_matches instead of healthy_cars:
\`\`\`typescript
// app/dashboard/page.tsx (UPDATE)
const { data: healthyCars, error: healthyCarsError } = await supabase
  .from("vehicle_matches") // Changed from healthy_cars
  .select("*")
  .eq("dealer_id", dealer?.id || '')
  .gte("created_at", new Date().toISOString().split("T")[0])
  .order("match_score", { ascending: false }) // Sort by match score
  .limit(50)
\`\`\`

**Checklist:**
- [ ] Dashboard reads from vehicle_matches
- [ ] Shows match_score on cards
- [ ] Sorts by match score (best matches first)

---

## Phase 5: Email System

### 5.1 Verify Resend Setup
**Resend is perfect for your use case - KEEP IT**

Setup checklist:
- [ ] Domain verified in Resend (for production)
- [ ] From address configured (`noreply@yourdomain.com`)
- [ ] Test email sent successfully

### 5.2 Daily Digest Cron Job
\`\`\`typescript
// app/api/cron/send-daily-digests/route.ts (UPDATE)
// Use the existing file, but update logic to:
// 1. Get users with email_enabled=true
// 2. Get unsent vehicle_matches (is_sent=false) from last 24h
// 3. Filter by user preferences
// 4. Send email if count >= min_vehicles_to_send
// 5. Mark as is_sent=true
\`\`\`

**Checklist:**
- [ ] Daily digest cron implemented
- [ ] Test manually with curl
- [ ] Configure Vercel cron (see below)

---

## Phase 6: Production Deployment

### 6.1 Vercel Cron Jobs
Create `vercel.json`:
\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/scrape-all-sites",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/send-daily-digests",
      "schedule": "0 7 * * *"
    }
  ]
}
\`\`\`

**Checklist:**
- [ ] vercel.json created
- [ ] Cron jobs configured
- [ ] Environment variables set in Vercel
- [ ] Test cron endpoints with CRON_SECRET header

### 6.2 Security Hardening
- [ ] All fixes from SECURITY_AUDIT.md Priority 1 completed
- [ ] Rate limiting enabled
- [ ] RLS enabled on all tables
- [ ] Email verification enabled
- [ ] GDPR compliance pages created (Privacy, Terms)

### 6.3 Monitoring
Recommended tools:
- **Sentry** for error tracking
- **Axiom** for logs
- **Vercel Analytics** for performance

**Checklist:**
- [ ] Error tracking configured
- [ ] Log monitoring setup
- [ ] Alerts configured for critical errors

---

## Phase 7: Testing

### 7.1 End-to-End Test Scenarios
- [ ] Demo flow: Email → Receive sample digest
- [ ] Signup: Register → Verify email → Set preferences → Dashboard
- [ ] Daily flow: Scraper runs → Matches vehicles → Sends email → Dashboard updated
- [ ] Preferences: Update preferences → Next digest reflects changes

### 7.2 Security Tests
- [ ] Try demo endpoint >3 times (should rate limit)
- [ ] Try accessing other user's data (should fail with RLS)
- [ ] Try invalid input in preferences API (should validate)

---

## Quick Start Commands

\`\`\`bash
# Install dependencies
npm install

# Setup database
# 1. Go to Supabase dashboard
# 2. Copy SQL from above
# 3. Run in SQL Editor

# Configure environment
cp .env.example .env.local
# Fill in values (see Phase 2)

# Run development server
npm run dev

# Test demo endpoint
curl -X POST http://localhost:3000/api/demo/scrape \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test cron manually
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/scrape-raw2k
\`\`\`

---

## Summary: Your Best Path Forward

**Resend:** ✅ KEEP IT - Perfect for your stack
**Current Scraper:** ❌ REPLACE - Too fragile, use architecture from ARCHITECTURE.md
**Database:** ⚠️ FIX IMMEDIATELY - Run SQL migrations, enable RLS
**Security:** 🚨 CRITICAL - Fix all Priority 1 items before launch

**Estimated Timeline:**
- Phase 1-3: 1-2 days (database + security)
- Phase 4: 2-3 days (features)
- Phase 5-6: 1-2 days (email + deployment)
- Phase 7: 1 day (testing)

**Total: 5-8 days to production-ready**
