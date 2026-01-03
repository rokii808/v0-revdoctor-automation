# Brevo + Amazon SES Setup Guide

Your app now supports **3 email providers** with automatic switching based on volume!

## 🎯 Strategy

**Start:** Brevo (300 emails/day FREE)
**Scale:** Amazon SES ($0.10 per 1,000 emails)

---

## 🚀 Quick Start: Brevo (5 minutes)

### Step 1: Create Free Brevo Account

1. Go to **https://app.brevo.com/account/register**
2. Sign up (no credit card required)
3. Verify your email
4. You're done! 🎉

**FREE tier includes:**
- ✅ **300 emails per day** (forever!)
- ✅ Unlimited contacts
- ✅ Email templates
- ✅ Analytics & tracking
- ✅ API access

---

### Step 2: Get Your API Key

1. Go to **https://app.brevo.com/settings/keys/api**
2. Click **"Create a new API key"**
3. Name it: `RevvDoctor Production`
4. Copy the key (starts with `xkeysib-...`)

**Add to `.env.local`:**
```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-your-key-here-1234567890abcdef
```

---

### Step 3: Verify Sender Domain (Optional for Testing)

**For testing** - Use Brevo's default domain:
```typescript
from: "Revvdoctor <no-reply@smtp-relay.brevo.com>"
```
✅ Works immediately, no setup needed

**For production** - Add your own domain:

