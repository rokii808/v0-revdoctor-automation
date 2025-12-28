# RevvDoctor Web Scraping Implementation Guide

## Overview

RevvDoctor uses **n8n workflows** to scrape auction sites (RAW2K, BCA, Copart) for vehicle listings that match dealer preferences. The scraped data is analyzed by AI and stored in the database for email digests.

## Architecture

\`\`\`
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│   n8n       │────▶│  RAW2K/BCA   │────▶│  AI Analysis  │────▶│   Supabase   │
│  Workflow   │     │  Scraper     │     │  (OpenAI/etc) │     │   Database   │
└─────────────┘     └──────────────┘     └───────────────┘     └──────────────┘
       │                                                                │
       │                                                                │
       └────────────────── POST /api/workflow/insights ────────────────┘
\`\`\`

## Step 1: RAW2K Scraping (n8n Workflow)

### Required n8n Nodes:
1. **Schedule Trigger** - Runs daily at specific times
2. **HTTP Request (Get Dealers)** - `GET /api/workflow/dealers`
3. **Loop Over Dealers** - Process each dealer's preferences
4. **HTTP Request (Scrape RAW2K)** - Fetch RAW2K listings
5. **HTML Extract** - Parse vehicle details from HTML
6. **AI Analysis** - Send to OpenAI/Claude for condition assessment
7. **HTTP Request (Store Insights)** - `POST /api/workflow/insights`

### RAW2K URL Structure:
\`\`\`
Base URL: https://www.raw2k.co.uk/
Listings: https://www.raw2k.co.uk/search?page={page}&category=cars
Detail: https://www.raw2k.co.uk/vehicle/{listing_id}
\`\`\`

### Data to Extract:
\`\`\`typescript
{
  listing_id: string,        // e.g., "123456" from URL
  lot_number: string,         // e.g., "LOT-45678"
  title: string,              // e.g., "2019 BMW 3 Series 320d M Sport"
  make: string,               // e.g., "BMW"
  model: string,              // e.g., "3 Series 320d M Sport"
  year: number,               // e.g., 2019
  price: number,              // e.g., 18500
  mileage: number,            // e.g., 45000
  auction_site: "raw2k",
  auction_date: string,       // ISO 8601 format
  auction_location: string,   // e.g., "Copart UK - Manchester"
  condition_html: string,     // Full condition report HTML
  images_json: object[],      // Array of image URLs
  source_url: string          // Original RAW2K URL
}
\`\`\`

### HTML Selectors (Update based on actual RAW2K structure):
\`\`\`javascript
// Example selectors (inspect RAW2K to find actual selectors)
const selectors = {
  listingCard: '.vehicle-card',
  title: '.vehicle-title',
  price: '.vehicle-price',
  lotNumber: '.lot-number',
  mileage: '.mileage',
  auctionDate: '.auction-date',
  detailLink: 'a.vehicle-link'
}
\`\`\`

## Step 2: AI Analysis (OpenAI/Claude)

### Prompt Template:
\`\`\`
Analyze this vehicle condition report and determine if it's a healthy investment:

Title: {{title}}
Price: £{{price}}
Mileage: {{mileage}} miles
Condition Report: {{condition_html}}

Return JSON:
{
  "verdict": "HEALTHY" or "UNHEALTHY",
  "risk_score": 0-100,
  "minor_fault_type": "Battery|Tyre|Service|MOT|Brake|Clutch|None",
  "reason": "Brief explanation of why this is or isn't a good investment"
}

Rules:
- HEALTHY = Minor faults only (battery, tyres, service due, MOT due)
- UNHEALTHY = Major issues (engine, transmission, structural damage, flood, fire)
- risk_score: 0-15 = Low risk, 16-30 = Medium, 31+ = High
\`\`\`

### AI Response Processing:
\`\`\`javascript
const aiResponse = JSON.parse(response.choices[0].message.content)

// Validate AI response
if (!aiResponse.verdict || !aiResponse.reason) {
  throw new Error("Invalid AI response format")
}

// Add to vehicle data
const enrichedData = {
  ...vehicleData,
  verdict: aiResponse.verdict,
  risk: aiResponse.risk_score,
  minor_type: aiResponse.minor_fault_type,
  reason: aiResponse.reason
}
\`\`\`

## Step 3: Store in Database

### API Endpoint: POST /api/workflow/insights

\`\`\`bash
curl -X POST https://your-app.vercel.app/api/workflow/insights \
  -H "Content-Type: application/json" \
  -d '{
    "dealer_id": "uuid-of-dealer",
    "listing_id": "123456",
    "lot_number": "LOT-45678",
    "title": "2019 BMW 3 Series 320d M Sport",
    "make": "BMW",
    "year": 2019,
    "price": 18500,
    "mileage": 45000,
    "url": "https://www.raw2k.co.uk/vehicle/123456",
    "verdict": "HEALTHY",
    "minor_type": "Service",
    "risk": 15,
    "reason": "Minor service light, otherwise excellent condition",
    "auction_site": "raw2k",
    "auction_date": "2025-01-15T10:00:00Z",
    "auction_location": "Copart UK - Manchester",
    "condition_html": "<div>Full condition report HTML</div>",
    "images_json": [{"url": "https://...", "caption": "Front view"}]
  }'
\`\`\`

### Response:
\`\`\`json
{
  "success": true,
  "insight": {
    "id": "generated-uuid",
    "url": "https://your-app.vercel.app/vehicle/generated-uuid",
    ...
  },
  "message": "Vehicle insight stored and indexed successfully"
}
\`\`\`

## Step 4: Email Integration

The stored insights are automatically picked up by the daily digest workflow:

1. **n8n triggers at 7 AM daily**
2. **Fetches healthy vehicles** from `insights` table for each dealer
3. **Filters by dealer preferences** (makes, mileage, year, budget)
4. **Sends email** using the email template with internal `/vehicle/{id}` links

### Email Link Structure:
\`\`\`
Before: https://www.raw2k.co.uk/vehicle/bmw-3-series-2019 (404)
After:  https://your-app.vercel.app/vehicle/abc123-uuid-def456 (✓ Works)
\`\`\`

## Step 5: Testing the Scraper

### Test with Sample Data:
\`\`\`bash
# Send test insight
curl -X POST http://localhost:3000/api/workflow/insights \
  -H "Content-Type: application/json" \
  -d @test-vehicle.json

# Check it was stored
psql $DATABASE_URL -c "SELECT id, title, url FROM insights ORDER BY created_at DESC LIMIT 1;"

# Visit the detail page
open "http://localhost:3000/vehicle/{id-from-query}"
\`\`\`

## Step 6: Production Deployment

### Environment Variables Needed:
\`\`\`env
# n8n Workflow
N8N_WEBHOOK_URL=https://your-n8n-instance.com

# AI Analysis
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=...

# Database (already configured)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
\`\`\`

### n8n Workflow URLs:
\`\`\`
Start scraping: POST {N8N_WEBHOOK_URL}/webhook/startAgent
Stop scraping:  POST {N8N_WEBHOOK_URL}/webhook/stopAgent
Get status:     GET  {N8N_WEBHOOK_URL}/webhook/status
\`\`\`

## Troubleshooting

### Issue: 404 on vehicle links
**Solution**: Ensure `url` field in insights table uses internal `/vehicle/{id}` format, not external RAW2K URLs.

### Issue: No vehicles being scraped
**Solution**: Check n8n workflow execution logs, verify RAW2K selectors haven't changed.

### Issue: AI analysis failing
**Solution**: Check API keys, verify prompt returns valid JSON, add error handling.

### Issue: Emails not sending
**Solution**: Verify Resend API key, check dealer email addresses are valid, review digest workflow logs.

## Next Steps

1. Build n8n workflow using this guide
2. Test with RAW2K staging/sandbox (if available)
3. Start with 1-2 test dealers
4. Monitor results for 1 week
5. Scale to all dealers

## Resources

- n8n Documentation: https://docs.n8n.io/
- RevvDoctor API Docs: `/docs/API.md`
- Database Schema: `/scripts/03_comprehensive_schema.sql`
