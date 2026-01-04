# Building Custom Apify Actors for Auction Sites

Complete guide to creating custom Apify actors for RAW2K, BCA, Autorola, and Manheim.

## Prerequisites

1. **Apify account** - https://apify.com (free tier works)
2. **Apify API key** - From https://console.apify.com/account/integrations
3. **Apify CLI** - `npm install -g apify-cli`

## Quick Setup (5 Steps)

### Step 1: Install Apify CLI & Login

\`\`\`bash
# Install CLI globally
npm install -g apify-cli

# Login with your API key
apify login
\`\`\`

Enter your API key when prompted (from https://console.apify.com/account/integrations).

### Step 2: Create RAW2K Actor

\`\`\`bash
# Create actor directory
mkdir -p apify-actors/raw2k-scraper
cd apify-actors/raw2k-scraper

# Initialize actor
apify init
\`\`\`

Choose: **"Puppeteer & Playwright Crawler"**

Replace `src/main.js` with the code from `/apify-actors/raw2k-scraper-main.js` (provided in this repo).

Replace `.actor/input_schema.json` with `/apify-actors/raw2k-input-schema.json`.

### Step 3: Test Locally

\`\`\`bash
# Run locally
apify run

# Check results
cat storage/datasets/default/*.json
\`\`\`

You should see JSON output with vehicle data:
\`\`\`json
{
  "id": "RAW2K-1234567890",
  "make": "BMW",
  "model": "3 Series",
  "year": "2019",
  "price": "18500",
  "mileage": "42000",
  "url": "https://www.raw2k.co.uk/vehicles/..."
}
\`\`\`

### Step 4: Deploy to Apify

\`\`\`bash
# Deploy to Apify cloud
apify push

# Copy the actor ID shown (e.g., your-username/raw2k-scraper)
\`\`\`

### Step 5: Update Integration Code

Update `lib/scrapers/apify-scraper.ts`:

\`\`\`typescript
// Replace 'your-actor-name/raw2k-scraper' with your actual actor ID
const run = await client.actor('YOUR-USERNAME/raw2k-scraper').call({
  startUrls: ['https://www.raw2k.co.uk/vehicles'],
  maxPages: 10,
})
\`\`\`

## Creating Actors for Other Sites

### BCA (British Car Auctions)

\`\`\`bash
cd apify-actors
apify create bca-scraper
\`\`\`

**Modify `src/main.js`:**

Key differences from RAW2K:
- Start URL: `https://www.bca.co.uk/search/cars`
- Selectors: Update to match BCA's HTML structure
- URL format: `https://www.bca.co.uk/vehicle/{id}`

**BCA-specific selectors** (inspect BCA website to find actual selectors):

\`\`\`javascript
// In requestHandler, update selectors:
await page.waitForSelector('.search-result, .vehicle-item');

const vehicles = await page.$$eval('.search-result, .vehicle-item', (cards) => {
  return cards.map(card => {
    // Update selectors based on BCA's HTML
    const title = card.querySelector('.title, .vehicle-name')?.textContent.trim();
    // ... rest of extraction logic
  });
});
\`\`\`

### Autorola

\`\`\`bash
cd apify-actors
apify create autorola-scraper
\`\`\`

Start URL: `https://www.autorola.co.uk/vehicles`

### Manheim

\`\`\`bash
cd apify-actors
apify create manheim-scraper
\`\`\`

Start URL: `https://www.manheim.co.uk/search`

**Note:** Manheim may require login. For authenticated scraping:

