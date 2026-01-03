# Resend Multi-Email Debugging Guide

This guide shows you how to debug and test sending emails to multiple recipients using Resend in Step 6 of the workflow.

## 🔍 How Multi-Email Sending Works

### Current Implementation

**File:** `lib/workflow/email-digest.ts`

Your code **already supports sending to multiple emails**! Here's how:

\`\`\`typescript
export async function sendDigestBatch(
  recipients: DigestRecipient[]
): Promise<SendDigestResult[]> {
  // Send in parallel but limit concurrency
  const BATCH_SIZE = 5 // Send 5 emails at a time

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(recipient => sendDailyDigest(recipient))
    )
    results.push(...batchResults)

    // 1 second delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
\`\`\`

**How it works:**
1. Takes array of dealers (email recipients)
2. Sends **5 emails in parallel**
3. Waits 1 second between batches
4. Returns success/failure for each email

---

## ✅ Step 1: Get a Resend API Key

### Option A: Free Tier (100 emails/day)

1. Go to **https://resend.com/signup**
2. Sign up with email
3. Verify your email
4. Go to **API Keys**: https://resend.com/api-keys
5. Click **"Create API Key"**
6. Copy the key (starts with `re_...`)

**Free tier limits:**
- ✅ 100 emails per day
- ✅ 1 sender domain
- ✅ All features

### Option B: Paid (if you need more)

- **$20/month** = 50,000 emails
- Multiple domains
- Better deliverability

---

## 📧 Step 2: Verify Your Sender Domain

Resend requires you to verify the domain you're sending from.

### Quick Setup (Testing)

**Use Resend's test domain** (immediate, no verification needed):

\`\`\`bash
# In your code
from: "Revvdoctor <onboarding@resend.dev>"
\`\`\`

✅ Works immediately
❌ May land in spam
❌ Not professional

### Production Setup (Recommended)

**Verify your own domain:**

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `revvdoctor.com`)
4. Add the DNS records Resend provides:
   \`\`\`
   TXT record: resend._domainkey → [value from Resend]
   CNAME: em → [value from Resend]
   \`\`\`
5. Wait 5-15 minutes for DNS propagation
6. Click **"Verify"** in Resend

Then use:
\`\`\`typescript
from: "Revvdoctor <digest@revvdoctor.com>"
\`\`\`

---

## 🧪 Step 3: Test with Multiple Emails

### Test 1: Send to 2 Test Emails

Create a simple test file:

\`\`\`typescript
// test-resend.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

async function testMultipleEmails() {
  const emails = [
    "test1@youremail.com",
    "test2@youremail.com",
  ]

  console.log(`Sending to ${emails.length} recipients...`)

  for (const email of emails) {
    const { data, error } = await resend.emails.send({
      from: "Revvdoctor <onboarding@resend.dev>", // Use this for testing
      to: email,
      subject: "Test Email from Revvdoctor",
      html: "<h1>Hello!</h1><p>This is a test email.</p>",
    })

    if (error) {
      console.error(`❌ Failed to send to ${email}:`, error)
    } else {
      console.log(`✅ Sent to ${email} (ID: ${data?.id})`)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

testMultipleEmails()
\`\`\`

Run it:
\`\`\`bash
npx tsx test-resend.ts
\`\`\`

### Test 2: Use the Real Workflow Function

\`\`\`typescript
import { sendDigestBatch } from "@/lib/workflow/email-digest"
import type { DigestRecipient } from "@/lib/workflow/email-digest"

const testRecipients: DigestRecipient[] = [
  {
    dealer_id: "test-1",
    dealer_name: "Test Dealer 1",
    email: "your-email-1@gmail.com",
    matches: [/* your mock vehicle matches */],
    subscription_plan: "basic",
  },
  {
    dealer_id: "test-2",
    dealer_name: "Test Dealer 2",
    email: "your-email-2@gmail.com",
    matches: [/* your mock vehicle matches */],
    subscription_plan: "pro",
  },
]

const results = await sendDigestBatch(testRecipients)
console.log("Results:", results)
\`\`\`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid API key"

**Error:**
\`\`\`
Error: You must provide an API key
\`\`\`

**Solution:**
\`\`\`bash
# Check your .env.local
echo $RESEND_API_KEY

# Should start with re_
# If not set, add it:
RESEND_API_KEY=re_your_key_here
\`\`\`

Restart your dev server after adding the key.

---

### Issue 2: Emails Not Arriving

**Symptoms:** Code runs successfully but no emails received

**Debug steps:**

1. **Check Resend Logs**
   - Go to https://resend.com/emails
   - See all sent emails with status
   - Click email to see delivery details

2. **Check Spam Folder**
   - Test emails often go to spam
   - Mark as "Not Spam" to train filters

3. **Check "from" address**
   - Must use verified domain in production
   - Use `onboarding@resend.dev` for testing

4. **Add console logs:**
   \`\`\`typescript
   console.log("[Email] Sending to:", recipient.email)
   console.log("[Email] Result:", data)
   console.log("[Email] Error:", error)
   \`\`\`

---

### Issue 3: Rate Limit Exceeded

**Error:**
\`\`\`
429: Too Many Requests
\`\`\`

**Solution:**

Your code already has rate limiting! Adjust batch size:

\`\`\`typescript
// In lib/workflow/email-digest.ts
const BATCH_SIZE = 3  // ← Reduce from 5 to 3

// Or increase delay between batches:
await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds
\`\`\`

**Free tier limits:**
- 100 emails per day
- 2 emails per second

---

### Issue 4: Some Emails Succeed, Others Fail

**Symptoms:** Inconsistent delivery

**Debug with detailed logging:**

\`\`\`typescript
const results = await sendDigestBatch(recipients)

// Check each result
results.forEach((result, index) => {
  if (result.success) {
    console.log(`✅ [${index}] ${result.email} - Message ID: ${result.message_id}`)
  } else {
    console.error(`❌ [${index}] ${result.email} - Error: ${result.error}`)
  }
})

// Get stats
const stats = getDigestStats(results)
console.log(`
  Total: ${stats.total}
  Sent: ${stats.sent}
  Failed: ${stats.failed}
  Skipped: ${stats.skipped}
  Success Rate: ${stats.success_rate}%
