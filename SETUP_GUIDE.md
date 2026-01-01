# Environment Setup Guide - Enhanced Workflow

**Version:** 2.0 (AI-Enhanced)
**Date:** 2025-12-29

This guide walks you through setting up all environment variables and services required for the enhanced AI-powered workflow.

---

## Prerequisites

Before starting, create accounts for:
1. ✅ **Supabase** - https://supabase.com (already set up)
2. ✅ **Vercel** - https://vercel.com (already deployed)
3. ✅ **Inngest** - https://inngest.com (already configured)
4. 🆕 **OpenAI** - https://platform.openai.com (NEW - required for AI)
5. 🆕 **Resend** - https://resend.com (NEW - required for emails)

---

## Step 1: OpenAI API Key

### Create OpenAI Account:
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Name it: "Revvdoctor Production"
6. Copy the key (starts with `sk-`)

### Add Credits:
1. Go to **Billing** → **Payment methods**
2. Add a payment method
3. Set up auto-recharge or add initial credits
4. Recommended: $20 initial credit (lasts 3+ months)

### Pricing:
- **GPT-4o-mini:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Expected cost:** ~$0.20 per 1000 vehicles
- **Daily cost:** ~$0.20-0.30
- **Monthly cost:** ~$6-9

### Environment Variable:
\`\`\`bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

---

## Step 2: Resend API Key

### Create Resend Account:
1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

### Get API Key:
1. Navigate to **API Keys** in dashboard
2. Click **"Create API Key"**
3. Name it: "Revvdoctor Production"
4. Copy the key (starts with `re_`)

### Configure Domain (Optional but Recommended):
1. Go to **Domains** in dashboard
2. Add your domain: `revvdoctor.com`
3. Add DNS records provided by Resend:
   \`\`\`
   Type: TXT
   Name: @
   Value: [provided by Resend]

   Type: CNAME
   Name: resend._domainkey
   Value: [provided by Resend]
   \`\`\`
4. Wait for verification (usually 5-10 minutes)
5. Set as default domain

### Update Email "From" Address:
If you verified a custom domain, update in `lib/workflow/email-digest.ts`:
\`\`\`typescript
from: "Revvdoctor <digest@revvdoctor.com>",  // Use your domain
\`\`\`

### Pricing:
- **Free tier:** 3,000 emails/month
- **Paid tier:** $20/month for 50,000 emails
- **For Revvdoctor:** Free tier sufficient unless you have 100+ dealers

### Environment Variable:
\`\`\`bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

---

## Step 3: Configure Environment Variables

You need to set environment variables in **3 places:**

### 3.1 Local Development (`.env.local`)

Create or update `.env.local` in project root:

\`\`\`bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe (existing)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Inngest (existing)
INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=signkey-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cron (existing)
CRON_SECRET=your-secure-random-string-here

# OpenAI (NEW - required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Resend (NEW - required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

**To generate CRON_SECRET if not set:**
\`\`\`bash
openssl rand -base64 32
\`\`\`

### 3.2 Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your `v0-revdoctor-automation` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJxxx... | All |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJxxx... | All |
| `OPENAI_API_KEY` | sk-xxx... | All |
| `RESEND_API_KEY` | re_xxx... | All |
| `STRIPE_SECRET_KEY` | sk_xxx... | All |
| `STRIPE_WEBHOOK_SECRET` | whsec_xxx... | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_xxx... | All |
| `INNGEST_EVENT_KEY` | xxx... | All |
| `INNGEST_SIGNING_KEY` | signkey-xxx... | All |
| `CRON_SECRET` | [your secure string] | All |

5. Click **Save**
6. Redeploy your project for changes to take effect

### 3.3 Inngest Environment Variables

**CRITICAL:** Inngest runs in a separate environment and needs its own copy of variables!

1. Go to https://app.inngest.com
2. Select your project/app
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJxxx... |
| `OPENAI_API_KEY` | sk-xxx... |
| `RESEND_API_KEY` | re_xxx... |

**Important Notes:**
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- ✅ Inngest needs direct database access
- ✅ Don't include Stripe or CRON_SECRET (not needed in Inngest)

5. Click **Save**
6. Inngest will use these for all background jobs

---

## Step 4: Database Migration

Run the SQL migration to create the `workflow_stats` table:

### Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **"New query"**
5. Paste contents of `supabase/migrations/create_workflow_stats_table.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Verify table created in **Table Editor**

