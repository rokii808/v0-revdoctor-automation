# RevvDoctor Multi-Site Scraper - Quick Start Guide

## ✅ What You Have Now

Your Inngest credentials are configured:
- **Event Key**: `6WbIZSjNbAsqL3THM_9eISGsPVDGkJck5ssF2MBNTPEUePeXpMawQBcYyhbJbAVavMiZmDhm2fblNArh8QFGTg`
- **Signing Key**: `signkey-prod-08440fda60c5ae9f42ccd962b91c17bd45d0be9051c8249477d5953980f65a75`

These are already added to your `.env.local` file! ✅

---

## 🚀 5-Minute Setup

### Step 1: Complete Your .env.local (2 minutes)

You need to fill in the remaining environment variables. Open `.env.local` and update:

```bash
# Required - Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional - For AI analysis (can use heuristic fallback)
OPENAI_API_KEY=sk-...

# Optional - For payments (not needed for scraper testing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional - For email (not needed for scraper testing)
RESEND_API_KEY=re_...

# Required - Generate random string
CRON_SECRET=your_random_secure_cron_secret

# Inngest - Already configured ✅
INNGEST_EVENT_KEY=6WbIZSjNbAsqL3THM_9eISGsPVDGkJck5ssF2MBNTPEUePeXpMawQBcYyhbJbAVavMiZmDhm2fblNArh8QFGTg
INNGEST_SIGNING_KEY=signkey-prod-08440fda60c5ae9f42ccd962b91c17bd45d0be9051c8249477d5953980f65a75
```

**Quick way to generate CRON_SECRET:**
```bash
# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# On Mac/Linux
openssl rand -hex 32
```

### Step 2: Run Database Migrations (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy entire contents of `database-migrations.sql`
6. Paste into SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see:
```
✅ user_preferences created | row_count: 0
✅ vehicle_matches created | row_count: 0
```

### Step 3: Start Development Servers (1 minute)

**Terminal 1** - Start Next.js dev server:
```bash
cd "C:\Users\taiwo\Downloads\v0-revdoctor-automation-main (1)\v0-revdoctor-automation-main"
npm run dev
```

Wait for:
```
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

**Terminal 2** - Start Inngest dev server:
```bash
cd "C:\Users\taiwo\Downloads\v0-revdoctor-automation-main (1)\v0-revdoctor-automation-main"
npx inngest-cli@latest dev
```

Wait for:
```
✓ Inngest dev server running!
  View functions: http://localhost:8288
```

---

## 🧪 Testing the Scraper

### Test 1: Verify Inngest Connection

1. Open http://localhost:8288 in your browser
2. You should see:
   - **Functions** tab with 2 functions:
     - `daily-scraper` (Daily Multi-Site Vehicle Scraper)
     - `manual-scraper` (Manual Vehicle Scraper Trigger)
   - Status: **Connected** ✅

### Test 2: Trigger Manual Scrape

**Option A: Via Inngest Dashboard (Easiest)**

1. Go to http://localhost:8288
2. Click on **Functions** tab
3. Click on `manual-scraper`
4. Click **Invoke Function**
5. Use this test payload:
   ```json
   {
     "sites": ["RAW2K"]
   }
   ```
6. Click **Invoke**
7. Watch the execution in real-time!

**Option B: Via API Call**

```bash
curl -X POST http://localhost:3000/api/inngest/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "scraper/trigger.manual",
    "data": {
      "sites": ["RAW2K"]
    }
  }'
```

### Test 3: Check Results

After the scraper runs (should take 10-30 seconds), check Supabase:

1. Go to Supabase Dashboard → **Table Editor**
2. Select `vehicle_matches` table
3. You should see new rows with:
   - `auction_site`: "RAW2K"
   - `make`, `model`, `year`, `price`, etc.
   - `match_score`: 0-100
   - `verdict`: "HEALTHY" or "AVOID"

**If you see vehicles** → ✅ Success! Scraper is working!

---

## 📊 What Each Test Does

### Manual Scraper Flow

```
1. You trigger → scraper/trigger.manual event
2. Inngest receives event
3. Runs scrapeAllSites() function
4. Fetches https://www.raw2k.co.uk/vehicles
5. Parses HTML with regex patterns
6. Analyzes each vehicle (AI or heuristic)
7. Calculates match scores
8. Inserts into vehicle_matches table
9. Returns results
```

### Daily Scraper Flow (Automatic)

```
1. Inngest triggers at 6:00 AM UTC daily
2. Scrapes ALL enabled sites in parallel
3. Gets all active dealers from database
4. For each dealer:
   - Loads their preferences
   - Matches vehicles to preferences
   - Only saves vehicles with match_score >= 50
