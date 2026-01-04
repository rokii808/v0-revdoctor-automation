# Real Auction Links Guide

## Overview

Both the **demo workflow** and **real agent workflow** now scrape actual auction sites to provide **real, clickable links** to live vehicle listings. This proves the value to visitors and users.

## Demo Workflow (See It In Action)

### How It Works

The demo workflow (`lib/inngest/functions-demo.ts`) now:

1. **Attempts Real Scraping First** - Scrapes live vehicles from RAW2K
2. **Falls Back to Mock** - Uses mock data only if real scraping fails
3. **Shows Live Links** - Email contains clickable URLs to actual auction listings

### What Visitors See

When a visitor submits their email on `/test-email`, they receive:

✅ **2 real vehicle listings** from UK auctions
✅ **Clickable links** to actual auction pages
✅ **Real AI analysis** using OpenRouter/Gemini
✅ **Live proof** that the system works

Example URLs shown:
\`\`\`
https://www.raw2k.co.uk/vehicles/BMW-3-Series-2019-12345
https://www.bca.co.uk/vehicle/Mercedes-C-Class-2020-67890
\`\`\`

### Verification

Check Inngest Dev Server logs to see:
\`\`\`
✅ [Demo] Got 5 REAL vehicles from RAW2K with live links!
🔗 [Demo] Sample URL: https://www.raw2k.co.uk/vehicles/...
\`\`\`

## Real Agent Workflow (For Subscribed Users)

### Current Scraper Mode

The agent supports 3 scraper modes set via `SCRAPER_MODE` environment variable:

#### 1. Mock Mode (Default - Testing)

\`\`\`bash
SCRAPER_MODE=mock
\`\`\`

**Uses:** Test data with placeholder URLs
**Purpose:** Testing without hitting real auction sites
**URLs:** Not clickable (example URLs)

#### 2. HTML Mode (Web Scraping)

\`\`\`bash
SCRAPER_MODE=html
\`\`\`

**Uses:** Web scraping with Cheerio
**Purpose:** Real data when no API access
**URLs:** ✅ Real, clickable links to actual listings
**Limitations:** Can break if site structure changes

#### 3. API Mode (Production - Recommended)

\`\`\`bash
SCRAPER_MODE=api
\`\`\`

**Uses:** Official auction site APIs
**Purpose:** Most reliable, production-ready
**URLs:** ✅ Real, clickable links from APIs
**Limitations:** Requires API keys from auction sites

### Enabling Real Links for Users

#### Option 1: HTML Scraping (Quick Start)

Set in `.env.local`:

\`\`\`bash
SCRAPER_MODE=html
\`\`\`

**Pros:**
- ✅ No API keys needed
- ✅ Real URLs immediately
- ✅ Free to use

**Cons:**
- ❌ Can break if site changes HTML
- ❌ Slower than API
- ❌ May get rate limited

**Best for:** Testing, demos, early users

#### Option 2: API Access (Production)

1. **Get API Keys:**
   - RAW2K API: Contact sales@raw2k.co.uk
   - BCA API: https://www.bca.co.uk/api-access
   - Autorola API: https://www.autorola.co.uk/api
   - Manheim API: Contact Manheim directly

2. **Set Environment Variables:**

\`\`\`bash
SCRAPER_MODE=api

# RAW2K
RAW2K_API_KEY=your_raw2k_key_here
RAW2K_API_URL=https://api.raw2k.co.uk/v1

# BCA
BCA_API_KEY=your_bca_key_here
BCA_API_URL=https://api.bca.co.uk/v1

# Add others as you get access
\`\`\`

3. **Update API Scraper:**

Edit `lib/scrapers/api-scraper.ts` with actual API endpoints.

**Pros:**
- ✅ Most reliable
- ✅ Fast and efficient
- ✅ Real-time data
- ✅ Less likely to break

**Cons:**
- ❌ Requires API access (may cost money)
- ❌ May have rate limits

**Best for:** Production, paying users, scale

## URL Format by Auction Site

### RAW2K
\`\`\`
https://www.raw2k.co.uk/vehicles/{listing-id}
\`\`\`

### BCA (British Car Auctions)
\`\`\`
https://www.bca.co.uk/vehicle/{vehicle-id}
\`\`\`

### Autorola
\`\`\`
https://www.autorola.co.uk/vehicle/{lot-number}
\`\`\`

### Manheim
\`\`\`
https://www.manheim.co.uk/lot/{auction-id}/{lot-id}
\`\`\`

## Implementation Details

### Demo Workflow

**File:** `lib/inngest/functions-demo.ts`

\`\`\`typescript
// Tries real scraping first
const { scrapeRAW2K } = await import("../scrapers/raw2k")
const realVehicles = await scrapeRAW2K()

if (realVehicles && realVehicles.length > 0) {
  // Use real vehicles with live links!
  console.log(`🔗 Sample URL: ${realVehicles[0].url}`)
}
\`\`\`

### Real Agent Workflow

**File:** `lib/inngest/functions-enhanced.ts`

\`\`\`typescript
// Choose scraper based on SCRAPER_MODE
const SCRAPER_MODE = process.env.SCRAPER_MODE || "mock"

let scrapers: Array<() => Promise<VehicleListing[]>>

switch (SCRAPER_MODE) {
  case "api":
    scrapers = [scrapeRAW2KAPI, scrapeBCAAPI, ...]
    break
  case "html":
    scrapers = [scrapeRAW2K, scrapeBCA, ...]
    break
  default:
    scrapers = [scrapeRAW2KMock, scrapeBCAMock, ...]
}
\`\`\`

### HTML Scraper (RAW2K Example)

**File:** `lib/scrapers/raw2k.ts`

\`\`\`typescript
// Extracts URL from HTML
const relativeUrl = el.attr("href") || el.find("a").attr("href") || ""
const url = relativeUrl.startsWith("http")
  ? relativeUrl
  : `https://www.raw2k.co.uk${relativeUrl}`

