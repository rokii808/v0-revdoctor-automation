# Inngest "Invalid API key" Error - Fix Instructions

## Problem

Your Inngest function "Daily Multi-Site Vehicle Scraper" is failing with error: **"Invalid API key"**

Looking at the error trace, this is happening during the `get-active-dealers` step, which queries Supabase.

## Root Cause

The error is caused by **missing or invalid Supabase credentials** in your Inngest environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Inngest runs in a separate environment from your Next.js app, so you need to configure these environment variables **in Inngest's dashboard**, not just in Vercel/your `.env` file.

##  Solution

### Step 1: Set Environment Variables in Inngest

1. Go to your Inngest dashboard: https://app.inngest.com/
2. Navigate to your "revvdoctor" app
3. Go to **Settings → Environment Variables**
4. Add the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
\`\`\`

**Where to find these values:**
- Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (⚠️ Keep this secret!)

### Step 2: Update Inngest Function (Better Error Handling)

I've prepared an improved version of the Inngest function with:
- ✅ Environment variable validation
- ✅ Better error messages
- ✅ Graceful fallbacks for non-critical failures

**File to update:** `lib/inngest/functions.ts`

Add this validation step at the beginning of the `dailyScraperJob`:

\`\`\`typescript
// Step 0: Validate environment variables
await step.run("validate-config", async () => {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    const errorMsg = \`Missing required environment variables: \${missing.join(", ")}\`
    console.error(\`[Inngest] \${errorMsg}\`)
    throw new Error(errorMsg)
  }

  console.log("[Inngest] Environment validation passed")
  return { validated: true }
})
\`\`\`

### Step 3: Improve Error Handling in Database Queries

Wrap the `get-active-dealers` step with better error handling:

\`\`\`typescript
const dealers = await step.run("get-active-dealers", async () => {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("dealers")
      .select("*")
      .eq("subscription_status", "active")

    if (error) {
      console.error("[Inngest] Database error fetching dealers:", error)
      throw new Error(\`Database error: \${error.message || "Unknown error"}\`)
    }

    console.log(\`[Inngest] Found \${data?.length || 0} active dealers\`)
    return data || []
  } catch (error) {
    console.error("[Inngest] Failed to fetch dealers:", error)
    throw error
  }
})
\`\`\`

### Step 4: Test the Fix

After setting environment variables in Inngest:

1. Trigger a test run in Inngest dashboard
2. Or wait for the next scheduled run (6 AM daily)
3. Check the logs - you should now see either:
   - ✅ "Environment validation passed" (if vars are set)
   - ❌ "Missing required environment variables: ..." (clear error message)

## Alternative: Quick Test Without Inngest UI

If you want to test locally first:

\`\`\`bash
# Set env vars in your terminal
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run Next.js dev server
npm run dev

# In another terminal, trigger the Inngest function via API
curl -X GET http://localhost:3000/api/cron/scrape-all-sites \
  -H "Authorization: Bearer ${CRON_SECRET}"
\`\`\`

## Common Issues

### Issue: Still getting "Invalid API key" after setting env vars

**Solution:**
- Restart your Inngest function/deployment
- Check that you're setting vars in the correct Inngest environment (dev vs prod)
- Verify the keys are correct (no extra spaces, correct format)

### Issue: "Database error: Unknown error"

**Solution:**
- Check Supabase service is running
- Verify the `dealers` table exists
- Check Row-Level Security policies aren't blocking service role access

### Issue: Environment variables work in Next.js but not in Inngest

**Solution:**
- Inngest runs in a completely separate environment
- You MUST set env vars in Inngest dashboard, not just Vercel/local .env
- They are independent systems

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `SUPABASE_SERVICE_ROLE_KEY` to Git
- Only use service role key on the backend (Inngest, API routes)
- Use anon key for client-side operations
- Rotate keys if accidentally exposed

## Full Updated Function

For your reference, here's what the complete updated `dailyScraperJob` should look like:

\`\`\`typescript
export const dailyScraperJob = inngest.createFunction(
  { id: "daily-scraper", name: "Daily Multi-Site Vehicle Scraper" },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    // Step 0: Validate config
    await step.run("validate-config", async () => {
      // ... validation code from above ...
    })

    // Step 1: Scrape sites
    const scrapedData = await step.run("scrape-all-sites", async () => {
      try {
        return await scrapeAllSites()
      } catch (error) {
        console.error("[Inngest] Scraping error:", error)
        throw error
      }
    })

    // Step 2: Get dealers
    const dealers = await step.run("get-active-dealers", async () => {
      try {
        // ... improved error handling from above ...
      } catch (error) {
        console.error("[Inngest] Failed to fetch dealers:", error)
        throw error
      }
    })

    // ... rest of function ...
  }
)
\`\`\`

## Next Steps

1. ✅ Set environment variables in Inngest dashboard
2. ✅ Update `lib/inngest/functions.ts` with validation code
3. ✅ Commit and push changes
4. ✅ Redeploy to production
5. ✅ Test the function
6. ✅ Monitor logs for success

---

**Need Help?**
- Check Inngest docs: https://www.inngest.com/docs/platform/environment-variables
- Check Supabase docs: https://supabase.com/docs/guides/api#api-url-and-keys