5. Marks which vehicles were sent
6. Sends email digest (if enough vehicles found)
```

---

## 🔍 Troubleshooting

### Issue: "Inngest client not configured"

**Fix:** Make sure both environment variables are set:
```bash
# Check in your terminal:
echo $INNGEST_EVENT_KEY
echo $INNGEST_SIGNING_KEY

# Should output your keys
# If not, restart your dev server after updating .env.local
```

### Issue: "Failed to connect to Inngest"

**Fix:** Make sure Inngest dev server is running on port 8288:
```bash
# Terminal 2:
npx inngest-cli@latest dev

# Should see:
# ✓ Inngest dev server running at http://localhost:8288
```

### Issue: "No vehicles scraped"

**Possible causes:**
1. **RAW2K changed HTML** - Check console logs for "HTML pattern not found"
2. **Network issue** - Check console logs for fetch errors
3. **Regex pattern mismatch** - See scraper logs in Inngest dashboard

**Debug steps:**
1. Check Inngest dashboard → View function execution logs
2. Look for errors in the execution timeline
3. Check console output in Terminal 1 (Next.js dev server)

### Issue: "Supabase error: relation 'user_preferences' does not exist"

**Fix:** You haven't run the database migrations yet.
1. Go to Supabase SQL Editor
2. Run `database-migrations.sql`
3. Restart dev server

### Issue: "Database insert failed: RLS policy violation"

**Fix:** The scraper uses service role key which bypasses RLS. Check that your `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `.env.local`.

---

## 🎯 Next Steps After Testing

Once the scraper is working locally:

### 1. Customize Other Scrapers (Optional)

Update these files with actual HTML patterns:
- `lib/scrapers/autorola.ts` - Autorola scraper
- `lib/scrapers/bca.ts` - BCA scraper
- `lib/scrapers/manheim.ts` - Manheim scraper

See `MULTI_SITE_SCRAPER_SETUP.md` for detailed instructions.

### 2. Create User Preferences

Insert test preferences to see matching in action:

```sql
-- Run in Supabase SQL Editor
INSERT INTO user_preferences (
  dealer_id,
  preferred_makes,
  min_year,
  max_price,
  max_mileage,
  enabled_auction_sites
)
VALUES (
  (SELECT id FROM dealers LIMIT 1), -- Your dealer ID
  ARRAY['BMW', 'Audi', 'Mercedes'],
  2018,
  30000,
  60000,
  ARRAY['RAW2K', 'Autorola']
);
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Configure Inngest webhook: https://your-app.vercel.app/api/inngest
```

### 4. Monitor Production

- Inngest dashboard: https://app.inngest.com/
- View daily scraper runs
- Check for errors
- See execution logs

---

## 📚 Documentation

- **Full setup guide**: `MULTI_SITE_SCRAPER_SETUP.md` (800+ lines)
- **Security fixes**: `SECURITY_AUDIT.md`
- **Implementation plan**: `IMPLEMENTATION_CHECKLIST.md`
- **Architecture**: `ARCHITECTURE.md`

---

## 🆘 Getting Help

**Check logs in this order:**

1. **Inngest Dashboard** (http://localhost:8288)
   - See function execution status
   - View detailed error messages
   - Check execution timeline

2. **Terminal 1** (Next.js dev server)
   - Check for console.log output
   - Look for fetch errors
   - See database errors

3. **Supabase Dashboard → Logs**
   - Database query errors
   - RLS policy violations
   - Table access issues

4. **Browser Console** (F12)
   - Frontend errors
   - API call failures
   - Network issues

---

## ✨ Summary

You're all set up! Here's what to do right now:

1. ✅ **Inngest credentials configured** (already done!)
2. 📝 **Fill in remaining .env.local variables** (Supabase, CRON_SECRET)
3. 🗄️ **Run database-migrations.sql** in Supabase
4. 🚀 **Start both dev servers** (Next.js + Inngest)
5. 🧪 **Test manual scraper** via http://localhost:8288
6. 🎉 **Celebrate!** Your multi-site scraper is working!

The daily scraper will automatically run at 6:00 AM UTC once deployed to production. For now, test everything locally using the manual trigger.

Good luck! 🚀
