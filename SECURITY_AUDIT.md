# RevvDoctor Security Audit & Vulnerabilities

## 🚨 CRITICAL VULNERABILITIES (Fix Immediately)

### 1. **Exposed Cron Secret** (High Risk)
**Location:** `app/api/cron/scrape-raw2k/route.ts:4`
\`\`\`typescript
const CRON_SECRET = process.env.CRON_SECRET || "dev-secret"
\`\`\`
**Risk:** Default "dev-secret" allows anyone to trigger expensive scraping operations
**Fix:**
\`\`\`typescript
const CRON_SECRET = process.env.CRON_SECRET
if (!CRON_SECRET) {
  throw new Error("CRON_SECRET environment variable is required")
}
\`\`\`

### 2. **No Rate Limiting** (High Risk)
**Location:** All API routes
**Risk:** Anyone can spam endpoints, causing:
- DoS attacks
- Excessive scraping → IP bans
- Email spam
- Database overload

**Fix:** Add rate limiting middleware
\`\`\`typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response("Too Many Requests", { status: 429 })
  }

  return NextResponse.next()
}
\`\`\`

### 3. **Row Level Security (RLS) Not Enabled** (Critical)
**Location:** Supabase database
**Risk:** Users can access other users' data by manipulating queries

**Fix:** Enable RLS on ALL tables
\`\`\`sql
-- Enable RLS
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthy_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own dealers"
  ON dealers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dealers"
  ON dealers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vehicles"
  ON vehicle_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own healthy_cars"
  ON healthy_cars FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can bypass (for cron jobs)
-- Already handled by using createAdminClient()
\`\`\`

### 4. **SQL Injection via User Input** (Medium Risk)
**Location:** Anywhere user input is used in queries
**Current:** Using Supabase client (safe from SQL injection)
**Risk:** If you ever use raw SQL with user input

**Prevention:** Always use parameterized queries
\`\`\`typescript
// ✅ SAFE - Using Supabase client
await supabase.from('dealers').select('*').eq('id', userId)

// ❌ UNSAFE - Never do this
await supabase.rpc('custom_query', {
  query: `SELECT * FROM dealers WHERE name = '${userInput}'`
})

// ✅ SAFE - If using raw SQL, use parameters
await supabase.rpc('get_dealer', { dealer_name: userInput })
\`\`\`

### 5. **Email Injection** (Medium Risk)
**Location:** Demo scrape endpoint (when you build it)
**Risk:** Attacker sends to multiple emails via header injection

**Fix:** Validate email addresses
\`\`\`typescript
import { z } from "zod"

const emailSchema = z.string().email().max(100)

const { email } = emailSchema.parse(body)
// Throws if invalid
\`\`\`

### 6. **No CSRF Protection** (Medium Risk)
**Location:** All POST/PUT/DELETE routes
**Risk:** Malicious sites can make requests on behalf of users

**Fix:** Next.js 15 has built-in CSRF protection, but verify it's enabled
\`\`\`typescript
// next.config.ts
export default {
  experimental: {
    csrfPrevention: true, // Should be default
  },
}
\`\`\`

### 7. **Stripe Webhook Signature Not Verified** (Critical for Payments)
**Location:** `app/api/stripe/webhook/route.ts`
**Check if this exists:**
\`\`\`typescript
const sig = request.headers.get("stripe-signature")
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
\`\`\`
**If not, anyone can fake payment confirmations!**

### 8. **Scraper Bot Detection** (Low Risk, High Impact)
**Location:** `scrape-raw2k/route.ts`
**Risk:** RAW2K and other sites can detect and ban your scraper

**Current Issues:**
- Fixed User-Agent (looks like bot)
- No delays between requests (500ms is good, but predictable)
- Same IP for all requests

**Improvements:**
\`\`\`typescript
// Rotate User-Agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  // Add 5-10 variations
]
const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)]

// Random delays (300-800ms instead of fixed 500ms)
await new Promise(resolve =>
  setTimeout(resolve, 300 + Math.random() * 500)
)

// Consider using proxy rotation for production
\`\`\`

---

## ⚠️ HIGH PRIORITY FIXES

### 9. **No Email Verification** (High Risk)
**Risk:** Users can sign up with any email, send spam digests
**Fix:** Enable email verification in Supabase
\`\`\`typescript
// Supabase Dashboard → Authentication → Settings
// Enable "Confirm email" before allowing login
\`\`\`

### 10. **Missing Input Validation** (Medium Risk)
**Location:** All API routes accepting user input
**Fix:** Use Zod schemas
\`\`\`typescript
import { z } from "zod"

const preferencesSchema = z.object({
  min_year: z.number().min(1990).max(new Date().getFullYear()),
  max_price: z.number().min(0).max(1000000),
  preferred_makes: z.array(z.string()).max(20),
})

// In route handler
const validated = preferencesSchema.safeParse(body)
if (!validated.success) {
  return NextResponse.json({ error: validated.error }, { status: 400 })
}
\`\`\`

### 11. **No Logging/Monitoring** (High Priority for Production)
**Risk:** Can't debug issues, detect attacks, or monitor performance

**Fix:** Add logging service
\`\`\`typescript
// Option A: Axiom (recommended for Vercel)
import { Logger } from "next-axiom"
const logger = new Logger()
logger.info("Scraper started", { site: "RAW2K", count: vehicles.length })

// Option B: Sentry for error tracking
import * as Sentry from "@sentry/nextjs"
Sentry.captureException(error, { tags: { component: "scraper" } })
\`\`\`

### 12. **Hardcoded Admin Checks** (Medium Risk)
**Location:** `app/admin/page.tsx` (if it checks user manually)
**Risk:** If admin check is client-side or easily bypassed

**Fix:** Server-side role checks
\`\`\`sql
-- Add roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'dealer', 'user')),
  PRIMARY KEY (user_id, role)
);

-- In API route
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)

if (!roles?.some(r => r.role === 'admin')) {
  return new Response("Forbidden", { status: 403 })
}
\`\`\`

### 13. **Sensitive Data in Logs** (Medium Risk)
**Location:** Console.log statements throughout codebase
**Risk:** API keys, emails, user data in logs

**Fix:** Sanitize logs
\`\`\`typescript
// ❌ BAD
console.log("User data:", user)

// ✅ GOOD
console.log("User logged in:", { id: user.id, email: user.email?.replace(/(?<=.).(?=[^@]*?@)/g, '*') })
\`\`\`

### 14. **No API Versioning** (Low Risk, High Future Impact)
**Risk:** Breaking changes will break clients

**Fix:** Version your API
\`\`\`typescript
// /api/v1/vehicles/route.ts
// When you make breaking changes, create /api/v2/
\`\`\`

---

## 🔒 DATA PRIVACY & COMPLIANCE

### 15. **GDPR Compliance** (Critical for UK/EU)
**Required:**
- [ ] Privacy Policy page
- [ ] Cookie consent banner
- [ ] Data export functionality
- [ ] Data deletion functionality (Right to be forgotten)

\`\`\`typescript
// app/api/user/delete-data/route.ts
export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Delete all user data
  await supabase.from('vehicle_matches').delete().eq('user_id', user.id)
  await supabase.from('dealers').delete().eq('user_id', user.id)
  await supabase.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
\`\`\`

### 16. **PCI Compliance** (Critical if handling payments)
**Current:** Using Stripe (handles PCI compliance)
**Ensure:** NEVER store credit card numbers, CVVs, or full card data

---

## 📊 PERFORMANCE & COST VULNERABILITIES

### 17. **Unbounded Database Queries** (High Cost Risk)
**Location:** Dashboard fetching ALL vehicles
\`\`\`typescript
// ❌ BAD - Could return 100k rows
.select("*")

// ✅ GOOD - Always limit
.select("*").limit(50)
\`\`\`

### 18. **No Pagination** (Performance Issue)
**Fix:** Add cursor-based pagination
\`\`\`typescript
// app/api/vehicles/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url)
  const cursor = url.searchParams.get('cursor')
  const limit = 20

  let query = supabase
    .from('vehicle_matches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data } = await query

  return NextResponse.json({
    data,
    nextCursor: data[data.length - 1]?.created_at
  })
}
\`\`\`

### 19. **Scraper Running in API Route** (Architecture Issue)
**Problem:** Vercel has 10-second timeout for serverless functions
**Risk:** Long-running scrapes will timeout and fail

**Fix:** Use background jobs
\`\`\`typescript
// Option A: Vercel Cron + Queue
// vercel.json
{
  "crons": [{
    "path": "/api/cron/trigger-scrape",
    "schedule": "0 6 * * *"
  }]
}

// Route triggers background job, returns immediately
export async function GET() {
  await triggerBackgroundJob("scrape-all-sites")
  return NextResponse.json({ queued: true })
}

// Option B: Upstash QStash
import { Client } from "@upstash/qstash"
const client = new Client({ token: process.env.QSTASH_TOKEN })

await client.publishJSON({
  url: "https://yourapp.com/api/jobs/scrape",
  body: { site: "RAW2K" },
  retries: 3,
})
\`\`\`

---

## 🛠️ IMMEDIATE ACTION ITEMS

### Priority 1 (Today):
- [ ] Remove "dev-secret" fallback from CRON_SECRET
- [ ] Enable RLS on all Supabase tables
- [ ] Verify Stripe webhook signature
- [ ] Add email validation to demo endpoint

### Priority 2 (This Week):
- [ ] Add rate limiting to API routes
- [ ] Add input validation with Zod
- [ ] Enable email verification
- [ ] Add error logging (Sentry/Axiom)

### Priority 3 (Before Launch):
- [ ] GDPR compliance (Privacy Policy, data export/delete)
- [ ] Move scraper to background jobs
- [ ] Add monitoring/alerting
- [ ] Security audit of all API routes
- [ ] Add CAPTCHA to demo endpoint

---

## 🔍 TESTING VULNERABILITIES

Run these tests before going to production:

\`\`\`bash
# 1. Test authentication bypass
curl http://localhost:3000/api/dashboard -H "Authorization: Bearer fake"

# 2. Test SQL injection (should fail safely)
curl -X POST http://localhost:3000/api/preferences \
  -d '{"min_year": "2020 OR 1=1"}' \
  -H "Content-Type: application/json"

# 3. Test rate limiting
for i in {1..100}; do curl http://localhost:3000/api/demo; done

# 4. Test XSS (should be escaped)
curl -X POST http://localhost:3000/api/preferences \
  -d '{"preferred_makes": ["<script>alert(1)</script>"]}' \
  -H "Content-Type: application/json"
\`\`\`
