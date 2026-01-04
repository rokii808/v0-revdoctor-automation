# Email Deliverability Guide

## Why Emails Go to Spam

1. **Unverified sender address** - Using email address not verified in your provider
2. **Missing DNS records** - No SPF, DKIM, or DMARC configured
3. **Low sender reputation** - New domain with no sending history
4. **Content triggers** - Spam filter keywords, too many links, etc.

## Quick Fixes

### 1. Verify Your Sender Email Address

#### For Resend:

1. Go to https://resend.com/domains
2. Add your domain (e.g., `revvdoctor.com`)
3. Add the DNS records shown to your domain registrar:
   - **TXT record** for domain verification
   - **MX record** (optional, for receiving)
4. Wait for verification (usually 5-30 minutes)
5. Once verified, you can send from ANY email at that domain:
   - `noreply@revvdoctor.com`
   - `digest@revvdoctor.com`
   - `hello@revvdoctor.com`

#### Set Your Verified Address:

Add to your `.env.local`:

```bash
# Use your verified domain email
EMAIL_FROM_ADDRESS="Revvdoctor <noreply@revvdoctor.com>"
```

### 2. Configure SPF, DKIM, and DMARC Records

These DNS records tell email providers your emails are legitimate.

#### SPF (Sender Policy Framework)

Add this TXT record to your domain DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

For other providers:
- **Brevo**: `v=spf1 include:spf.sendinblue.com ~all`
- **Amazon SES**: `v=spf1 include:amazonses.com ~all`

#### DKIM (DomainKeys Identified Mail)

Resend automatically provides this when you verify your domain. Look for records like:

```
Type: TXT
Name: resend._domainkey
Value: (provided by Resend)
```

#### DMARC (Domain-based Message Authentication)

Add this TXT record:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@revvdoctor.com
```

For stricter policy (after testing):
```
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@revvdoctor.com; pct=100
```

### 3. Improve Email Content

#### Avoid Spam Triggers:

❌ **Don't use:**
- ALL CAPS IN SUBJECT
- Too many exclamation marks!!!
- Spammy words: "FREE", "ACT NOW", "LIMITED TIME"
- Too many links (>5)
- Large images or attachments
- Misleading subject lines

✅ **Do use:**
- Professional subject lines
- Proper grammar and spelling
- Balanced text-to-image ratio
- Unsubscribe link (required for bulk)
- Physical mailing address (for commercial emails)

#### Our Current Subject:

```
🚗 See Revvdoctor in Action - AI-Powered Vehicle Analysis
```

This is good! Clear, professional, and relevant.

### 4. Warm Up Your Domain

New domains have zero sending reputation. Build it gradually:

**Week 1:** Send 10-20 emails/day
**Week 2:** Send 50-100 emails/day
**Week 3:** Send 200-500 emails/day
**Week 4+:** Normal volume

#### Tips:
- Start by emailing engaged users (people who signed up recently)
- Avoid sending to old/inactive email lists
- Monitor bounce rates (keep under 5%)
- Monitor spam complaints (keep under 0.1%)

### 5. Use Email Warm-up Services

For faster reputation building:

- **Warmup Inbox** (https://warmupinbox.com)
- **Mailreach** (https://www.mailreach.co)
- **Lemwarm** (https://lemlist.com/lemwarm)

These services gradually send emails from your domain to build reputation.

### 6. Test Your Email Score

Before sending to users, test with:

#### Mail Tester (https://www.mail-tester.com)

1. Get test address from mail-tester.com
2. Send demo email to that address
3. Check your score (aim for 8/10 or higher)
4. Fix any issues shown

#### GlockApps (https://glockapps.com)

- Tests deliverability across Gmail, Outlook, Yahoo, etc.
- Shows exactly where emails land (inbox vs spam)

### 7. Monitor Your Sender Reputation

Check your domain/IP reputation:

- **Google Postmaster Tools**: https://postmaster.google.com
- **Microsoft SNDS**: https://sendersupport.olc.protection.outlook.com/snds/
- **Sender Score**: https://senderscore.org

## Resend-Specific Tips

### Use Resend's Best Practices:

1. **Verify your domain** (not just single email)
2. **Use consistent From address**
3. **Add Reply-To header**
4. **Include unsubscribe link** for marketing emails
5. **Monitor bounces** in Resend dashboard

### Resend DNS Records Example:

After adding your domain in Resend, you'll get records like:

```
# Domain Verification
Type: TXT
Name: @
Value: resend-domain-verify=abc123xyz

# DKIM
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBA...

# Custom Return-Path (optional)
Type: CNAME
Name: resend
Value: feedback.resend.com
```

## Current Demo Email Configuration

**From:** Set via `EMAIL_FROM_ADDRESS` environment variable

**Default:** `Revvdoctor <noreply@revvdoctor.com>`

**Subject:** `🚗 See Revvdoctor in Action - AI-Powered Vehicle Analysis`

**Provider:** Resend (configurable via `EMAIL_PROVIDER`)

## Troubleshooting Checklist

- [ ] Domain verified in Resend/Brevo/SES
- [ ] `EMAIL_FROM_ADDRESS` uses verified domain
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS (provided by email provider)
- [ ] DMARC record added to DNS
- [ ] Subject line is professional (no spam words)
- [ ] Email content has good text-to-link ratio
- [ ] Reply-To address is set (optional)
- [ ] Testing with mail-tester.com shows 8/10+
- [ ] Sender reputation checked (no blacklists)

## Quick Test

After fixing DNS and environment variables:

```bash
# 1. Update .env.local with verified email address
EMAIL_FROM_ADDRESS="Revvdoctor <noreply@revvdoctor.com>"

# 2. Restart dev server
npm run dev

# 3. Send test email to mail-tester.com
# Visit http://localhost:3000/test-email
# Get address from https://www.mail-tester.com
# Send demo email

# 4. Check score
# Should be 8/10 or higher

# 5. Test with your own email
# Gmail, Outlook, etc.
```

## Production Deployment

When deploying to Vercel/production:

1. **Set environment variable:**
   ```
   EMAIL_FROM_ADDRESS="Revvdoctor <noreply@revvdoctor.com>"
   ```

2. **Verify DNS records are live:**
   ```bash
   # Check SPF
   dig TXT revvdoctor.com

   # Check DKIM
   dig TXT resend._domainkey.revvdoctor.com

   # Check DMARC
   dig TXT _dmarc.revvdoctor.com
   ```

3. **Test in production:**
   - Send to mail-tester.com from production
   - Verify 8/10+ score
   - Send to your own emails across providers

## Expected Results

✅ **After implementing above:**

- Emails land in inbox (not spam)
- Mail-tester score: 8-10/10
- SPF: PASS
- DKIM: PASS
- DMARC: PASS
- Sender reputation: Good

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **SPF/DKIM/DMARC Guide**: https://www.dmarcanalyzer.com/how-to-create-spf-dkim-dmarc/