\`\`\`javascript
// In requestHandler, before scraping:
if (request.userData.label === 'LOGIN') {
  await page.type('#username', process.env.MANHEIM_USERNAME);
  await page.type('#password', process.env.MANHEIM_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}
\`\`\`

## Actor Code Structure

### Main Components

\`\`\`javascript
// 1. Initialize Actor
await Actor.init();

// 2. Get input parameters
const input = await Actor.getInput();

// 3. Configure proxy
const proxyConfig = await Actor.createProxyConfiguration();

// 4. Create crawler
const crawler = new PuppeteerCrawler({
  proxyConfiguration: proxyConfig,
  requestHandler: async ({ request, page }) => {
    // Extract data
    const vehicles = await page.$$eval('.vehicle', cards => {
      // Transform HTML to JSON
    });

    // Save to dataset
    await Actor.pushData(vehicles);
  }
});

// 5. Run crawler
await crawler.run();

// 6. Exit
await Actor.exit();
\`\`\`

### Key Functions

**Extract text safely:**
\`\`\`javascript
const getText = (selector) => {
  const el = card.querySelector(selector);
  return el ? el.textContent.trim() : '';
};
\`\`\`

**Parse price:**
\`\`\`javascript
const priceText = getText('.price');
const price = priceText.replace(/[^0-9.]/g, ''); // Remove £, commas
\`\`\`

**Parse mileage:**
\`\`\`javascript
const mileageText = getText('.mileage');
const mileage = mileageText.replace(/[^0-9]/g, ''); // Just numbers
\`\`\`

**Handle relative URLs:**
\`\`\`javascript
const relativeUrl = getAttr('a', 'href');
const url = relativeUrl.startsWith('http')
  ? relativeUrl
  : `https://www.raw2k.co.uk${relativeUrl}`;