### Via Supabase CLI (alternative):
\`\`\`bash
supabase db push
\`\`\`

---

## Step 5: Verify Setup

### 5.1 Test Local Environment

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
\`\`\`

**Check:**
- ✅ No errors in console
- ✅ Can log in
- ✅ Dashboard loads

### 5.2 Test Inngest Health Check

**Via Inngest Dashboard:**
1. Go to https://app.inngest.com
2. Navigate to **Functions**
3. Find `health-check` function
4. Click **"Invoke"**
5. Send event: `workflow/health-check`
6. Check output:
   \`\`\`json
   {
     "healthy": true,
     "checks": {
       "NEXT_PUBLIC_SUPABASE_URL": true,
       "SUPABASE_SERVICE_ROLE_KEY": true,
       "OPENAI_API_KEY": true,
       "RESEND_API_KEY": true,
       "Supabase Connection": true,
       "OpenAI Key Format": true
     }
   }
   \`\`\`

❌ **If any check fails:**
- Verify the environment variable is set in Inngest dashboard
- Check the value is correct (no extra spaces or quotes)
- Save and retry

### 5.3 Test AI Classification

Create a test file `test-ai.ts`:
\`\`\`typescript
import { classifyVehiclesWithAI } from "./lib/analysis/ai-classifier"

const testVehicle = {
  make: "BMW",
  model: "3 Series",
  year: 2019,
  price: 15000,
  mileage: 45000,
  condition: "CAT S",
  auction_site: "RAW2K",
  listing_url: "https://example.com",
  description: "CAT S repaired, good condition",
  images: []
}

async function test() {
  const results = await classifyVehiclesWithAI([testVehicle])
  console.log("AI Classification:", JSON.stringify(results, null, 2))
}

test()
\`\`\`

Run:
\`\`\`bash
npx tsx test-ai.ts
\`\`\`

Expected output:
\`\`\`json
[
  {
    "make": "BMW",
    "model": "3 Series",
    "year": 2019,
    "price": 15000,
    "ai_classification": {
      "verdict": "HEALTHY",
      "minor_fault_type": "Body",
      "reason": "CAT S with structural damage but professionally repaired...",
      "risk_score": 35,
      "confidence": 85,
      "repair_cost_estimate": 2000,
      "profit_potential": 3500
    }
  }
]
\`\`\`

### 5.4 Test Email Sending

Create a test file `test-email.ts`:
\`\`\`typescript
import { sendDailyDigest } from "./lib/workflow/email-digest"

const testRecipient = {
  dealer_id: "test-dealer",
  dealer_name: "Test Dealer",
  email: "your-email@example.com",  // Use your email
  subscription_plan: "startup",
  matches: [
    {
      make: "BMW",
      model: "3 Series",
      year: 2019,
      price: 15000,
      mileage: 45000,
      auction_site: "RAW2K",
      listing_url: "https://example.com",
      match_score: 88,
      match_reasons: ["Very low risk", "£3,500 profit potential"],
      ai_classification: {
        verdict: "HEALTHY",
        minor_fault_type: "Body",
        reason: "CAT S repaired professionally",
        risk_score: 35,
        confidence: 85,
        repair_cost_estimate: 2000,
        profit_potential: 3500
      }
    }
  ]
}

async function test() {
  const result = await sendDailyDigest(testRecipient)
  console.log("Email Result:", result)
}

test()
\`\`\`

Run:
\`\`\`bash
npx tsx test-email.ts
\`\`\`

Check your inbox for the digest email!

---

## Step 6: Manual Workflow Test

### Trigger Manual Scrape:

**Via Inngest Dashboard:**
1. Go to https://app.inngest.com
2. Navigate to **Functions**
3. Find `trigger-manual-scrape` function
4. Click **"Invoke"**
5. Send event:
   \`\`\`json
   {
     "name": "scraper/manual-trigger",
     "data": {
       "admin_user_id": "your-user-id"
     }
   }
   \`\`\`
6. Monitor execution:
   - View step-by-step progress
   - Check logs for each step
   - Verify completion

**Expected Timeline:**
- Step 1 (Load dealers): ~5 seconds
- Step 2 (Scrape sites): ~3-5 minutes
- Step 3 (AI classification): ~5-8 minutes
- Step 4 (Match preferences): ~30 seconds
- Step 5 (Save to DB): ~10 seconds
- Step 6 (Send emails): ~2-3 minutes
- Step 7 (Log stats): ~5 seconds
- **Total: ~12-15 minutes**

### Verify Results:

**In Supabase:**
\`\`\`sql
-- Check workflow stats
SELECT * FROM workflow_stats ORDER BY run_date DESC LIMIT 1;

-- Check saved matches
SELECT COUNT(*) FROM vehicle_matches WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check matches per dealer
SELECT dealer_id, COUNT(*) as match_count
FROM vehicle_matches
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY dealer_id
ORDER BY match_count DESC;
\`\`\`

**In Resend Dashboard:**
1. Go to https://resend.com/emails
2. Verify emails sent
3. Check delivery status

---

## Step 7: Enable Automated Cron

The workflow is configured to run automatically at **6 AM daily**.

### Verify Cron Schedule:
1. Go to https://app.inngest.com
2. Navigate to **Functions**
3. Find `daily-scraper-enhanced`
4. Check schedule: `0 6 * * *` (6 AM daily)
5. Ensure status is **Active**

### First Automated Run:
- Wait until 6 AM next day
- Check Inngest dashboard for execution
- Verify workflow completed successfully
- Check dealer emails were sent

---

## Troubleshooting

### "Invalid API key" Error:

**Symptom:** Workflow fails at AI classification or email sending

**Causes:**
1. API key not set in Inngest dashboard
2. API key has extra spaces or quotes
3. API key is invalid or expired

**Fix:**
1. Go to Inngest dashboard → Environment Variables
2. Verify `OPENAI_API_KEY` starts with `sk-`
3. Verify `RESEND_API_KEY` starts with `re_`
4. Remove any spaces or quotes
5. Save and retry

### "Supabase connection failed" Error:

**Symptom:** Workflow fails at "get-active-dealers" step

**Causes:**
1. Supabase keys not set in Inngest
2. Using anon key instead of service role key

**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` in Inngest
2. Verify `SUPABASE_SERVICE_ROLE_KEY` in Inngest (not anon key)
3. Test connection via health check