`)
\`\`\`

---

## 📊 Step 4: Monitor in Resend Dashboard

### Real-Time Monitoring

Go to: https://resend.com/emails

You'll see:
- ✅ **Delivered** - Email successfully sent
- ⏳ **Pending** - Being processed
- ❌ **Bounced** - Invalid email address
- 📧 **Opened** - Recipient opened email (if tracking enabled)

### Webhook Setup (Advanced)

Get real-time notifications when emails are delivered:

1. Go to **Webhooks** in Resend
2. Add endpoint: `https://your-app.com/api/webhooks/resend`
3. Select events: `email.sent`, `email.delivered`, `email.bounced`

Create webhook handler:
\`\`\`typescript
// app/api/webhooks/resend/route.ts
export async function POST(request: Request) {
  const event = await request.json()

  console.log("Resend webhook:", event.type)

  if (event.type === "email.delivered") {
    console.log(`✅ Email delivered to ${event.data.to}`)
  } else if (event.type === "email.bounced") {
    console.error(`❌ Email bounced: ${event.data.to}`)
  }

  return new Response("OK")
}
\`\`\`

---

## 🧪 Complete Test Script

Create `scripts/test-email-workflow.ts`:

\`\`\`typescript
import { sendDigestBatch, getDigestStats } from "@/lib/workflow/email-digest"

async function testEmailWorkflow() {
  console.log("🧪 Testing Email Workflow...")

  const testRecipients = [
    {
      dealer_id: "test-1",
      dealer_name: "John's Auto Sales",
      email: "your-test-email-1@gmail.com", // ← Change this
      subscription_plan: "basic",
      matches: [
        {
          make: "BMW",
          model: "3 Series",
          year: 2019,
          price: 18500,
          mileage: 42000,
          auction_site: "RAW2K",
          url: "https://www.raw2k.co.uk/vehicle/bmw-test",
          match_score: 85,
          match_reasons: ["Low mileage", "Good price", "Preferred make"],
          ai_classification: {
            verdict: "HEALTHY",
            risk_score: 15,
            confidence: 92,
            repair_cost_estimate: 500,
            profit_potential: 3500,
            minor_fault_type: "Service light",
            reason: "Excellent condition with minor service needed",
          },
        },
      ],
    },
    {
      dealer_id: "test-2",
      dealer_name: "Sarah's Motors",
      email: "your-test-email-2@gmail.com", // ← Change this
      subscription_plan: "pro",
      matches: [
        {
          make: "Audi",
          model: "A4",
          year: 2020,
          price: 22000,
          mileage: 35000,
          auction_site: "BCA",
          url: "https://www.bca.co.uk/vehicle/audi-test",
          match_score: 78,
          match_reasons: ["Excellent condition", "Low mileage"],
          ai_classification: {
            verdict: "HEALTHY",
            risk_score: 18,
            confidence: 88,
            repair_cost_estimate: 300,
            profit_potential: 4200,
            minor_fault_type: "Tyres",
            reason: "Great value with minimal repairs needed",
          },
        },
      ],
    },
  ]

  console.log(`\n📧 Sending to ${testRecipients.length} test recipients...`)

  const results = await sendDigestBatch(testRecipients)

  console.log("\n📊 Results:")
  results.forEach((result, i) => {
    const status = result.success ? "✅" : "❌"
    console.log(`  ${status} ${result.email} - ${result.success ? result.message_id : result.error}`)
  })

  const stats = getDigestStats(results)
  console.log(`\n📈 Stats:`)
  console.log(`  Total: ${stats.total}`)
  console.log(`  Sent: ${stats.sent}`)
  console.log(`  Failed: ${stats.failed}`)
  console.log(`  Success Rate: ${stats.success_rate}%`)

  console.log("\n✅ Test complete! Check your inbox(es)")
}

testEmailWorkflow()
\`\`\`

Run it:
\`\`\`bash
npx tsx scripts/test-email-workflow.ts
\`\`\`

---

## ✅ Production Checklist

Before going live with multi-email sending:

- [ ] Resend API key added to `.env`
- [ ] Sender domain verified in Resend
- [ ] Test emails sent successfully
- [ ] Checked Resend dashboard for delivery status
- [ ] Tested with 2-3 emails first
- [ ] Confirmed emails not in spam
- [ ] Rate limiting configured (5 emails/batch, 1s delay)
- [ ] Error handling tested (invalid email addresses)
- [ ] Logs show successful sends

---

## 💡 Pro Tips

1. **Start Small**: Test with 2 emails first, then scale to 10, then 50+
2. **Check Logs**: Always log email send results for debugging
3. **Monitor Dashboard**: Use Resend dashboard to see delivery in real-time
4. **Warm Up**: Gradually increase email volume over days (helps deliverability)
5. **Use Webhooks**: Get instant notifications of bounces/failures
6. **Test Spam**: Send to Gmail, Outlook, Yahoo to test spam filters
7. **Beautiful Emails**: Your HTML template is already optimized!

---

## 🚀 Ready to Test!

1. Add `RESEND_API_KEY` to `.env.local`
2. Run the mock workflow with `SCRAPER_MODE=mock`
3. Workflow will send emails to all matched dealers
4. Check Resend dashboard to see emails being sent
5. Verify delivery in recipients' inboxes

Your code is production-ready for multi-email sending! 🎉
