# Revvdoctor Architecture Analysis

**Type:** Multi-Tenant SaaS Architecture
**Date:** 2025-12-29

## Architecture Classification: MULTI-TENANT ✅

Your Revvdoctor application follows a **multi-tenant architecture** where a single application instance serves multiple customers (dealers) simultaneously.

---

## Evidence of Multi-Tenant Architecture

### 1. **Shared Application Instance**
\`\`\`
All dealers access: https://your-domain.com
├── Single Next.js application
├── Single codebase deployment
├── Shared infrastructure (Vercel/hosting)
└── Same application version for all users
\`\`\`

**NOT single-tenant because:**
- You don't have separate application instances per dealer
- All dealers share the same URL/domain
- One deployment affects all users

---

### 2. **Shared Database with Logical Isolation**

**Database Structure (Supabase PostgreSQL):**

\`\`\`sql
-- Single shared database
├── dealers table
│   ├── id (primary key)
│   ├── user_id (references auth.users) ← TENANT IDENTIFIER
│   ├── subscription_status
│   └── preferences
│
├── vehicle_matches table
│   ├── id
│   ├── dealer_id ← DATA ISOLATION KEY
│   ├── make, model, year, price
│   └── created_at
│
├── insights table
│   ├── id
│   ├── user_id ← DATA ISOLATION KEY
│   ├── dealer_id
│   └── vehicle data
│
└── subscriptions table
    ├── user_id ← TENANT IDENTIFIER
    ├── stripe_customer_id
    └── status
\`\`\`

**Multi-tenant characteristics:**
- ✅ All dealers' data in the same database
- ✅ Data separated by `user_id` / `dealer_id` columns
- ✅ Row-Level Security (RLS) for data isolation
- ✅ Queries filtered by tenant ID

**NOT single-tenant because:**
- Each dealer doesn't have their own database
- Data is logically separated, not physically isolated

---

### 3. **Shared Authentication Service**

\`\`\`typescript
// All dealers use the same Supabase Auth instance
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,  // Same for all
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // Same for all
)

// Authentication is per-user, not per-instance
const { data: { user } } = await supabase.auth.getUser()
\`\`\`

**Multi-tenant because:**
- Single Supabase project serves all dealers
- Shared auth tables (auth.users)
- Session management identifies individual users within shared system

---

### 4. **Shared Background Jobs**

**Inngest Functions:**
\`\`\`typescript
// lib/inngest/functions.ts
export const dailyScraperJob = inngest.createFunction(
  { id: "daily-scraper" },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    // Scrapes ALL enabled sites
    const scrapedData = await scrapeAllSites()

    // Gets ALL active dealers
    const dealers = await supabase
      .from("dealers")
      .select("*")
      .eq("subscription_status", "active")

    // Matches vehicles for EACH dealer
    for (const dealer of dealers) {
      // Process matches for this specific dealer
    }
  }
)
\`\`\`

**Multi-tenant because:**
- Single scraper instance runs for all dealers
- Single cron job processes all tenants
- Shared infrastructure for background tasks
- Results distributed to individual dealers

**NOT single-tenant because:**
- You don't run separate scrapers per dealer
- No isolated job queues per customer

---

### 5. **Shared Payment Processing**

\`\`\`typescript
// All dealers use the same Stripe account
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Webhook handles events for ALL customers
export async function POST(req: NextRequest) {
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

  // Routes to specific customer via metadata
  const userId = session.client_reference_id
}
\`\`\`

**Multi-tenant because:**
- Single Stripe account serves all dealers
- Shared webhook endpoint
- Customer identification via metadata

---

## Multi-Tenant Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / USERS                          │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┼────────┬────────┐
        │        │        │        │
    Dealer A  Dealer B  Dealer C  Dealer D
        │        │        │        │
        └────────┼────────┴────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│         SHARED APPLICATION INSTANCE (Next.js)                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Authentication Layer (Supabase Auth)                │   │
│  │  • Session management per user                       │   │
│  │  • JWT tokens with user_id                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic (API Routes)                         │   │
│  │  • /api/dashboard?userId=dealer-a                    │   │
│  │  • /api/vehicles (filtered by session.user.id)      │   │
│  │  • /api/preferences (scoped to authenticated user)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Background Jobs (Inngest)                           │   │
│  │  • dailyScraperJob → processes ALL dealers          │   │
│  │  • Loops through all active subscriptions           │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         SHARED DATABASE (Supabase PostgreSQL)                │
│                                                               │
│  dealers table:                                              │
│  ┌─────┬─────────┬────────────┬─────────────────┐          │
│  │ id  │ user_id │ email      │ subscription    │          │
│  ├─────┼─────────┼────────────┼─────────────────┤          │
│  │ 1   │ a-123   │ dealer-a@  │ active          │ ← Dealer A│
│  │ 2   │ b-456   │ dealer-b@  │ trial           │ ← Dealer B│
│  │ 3   │ c-789   │ dealer-c@  │ active          │ ← Dealer C│
│  └─────┴─────────┴────────────┴─────────────────┘          │
│                                                               │
│  vehicle_matches table:                                      │
│  ┌─────┬───────────┬──────┬─────────┬────────┐             │
│  │ id  │ dealer_id │ make │ model   │ price  │             │
│  ├─────┼───────────┼──────┼─────────┼────────┤             │
│  │ 101 │ 1         │ BMW  │ 3Series │ 12000  │ ← Dealer A  │
│  │ 102 │ 2         │ Audi │ A4      │ 15000  │ ← Dealer B  │
│  │ 103 │ 1         │ Merc │ C-Class │ 18000  │ ← Dealer A  │
│  │ 104 │ 3         │ Ford │ Focus   │ 8000   │ ← Dealer C  │
│  └─────┴───────────┴──────┴─────────┴────────┘             │
│                                                               │
│  RLS Policies:                                               │
│  • SELECT: WHERE dealer_id = auth.uid()                     │
│  • INSERT: WHERE dealer_id = auth.uid()                     │
│  • UPDATE: WHERE dealer_id = auth.uid()                     │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Data Isolation Strategy

### Row-Level Security (RLS)

Your multi-tenant architecture relies on **Row-Level Security** for data isolation:

\`\`\`sql
-- Example RLS policy
CREATE POLICY "Users can only see their own vehicles"
ON vehicle_matches
FOR SELECT
USING (dealer_id = (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- In practice, your queries do this:
SELECT * FROM vehicle_matches
WHERE dealer_id = current_user_dealer_id;
\`\`\`

**How it works:**
1. User logs in → Gets `user_id` in JWT token
2. Application queries database
3. RLS automatically filters: `WHERE user_id = authenticated_user_id`
4. User only sees their own data
5. Other dealers' data is invisible to them

---

## Multi-Tenant Benefits (What You Get)

### ✅ Cost Efficiency
- **Single infrastructure** to maintain
- **Shared resources** (database, compute, storage)
- **Lower hosting costs** per customer
- **Economy of scale** as you grow

**Example:**
- 100 dealers share 1 database instead of 100 databases
- 1 application deployment instead of 100
- 1 server instead of 100

### ✅ Easier Updates & Maintenance
- **Deploy once**, affects all customers
- **Bug fixes** instantly available to everyone
- **Feature releases** rolled out simultaneously
- **No version fragmentation**

**Example:**
- Fix a security issue → 1 deployment protects all dealers
- Add new feature → All dealers get it immediately

### ✅ Operational Simplicity
- **Single codebase** to manage
- **One monitoring dashboard** for all tenants
- **Centralized logging** and analytics
- **Easier backups** (one database)

### ✅ Resource Optimization
- **Shared scrapers** run once for all dealers
- **Connection pooling** across tenants
- **Caching** benefits all users
- **Load balancing** automatically distributes

---

## Multi-Tenant Challenges (What to Watch)

### ⚠️ Noisy Neighbor Problem
**Issue:** One dealer's heavy usage affects others

**Your Risk Areas:**
\`\`\`typescript
// Heavy scraping could slow database for all
const vehicles = await scrapeAllSites() // 1000s of inserts

// Large dealer could monopolize resources
SELECT * FROM vehicle_matches
WHERE dealer_id = 'heavy-user' // Returns 50,000 rows
\`\`\`

**Mitigation Strategies:**
- ✅ Rate limiting per dealer
- ✅ Query timeouts
- ✅ Pagination on large datasets
- ✅ Resource quotas per plan tier

### ⚠️ Data Isolation Security
**Issue:** Critical to prevent data leakage between tenants

**Your Current Protection:**
\`\`\`typescript
// ✅ GOOD: Uses authenticated user
const { data: { user } } = await supabase.auth.getUser()
const vehicles = await supabase
  .from("vehicle_matches")
  .select("*")
  .eq("dealer_id", userDealerId) // Filtered by user

// ❌ BAD: Would expose all data (you fixed this!)
const vehicles = await supabase
  .from("vehicle_matches")
  .select("*") // No filter = sees everyone's data
\`\`\`

**Best Practices:**
- ✅ Always filter by `user_id` or `dealer_id`
- ✅ Use RLS policies on all tables
- ✅ Validate ownership before updates/deletes
- ✅ Regular security audits

### ⚠️ Performance at Scale
**Issue:** Single database serving 1000+ dealers

**Monitoring Needed:**
- Database connection limits
- Query performance degradation
- Storage growth
- Index optimization

**Scaling Options:**
1. **Vertical scaling** - Bigger database server
2. **Read replicas** - Separate read/write databases
3. **Database partitioning** - Split tables by dealer_id
4. **Caching layer** - Redis for common queries

### ⚠️ Customization Limitations
**Issue:** All dealers use same application

**Your Current Approach:**
- ✅ Preferences stored per dealer
- ✅ Plan-based feature gating
- ✅ Configurable email settings

**Enhancement Ideas:**
- Custom branding per dealer (logos, colors)
- Whitelabel domains (dealer-a.revvdoctor.com)
- Custom integrations per dealer
- Feature flags per customer

---

## When Would Single-Tenant Make Sense?

You'd consider single-tenant if:

### ❌ Regulatory Requirements
- Healthcare (HIPAA) requiring physical data isolation
- Financial services needing separate environments
- Government contracts mandating dedicated infrastructure

### ❌ Extreme Customization
- Each customer needs completely different features
- Deep integration with customer's infrastructure
- Custom business logic per tenant

### ❌ Very Large Enterprise Customers
- Fortune 500 clients demanding dedicated resources
- SLA requirements for guaranteed performance
- Security policies prohibiting shared environments

**For Revvdoctor:**
- ✅ Multi-tenant is the RIGHT choice
- Your customers (car dealers) are SMBs, not enterprises
- Standard feature set across all dealers
- Cost efficiency is critical for profitability
- Easy updates and maintenance needed

---

## Hybrid Approach (Future Option)

Some SaaS platforms offer **both** models:

\`\`\`
Multi-Tenant (Standard Plans)
├── Basic: £29/month
├── Startup: £59/month
└── Premium: £99/month
    ↑
    └── Shared infrastructure

Single-Tenant (Enterprise)
└── Enterprise: £2,000+/month
    ↑
    └── Dedicated database
    └── Dedicated application instance
    └── Custom domain
    └── SLA guarantees
\`\`\`

This could be your **Enterprise** tier in the future!

---

## Architecture Comparison Table

| Aspect | Multi-Tenant (YOU) | Single-Tenant |
|--------|-------------------|---------------|
| **App Instances** | 1 shared | 1 per customer |
| **Database** | 1 shared | 1 per customer |
| **Infrastructure** | Shared | Dedicated |
| **URL** | yourapp.com | customer1.yourapp.com |
| **Deployment** | Deploy once → all customers | Deploy per customer |
| **Cost per Customer** | Low (£5-20/month) | High (£200-500/month) |
| **Scalability** | Easy (add users) | Hard (add infrastructure) |
| **Customization** | Limited | Unlimited |
| **Data Isolation** | Logical (RLS) | Physical (separate DBs) |
| **Updates** | Instant for all | Per customer |
| **Typical Pricing** | £29-99/month | £1000+/month |
| **Target Market** | SMBs, Startups | Enterprises, Regulated |

---

## Your Architecture Stack

\`\`\`
┌─────────────────────────────────────────┐
│  FRONTEND (Shared)                      │
│  • Next.js 15                           │
│  • React 19                             │
│  • Tailwind CSS                         │
│  • Deployed: Vercel (single instance)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  AUTHENTICATION (Shared)                │
│  • Supabase Auth                        │
│  • JWT tokens                           │
│  • Session per user                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  APPLICATION LAYER (Shared)             │
│  • Next.js API Routes                   │
│  • Server Actions                       │
│  • Middleware (RLS enforcement)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  BACKGROUND JOBS (Shared)               │
│  • Inngest functions                    │
│  • Cron jobs                            │
│  • Processes all tenants                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  DATABASE (Shared - Multi-Tenant)       │
│  • Supabase PostgreSQL                  │
│  • Row-Level Security                   │
│  • Data filtered by user_id/dealer_id   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│  EXTERNAL SERVICES (Shared)             │
│  • Stripe (payments)                    │
│  • Resend (emails)                      │
│  • Web scrapers                         │
└─────────────────────────────────────────┘
\`\`\`

---

## Conclusion

**Your Revvdoctor application is a MULTI-TENANT SaaS platform.**

### Why This is Good:
✅ **Lower operational costs** - One infrastructure serves all
✅ **Faster time to market** - No complex per-customer provisioning
✅ **Easier maintenance** - Single codebase, single deployment
✅ **Better economics** - High margins with economies of scale
✅ **Faster updates** - Deploy features to all customers instantly

### Best Practices You're Following:
✅ Row-Level Security for data isolation
✅ User-based authentication with Supabase
✅ Shared background jobs with per-tenant processing
✅ Plan-based feature gating

### Areas for Improvement:
⚠️ Add rate limiting per dealer
⚠️ Implement resource quotas per plan
⚠️ Set up monitoring for per-tenant metrics
⚠️ Add database connection pooling limits
⚠️ Consider read replicas as you scale

**Bottom Line:** Multi-tenant is the RIGHT architecture for your B2B SaaS serving car dealers. It's cost-effective, scalable, and maintainable. Perfect for your business model! 🚀