1. Go to **https://app.brevo.com/senders/domain/list**
2. Click **"Add a new domain"**
3. Enter `revvdoctor.com`
4. Add DNS records (they'll give you exact values):
   ```
   TXT: brevo-code → [value from Brevo]
   TXT: v=DKIM1; k=rsa; p=... → [value from Brevo]
   ```
5. Wait 5-15 minutes for verification
6. Use: `from: "Revvdoctor <digest@revvdoctor.com>"`

---

### Step 4: Test It!

Add to `.env.local`:
```bash
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-your-actual-key
SCRAPER_MODE=mock
```

Run the workflow - emails will be sent via Brevo! Check logs:
```
[Email] Sending via BREVO to dealer@example.com
[Email] Successfully sent to dealer@example.com (ID: abc123)
```

---

## 📊 When to Switch to Amazon SES

### Brevo is FREE for:
- Up to **300 emails/day**
- = **9,000 emails/month**
- = **90 dealers** getting daily digests (100 dealers × 30 days = 3,000 emails)

### Switch to SES when:
- ❌ You have **100+ dealers** (exceeds 300/day)
- ❌ Sending multiple emails per dealer
- ❌ Need lower latency

**At 100 dealers:**
- Brevo: $25/month (20k emails included)
- Amazon SES: **$3/month** (100 dealers × 30 days × $0.10/1k = $3)

**At 1,000 dealers:**
- Brevo: $115/month
- Amazon SES: **$30/month** 🏆

---

## 🔄 Switching to Amazon SES

### Step 1: Create AWS Account

1. Go to **https://aws.amazon.com/ses/**
2. Click "Create an AWS Account"
3. Follow signup (credit card required, but won't be charged on free tier)
4. Verify your email

---

### Step 2: Request Production Access

⚠️ **IMPORTANT:** SES starts in "Sandbox Mode" (can only send to verified emails)

**Request production access:**
1. Go to AWS Console → **Simple Email Service**
2. Click **"Request production access"**
3. Fill out form:
   - **Use case:** Transactional emails (vehicle digest alerts)
   - **Expected volume:** 100-1000 emails/day
   - **Bounce handling:** Yes, we monitor bounces
4. Submit (usually approved in 24 hours)

---

### Step 3: Verify Sender Domain

1. In SES Console, go to **"Verified identities"**
2. Click **"Create identity"**
3. Choose **"Domain"**
4. Enter `revvdoctor.com`
5. Add DNS records to your domain:
   ```
   TXT: _amazonses → [verification code]
   CNAME: [random]._domainkey → [value from AWS]
   MX: (optional for bounce handling)
   ```
6. Wait for verification (5-15 minutes)

---

### Step 4: Create IAM User for SES

1. Go to **IAM** → **Users** → **Create user**
2. Name: `revvdoctor-ses-sender`
3. Attach policy: **AmazonSESFullAccess** (or custom policy below)
4. Create user
5. Go to **Security credentials** → **Create access key**
6. Choose **"Application running outside AWS"**
7. Copy:
   - Access Key ID
   - Secret Access Key

**Custom policy (more secure):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### Step 5: Configure Environment Variables

Add to `.env.local`:
```bash
# Switch to SES
EMAIL_PROVIDER=ses

# AWS credentials
AWS_ACCESS_KEY_ID=AKIA...your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1

# Your verified sender
# from: "Revvdoctor <digest@revvdoctor.com>"
```

---

### Step 6: Test SES

Run your workflow - check logs:
```
[Email] Sending via SES to dealer@example.com
[Email] Successfully sent to dealer@example.com (ID: 0123456789...)
```

Monitor in **SES Console** → **Email sending** → **Sending statistics**

---

## 🔀 Automatic Provider Switching (Future)

You can implement auto-switching based on daily volume:

```typescript
// lib/email/auto-switch.ts
export async function getOptimalProvider(dailyCount: number) {
  if (dailyCount <= 300) return "brevo"  // Free tier
  if (dailyCount <= 1000) return "ses"   // Cost-effective
  return "ses" // Scale infinitely
}
```

Update `.env.local` dynamically or use a database setting.

---

## 📊 Cost Comparison Calculator

| Daily Emails | Monthly Emails | Brevo Cost | SES Cost | Best Choice |
|-------------|----------------|------------|----------|-------------|
| 100 | 3,000 | **FREE** ✅ | FREE | Brevo |
| 300 | 9,000 | **FREE** ✅ | FREE | Brevo |
| 500 | 15,000 | $25 | **$1.50** ✅ | SES |
| 1,000 | 30,000 | $25 | **$3** ✅ | SES |
| 5,000 | 150,000 | $115 | **$15** ✅ | SES |
| 10,000 | 300,000 | $395 | **$30** ✅ | SES |

**SES wins at scale!** But start with Brevo for free.

---

## 🧪 Testing Both Providers

Create a test script:

```typescript
// scripts/test-email-providers.ts
import { sendEmail } from "@/lib/email/providers"

async function testProvider(provider: "brevo" | "ses" | "resend") {
  console.log(`\n🧪 Testing ${provider.toUpperCase()}...`)

  process.env.EMAIL_PROVIDER = provider

  const result = await sendEmail({
    from: "Test <test@yourdomain.com>",
    to: "your-email@gmail.com",
    subject: `Test from ${provider}`,
    html: `<h1>Hello from ${provider}!</h1><p>This is a test email.</p>`,
  })

  console.log(result.success ? "✅ Success!" : `❌ Failed: ${result.error}`)
}

// Test all providers
await testProvider("brevo")
await testProvider("ses")
await testProvider("resend")
```

Run:
```bash
npx tsx scripts/test-email-providers.ts
```

---

## 🐛 Debugging

### Check Current Provider

Add this to your workflow:
```typescript
import { getProviderInfo } from "@/lib/email/providers"

console.log("Email provider:", getProviderInfo())
// Output: { current: "brevo", name: "Brevo", free: "300 emails/day" }
```

### Brevo Dashboard

Monitor emails: **https://app.brevo.com/statistics/email**

See:
- ✅ Sent emails
- 📧 Delivered
- 🚫 Bounces
- 📊 Open rates

### SES Dashboard

Monitor emails: **AWS Console → SES → Email sending**

See:
- Sending statistics
- Bounce rate
- Complaint rate
- Suppression list

---

## ✅ Production Checklist

### For Brevo:
- [ ] Created Brevo account
- [ ] Got API key
- [ ] Added `BREVO_API_KEY` to `.env`
- [ ] Set `EMAIL_PROVIDER=brevo`
- [ ] Verified sender domain (optional)
- [ ] Tested sending emails
- [ ] Checked Brevo dashboard for delivery

### For Amazon SES:
- [ ] Created AWS account
- [ ] Requested production access (approved)
- [ ] Verified sender domain
- [ ] Created IAM user with SES permissions
- [ ] Added AWS credentials to `.env`
- [ ] Set `EMAIL_PROVIDER=ses`
- [ ] Tested sending emails
- [ ] Monitored SES dashboard

---

## 🎯 Recommended Strategy

**Phase 1 (Now):** Use Brevo
- ✅ 300 emails/day FREE
- ✅ No credit card needed
- ✅ 5-minute setup
- ✅ Perfect for testing and first dealers

**Phase 2 (100+ dealers):** Switch to SES
- ✅ $3/month for 100 dealers
- ✅ Unlimited scale
- ✅ 99.9% deliverability
- ✅ Professional sender reputation

**Switch by changing one environment variable:**
```bash
# Development/Testing
EMAIL_PROVIDER=brevo

# Production at scale
EMAIL_PROVIDER=ses
```

No code changes needed! 🎉

---

## 📞 Support

**Brevo Support:**
- Docs: https://developers.brevo.com/
- Chat: Available in dashboard
- Email: support@brevo.com

**AWS SES Support:**
- Docs: https://docs.aws.amazon.com/ses/
- Forums: https://forums.aws.amazon.com/forum.jspa?forumID=90
- Premium support: Available (paid)

---

Your email system is now production-ready with the best free tier (Brevo) and cheapest scale option (SES)! 🚀