### No Emails Received:

**Symptom:** Workflow completes but no emails sent

**Causes:**
1. Dealers have no matches
2. Resend API key invalid
3. Email in spam folder

**Fix:**
1. Check `workflow_stats` table for `emails_sent` count
2. Check Resend dashboard for email status
3. Lower dealer preference restrictions to get matches
4. Check spam folder

### OpenAI Rate Limit:

**Symptom:** AI classification fails with "rate limit exceeded"

**Causes:**
1. Too many requests in short time
2. Free tier limits reached

**Fix:**
1. Add payment method to OpenAI account
2. Increase batch delay in `ai-classifier.ts`:
   \`\`\`typescript
   // After each batch
   await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds
   \`\`\`

---

## Cost Monitoring

### OpenAI Usage:
1. Go to https://platform.openai.com/usage
2. Monitor daily spend
3. Set up billing alerts
4. Expected: ~$0.20-0.30 per day

### Resend Usage:
1. Go to https://resend.com/overview
2. Monitor email count
3. Track delivery rate
4. Expected: 20-50 emails per day

### Total Monthly Cost:
- OpenAI: ~$6-9
- Resend: $0 (free tier)
- Inngest: $0 (free tier)
- **Total: ~$6-9/month**

---

## Security Best Practices

### Protect API Keys:
- ✅ Never commit API keys to git
- ✅ Use environment variables only
- ✅ Rotate keys every 90 days
- ✅ Use separate keys for dev/production

### Monitor Usage:
- ✅ Set up billing alerts (OpenAI, Resend)
- ✅ Review Inngest logs weekly
- ✅ Check for unusual activity

### Access Control:
- ✅ Limit Inngest dashboard access
- ✅ Use team accounts for shared access
- ✅ Enable 2FA on all accounts

---

## Next Steps

After setup is complete:

1. ✅ Run health check to verify all services
2. ✅ Test manual workflow trigger
3. ✅ Wait for first automated run (6 AM)
4. ✅ Monitor `workflow_stats` table
5. ✅ Check dealer feedback on emails
6. ✅ Adjust AI prompts if needed
7. ✅ Tune preference matching scores
8. ✅ Build admin monitoring dashboard (future)

---

## Support

**Issues with setup?**
1. Check Inngest logs for detailed errors
2. Review this guide step by step
3. Test individual components (AI, email) separately
4. Verify all environment variables in 3 places

**Documentation:**
- Enhanced Workflow: `ENHANCED_WORKFLOW.md`
- Architecture: `ARCHITECTURE_ANALYSIS.md`
- Onboarding: `ONBOARDING_FLOW.md`

---

## Checklist

Use this checklist to ensure complete setup:

- [ ] Created OpenAI account and got API key
- [ ] Created Resend account and got API key
- [ ] Added `OPENAI_API_KEY` to `.env.local`
- [ ] Added `RESEND_API_KEY` to `.env.local`
- [ ] Added `OPENAI_API_KEY` to Vercel
- [ ] Added `RESEND_API_KEY` to Vercel
- [ ] Added `OPENAI_API_KEY` to Inngest dashboard
- [ ] Added `RESEND_API_KEY` to Inngest dashboard
- [ ] Added Supabase keys to Inngest dashboard
- [ ] Ran database migration (`create_workflow_stats_table.sql`)
- [ ] Ran health check (all checks passed)
- [ ] Tested AI classification locally
- [ ] Tested email sending locally
- [ ] Triggered manual workflow run
- [ ] Verified results in database
- [ ] Verified emails sent via Resend
- [ ] Enabled automated cron (6 AM daily)

**Setup complete! 🎉**
