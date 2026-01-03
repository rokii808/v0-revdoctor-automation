# Testing the Agent Workflow

This guide shows you how to test the complete agent workflow using mock data.

## ✅ Quick Start (5 minutes)

### 1. Set Environment Variables

Add to your `.env.local` file:

\`\`\`bash
# Use mock data for testing
SCRAPER_MODE=mock

# Your existing OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_PROVIDER=openrouter
AI_MODEL=google/gemini-flash-1.5-8b

# Your existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 2. Restart Your Dev Server

\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

### 3. Test the Full Workflow

**Option A: Manual Trigger via Inngest Dashboard**
1. Go to http://localhost:3000/api/inngest
2. Find "Daily Vehicle Scraper with AI Analysis"
3. Click "Send Event" → "Test Run"
4. Watch the logs

**Option B: Trigger via API** (Coming soon)
\`\`\`bash
curl -X POST http://localhost:3000/api/workflow/trigger \
  -H "Content-Type: application/json"
\`\`\`

### 4. What You'll See

The workflow will:

\`\`\`
🚀 Starting daily scraper (mode: mock)...

📋 Step 1: Loading active dealers
  → Found X dealers

🕷️ Step 2: Scraping (MOCK MODE)
  ✅ RAW2K: 10 vehicles
  ✅ BCA: 10 vehicles
  ✅ Autorola: 10 vehicles
  ✅ Manheim: 10 vehicles
  → Total: 40 vehicles

🤖 Step 3: AI Classification (OpenRouter/Gemini)
  ✓ HEALTHY: ~15 vehicles
  ✗ AVOID: ~25 vehicles
  → Average confidence: 85%

🎯 Step 4: Matching to dealer preferences
  → Matched X vehicles to Y dealers
  → Average match score: 72

💾 Step 5: Saving to database
  → Saved to vehicle_matches table

📧 Step 6: Sending email digests
  → Sent X emails

📊 Step 7: Logging stats
  → Saved to workflow_stats table

✅ Complete!
\`\`\`

---

## 🎯 What Gets Tested

### ✅ Mock Data Includes:

**Healthy Vehicles** (AI should classify as HEALTHY):
- 2019 BMW 3 Series - £18,500
- 2020 Mercedes C-Class - £22,900
- 2018 Audi A4 - £15,800
- 2019 VW Golf - £13,200
- 2020 Ford Focus - £11,500

**Risky Vehicles** (AI should classify as AVOID):
- 2015 BMW X5 - £8,500 (125k miles)
- 2014 Land Rover Discovery - £7,200 (requires work)
- 2013 Audi A6 - £6,800 (multiple issues)

**Moderate Vehicles** (depends on criteria):
- 2017 Nissan Qashqai - £10,200
- 2018 Toyota Corolla - £9,800

### ✅ Features Being Tested:

1. **Scraping** → Mock scraper returns realistic data
2. **AI Classification** → OpenRouter/Gemini analyzes each vehicle
3. **Preference Matching** → Matches vehicles to dealer criteria
4. **Database Storage** → Saves matches to Supabase
5. **Email Digests** → Sends personalized emails (if Resend configured)
6. **Statistics** → Logs workflow performance

---

## 🔍 Verify Results

### Check Database (Supabase Dashboard)

1. **vehicle_matches table**
   \`\`\`sql
   SELECT * FROM vehicle_matches
   ORDER BY created_at DESC
   LIMIT 20;
   \`\`\`
   → Should see matched vehicles with AI classifications

2. **workflow_stats table**
   \`\`\`sql
   SELECT * FROM workflow_stats
   ORDER BY run_date DESC
   LIMIT 5;
   \`\`\`
   → Should see workflow statistics

### Check Logs

- Open browser console or terminal
- Look for workflow execution logs
- Verify AI classification results
- Check match scores

---

## 🚀 Next: Switch to Real APIs

Once you've tested with mock data and everything works:

### 1. Contact Auction Sites

See `lib/scrapers/README.md` for contact information:
- RAW2K: info@raw2k.co.uk
- BCA: partnerships@bca.com
- Autorola: (register dealer account)
- Manheim: manheim.digital@coxautoinc.com

### 2. Get API Keys

Request:
- API endpoint URLs
- Authentication credentials
- Rate limits
- Documentation

### 3. Update Environment Variables

\`\`\`bash
# In .env.local
SCRAPER_MODE=api  # ← Switch to API mode

# Add your API keys
RAW2K_API_KEY=your-actual-key
BCA_API_KEY=your-actual-key
# ... etc
\`\`\`

### 4. Test Production

Run the workflow again - it will now use real APIs!

---

## 📝 Troubleshooting

### No vehicles scraped
**Problem:** `vehicles_scraped: 0`
**Solution:** Check `SCRAPER_MODE=mock` is set

### AI classification failed
**Problem:** `AI classification error`
**Solution:** Verify `OPENROUTER_API_KEY` is correct

### No matches
**Problem:** `total_matches: 0`
**Solution:** Check dealer preferences in database - may be too restrictive

### Email failed
**Problem:** `emails_failed: X`
**Solution:** Add `RESEND_API_KEY` if you want to test emails

---

## 💡 Pro Tips

1. **Start with mock data** - Proves the workflow works
2. **Test AI classification** - Verify Gemini is analyzing vehicles correctly
3. **Check match scoring** - Tune your preference algorithm
4. **Monitor performance** - Check workflow_stats for duration
5. **One API at a time** - Start with RAW2K, add others gradually

---

## 🎉 Success Criteria

You've successfully tested the workflow when:

✅ Mock scraper returns 40 vehicles
✅ AI classifies ~15 as HEALTHY
✅ Vehicles match to dealers
✅ Matches saved to database
✅ Emails sent (if Resend configured)
✅ Stats logged
✅ Workflow completes in <5 minutes

Now you're ready for production APIs! 🚗✨