\`\`\`

## Testing Your Actors

### Local Testing

\`\`\`bash
# Run with default input
apify run

# Run with custom input
echo '{"maxPages": 5}' | apify run --input -

# Check output
cat storage/datasets/default/*.json | jq
\`\`\`

### Test in Apify Console

1. Go to https://console.apify.com/actors
2. Click your actor
3. Click "Try it"
4. Adjust input parameters
5. Click "Start"
6. View results in "Storage" tab

### Debugging

**View logs:**
\`\`\`bash
# Local
apify run --verbose

# In console
# Go to actor run → Logs tab
\`\`\`

**Common issues:**

❌ **No vehicles found**
- Check selectors are correct
- Inspect website HTML
- Try different wait timeout

❌ **Blocked by site**
- Enable Apify proxy
- Use residential proxies
- Add random delays

❌ **Timeout errors**
- Increase `requestHandlerTimeoutSecs`
- Reduce `maxConcurrency`

## Deployment Workflow

### Development Workflow

\`\`\`bash
# 1. Make changes
nano src/main.js

# 2. Test locally
apify run

# 3. Deploy to Apify
apify push

# 4. Test in cloud
# Visit console.apify.com and run actor
\`\`\`

### Version Control

\`\`\`bash
# Add to git
git add apify-actors/
git commit -m "Add Apify actors for auction scraping"
git push
\`\`\`

## Integration with Revvdoctor

### Update Environment Variables

\`\`\`bash
# .env.local
SCRAPER_MODE=apify
APIFY_API_KEY=apify_api_xxxxxxxxxx
\`\`\`

### Update Actor IDs in Code

**Edit `lib/scrapers/apify-scraper.ts`:**

\`\`\`typescript
export async function scrapeRAW2KApify(): Promise<VehicleListing[]> {
  const run = await client.actor('YOUR-USERNAME/raw2k-scraper').call({
    startUrls: ['https://www.raw2k.co.uk/vehicles'],
    maxPages: 10,
  })
  // ... rest stays the same
}

export async function scrapeBCAApify(): Promise<VehicleListing[]> {
  const run = await client.actor('YOUR-USERNAME/bca-scraper').call({
    startUrls: ['https://www.bca.co.uk/search/cars'],
    maxPages: 10,
  })
  // ... rest stays the same
}

// Repeat for Autorola and Manheim
\`\`\`

### Enable Apify Mode in Workflow

**Edit `lib/inngest/functions-enhanced.ts`:**

\`\`\`typescript
// Add import
import {
  scrapeRAW2KApify,
  scrapeBCAApify,
  scrapeAutorolaApify,
  scrapeManheimApify,
} from "../scrapers/apify-scraper"

// Update scraper mode type
const SCRAPER_MODE = (process.env.SCRAPER_MODE || "mock") as "mock" | "api" | "html" | "apify"

// Add apify case
switch (SCRAPER_MODE) {
  case "apify":
    scrapers = [
      scrapeRAW2KApify,
      scrapeBCAApify,
      scrapeAutorolaApify,
      scrapeManheimApify,
    ]
    break
  // ... other cases
}
\`\`\`

## Scheduling & Automation

### Schedule Daily Runs

In Apify Console:

1. Go to actor → Schedules tab
2. Click "Create schedule"
3. Set cron: `0 6 * * *` (6 AM daily)
4. Actor will run automatically

Your Revvdoctor workflow can then fetch the latest dataset:

\`\`\`typescript
// Get dataset from last run
const actor = await client.actor(actorId).get();
const lastRunId = actor.lastRunId;
const { items } = await client.run(lastRunId).dataset().listItems();
\`\`\`

### Webhooks

Get notified when scraping completes:

\`\`\`typescript
const run = await client.actor(actorId).call(input, {
  webhooks: [{
    eventTypes: ['ACTOR.RUN.SUCCEEDED'],
    requestUrl: 'https://revvdoctor.com/api/webhooks/apify',
  }],
});
\`\`\`

## Cost Optimization

### Reduce Costs

**1. Limit page count:**
\`\`\`json
{
  "maxPages": 50  // Don't scrape entire site
}
\`\`\`

**2. Use datacenter proxies:**
\`\`\`json
{
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["SHADER"]  // Cheaper than RESIDENTIAL
  }
}
\`\`\`

**3. Schedule wisely:**
- Run once daily, not hourly
- Run during off-peak hours

**4. Cache results:**
- Store in database
- Only re-scrape when needed

### Cost Examples

| Pages | Proxy Type | Cost |
|-------|-----------|------|
| 100 | Datacenter | $0.025 |
| 100 | Residential | $0.10 |
| 1,000 | Datacenter | $0.25 |
| 1,000 | Residential | $1.00 |

**Recommendation:** Use datacenter proxies for most scraping, residential only if blocked.

## Monitoring & Maintenance

### Monitor Actor Performance

**Apify Console → Actors → Your Actor:**

- View success/failure rates
- Check average run time
- Monitor dataset size
- Review error logs

### Set Up Alerts

**Create alert for failures:**

1. Go to Monitoring tab
2. Create new alert
3. Condition: "Actor run failed"
4. Notification: Email or Slack

### Update Selectors

Sites change their HTML structure. When scraper breaks:

1. Inspect site's current HTML
2. Update selectors in `src/main.js`
3. Test locally: `apify run`
4. Deploy: `apify push`

## Production Checklist

- [ ] Created actors for all 4 auction sites
- [ ] Tested each actor locally
- [ ] Deployed all actors to Apify
- [ ] Updated actor IDs in `lib/scrapers/apify-scraper.ts`
- [ ] Set `SCRAPER_MODE=apify` in environment
- [ ] Added `APIFY_API_KEY` to environment
- [ ] Updated workflow to support Apify mode
- [ ] Tested end-to-end workflow
- [ ] Set up monitoring/alerts
- [ ] Scheduled daily runs (optional)
- [ ] Configured webhooks (optional)

## Troubleshooting

### Actor not found

**Error:** `Actor YOUR-USERNAME/actor-name was not found`

**Fix:** Check actor ID is correct. Go to console.apify.com/actors and copy exact ID.

### Authentication required

**Error:** `Page requires login`

**Fix:** Add login step in requestHandler before scraping.

### Selector not found

**Error:** `Timeout waiting for selector`

**Fix:**
1. Inspect site HTML
2. Update selectors to match current structure
3. Increase timeout: `{ timeout: 60000 }`

### Proxy blocked

**Error:** `403 Forbidden` or `CAPTCHA detected`

**Fix:** Switch to residential proxies:
\`\`\`json
{
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
\`\`\`

## Support Resources

- **Apify Docs:** https://docs.apify.com
- **Actor Examples:** https://apify.com/store
- **Discord:** https://discord.com/invite/jyEM2PRvMU
- **Email:** support@apify.com

## Summary

✅ **Create actors** for each auction site
✅ **Test locally** with `apify run`
✅ **Deploy** with `apify push`
✅ **Update** integration code with actor IDs
✅ **Enable** Apify mode in environment
✅ **Monitor** performance and maintain selectors

This gives you reliable, scalable scraping for ~$10-50/month instead of $200-1200/month for official APIs! 🚀