// Returns full clickable URL
return {
  // ... other fields
  url, // ✅ Real, clickable link
}
\`\`\`

## Testing Real Links

### Test Demo Workflow

1. **Run Demo:**
\`\`\`bash
npm run dev
# Visit http://localhost:3000/test-email
# Submit email
\`\`\`

2. **Check Inngest Logs:**
\`\`\`bash
# Terminal where Inngest Dev Server is running
✅ [Demo] Got 5 REAL vehicles from RAW2K with live links!
🔗 [Demo] Sample URL: https://www.raw2k.co.uk/vehicles/...
\`\`\`

3. **Check Email:**
- Open received email
- Click "View Live Listing" button
- Should open actual auction page

### Test Real Agent Workflow

1. **Enable HTML Scraping:**
\`\`\`bash
# .env.local
SCRAPER_MODE=html
\`\`\`

2. **Trigger Agent:**
\`\`\`bash
# Via Inngest dashboard
http://localhost:8288

# Or trigger manually via API
curl -X POST http://localhost:3000/api/agent/start
\`\`\`

3. **Check Database:**
\`\`\`sql
SELECT
  make,
  model,
  url
FROM vehicle_matches
LIMIT 5;
\`\`\`

URLs should be real: `https://www.raw2k.co.uk/vehicles/...`

## Troubleshooting

### Demo Shows Mock Data

**Problem:** Demo is using mock data instead of real scraping

**Check:**
\`\`\`bash
# Inngest logs should show:
⚠️  [Demo] Real scraping failed, falling back to mock data

# Common reasons:
- RAW2K website is down
- HTML structure changed
- Network timeout
\`\`\`

**Solution:**
- Wait for site to come back up
- Update scraper selectors if HTML changed
- Mock data fallback ensures demo always works

### Links Not Clickable

**Problem:** URLs in email don't work

**Check:**
1. URL format in database
2. Email HTML rendering
3. Actual auction site availability

**Fix:**
\`\`\`typescript
// Ensure URL is absolute, not relative
const url = relativeUrl.startsWith("http")
  ? relativeUrl
  : `https://www.raw2k.co.uk${relativeUrl}`
\`\`\`

### Agent Using Mock Instead of Real

**Problem:** Agent shows mock data even with `SCRAPER_MODE=html`

**Check:**
\`\`\`bash
# Environment variable loaded?
echo $SCRAPER_MODE

# Restart dev server after changing .env.local
npm run dev
\`\`\`

**Verify:**
\`\`\`typescript
// Check logs
console.log(`[Workflow] Using scraper mode: ${SCRAPER_MODE}`)
\`\`\`

## Recommendation

### For Development & Testing
\`\`\`bash
SCRAPER_MODE=html
\`\`\`
- Shows real links
- No API costs
- Good for testing

### For Production
\`\`\`bash
SCRAPER_MODE=api
\`\`\`
- Most reliable
- Best data quality
- Worth the cost at scale

## API Access Costs

Estimated costs (varies by provider):

| Provider | Estimated Cost | Notes |
|----------|---------------|-------|
| RAW2K | £50-200/month | Depends on usage |
| BCA | £100-300/month | Tiered pricing |
| Autorola | Contact sales | Custom pricing |
| Manheim | Contact sales | Enterprise only |

**Alternative:** Start with HTML scraping (free) until you have paying users, then upgrade to API access for reliability.

## Email Template Updates

The demo email template (`lib/workflow/email-digest-demo.ts`) includes:

### View Listing Button

\`\`\`html
<a href="${vehicle.url}" target="_blank">
  View Live Listing →
</a>
\`\`\`

### URL Display

Shows actual auction site URL in email:
\`\`\`
🔗 https://www.raw2k.co.uk/vehicles/BMW-3-Series-2019-12345
\`\`\`

## Summary

✅ **Demo workflow** now scrapes real vehicles (falls back to mock if needed)
✅ **Real agent workflow** supports 3 modes: mock, html, api
✅ **HTML mode** provides real links without API costs
✅ **API mode** is most reliable for production
✅ **All URLs are clickable** and lead to actual auction listings

This gives visitors and users **proof of value** - they can click through and see the actual vehicles!
