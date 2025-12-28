# RevvDoctor - Frontend-Backend Communication Audit

## 🔍 Executive Summary

**Overall Status**: ⚠️ **Functional with Critical Gaps**

- ✅ **Working**: Database schema, authentication, SSR data flow
- ⚠️ **Partial**: Client-side interactions, real-time updates
- ❌ **Broken**: Stripe webhook table reference, preference editing, alert management

**Severity Breakdown**:
- 🔴 **Critical**: 3 issues (payment flow, table mismatches)
- 🟡 **High**: 5 issues (data refresh, preferences UI, alerts)
- 🟢 **Medium**: 2 issues (responsive design gaps, type safety)

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. Stripe Webhook Table Mismatch ⚠️ PAYMENT BROKEN

**File**: `app/api/stripe/webhook/route.ts`

**Problem**:
```typescript
// Current code references non-existent table
await supabase.from("dealers_v2").upsert({
  user_id: userId,
  subscription_status: "active",
  // ...
})
```

**Database Reality**: Only `dealers` table exists (not `dealers_v2`)

**Impact**:
- Stripe payments succeed but dealer status not updated
- Users pay but don't get activated
- Revenue loss + customer support burden

**Fix**:
```typescript
// Change dealers_v2 → dealers
await supabase.from("dealers").upsert({
  user_id: userId,
  subscription_status: "active",
  subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
})
```

**Files to Update**:
- `app/api/stripe/webhook/route.ts` (2 locations)
- `app/api/checkout/route.ts` (check if also affected)

---

### 2. Missing dealer_id in vehicle_matches Inserts

**File**: `app/api/cron/scrape-raw2k/route.ts`

**Problem**:
```typescript
await supabase.from("vehicle_matches").insert({
  auction_site: "RAW2K",
  make: vehicle.make,
  // ... MISSING dealer_id!
})
```

**Database Schema**: `dealer_id` is nullable but should be set for proper filtering

**Impact**:
- Scraped vehicles not associated with any dealer
- Dashboard queries `WHERE dealer_id = ?` return no results
- Users see "No vehicles found"

**Fix**:
```typescript
// Get all active dealers
const { data: dealers } = await supabase
  .from("dealers")
  .select("id, user_id")
  .eq("subscription_status", "active")

// For each vehicle, insert for each dealer (or match preferences)
for (const dealer of dealers) {
  await supabase.from("vehicle_matches").insert({
    dealer_id: dealer.id,
    auction_site: "RAW2K",
    make: vehicle.make,
    // ...
  })
}
```

---

### 3. Dashboard Queries Wrong Table

**File**: `app/dashboard/page.tsx`

**Problem**:
```typescript
const { data: healthyCars } = await supabase
  .from("healthy_cars")  // Legacy table
  .select("*")
```

**Issue**: New scraper writes to `vehicle_matches`, dashboard reads from `healthy_cars`

**Impact**:
- New vehicles don't appear on dashboard
- Only old data visible

**Fix Options**:

**Option A**: Update scraper to write to both tables (backward compatible)
```typescript
// In scraper
await supabase.from("vehicle_matches").insert(vehicleData)
await supabase.from("healthy_cars").insert(vehicleData) // For legacy compatibility
```

**Option B**: Update dashboard to read from vehicle_matches (recommended)
```typescript
const { data: healthyCars } = await supabase
  .from("vehicle_matches")
  .select("*")
  .eq("dealer_id", dealer.id)
  .gte("created_at", new Date().toISOString().split("T")[0])
  .order("created_at", { ascending: false })
```

---

## 🟡 HIGH PRIORITY ISSUES

### 4. No Actual Data Refresh

**File**: `components/dashboard/todays-healthy-cars.tsx`

**Problem**:
```tsx
const handleRefresh = async () => {
  setIsRefreshing(true)
  // Simulate refresh - in real app this would call API
  setTimeout(() => setIsRefreshing(false), 2000)
}
```

**Impact**: Refresh button does nothing, users must reload page

**Fix**: Add API route and actual fetch

**Step 1**: Create API route `app/api/vehicles/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const { data: vehicles, error } = await supabase
    .from("vehicle_matches")
    .select("*")
    .eq("dealer_id", dealer.id)
    .gte("created_at", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ vehicles })
}
```

**Step 2**: Update component:
```tsx
const handleRefresh = async () => {
  setIsRefreshing(true)
  try {
    const res = await fetch("/api/vehicles")
    const { vehicles } = await res.json()
    // Update local state with fresh data
    setFilteredCars(vehicles)
  } catch (error) {
    console.error("Refresh failed:", error)
  } finally {
    setIsRefreshing(false)
  }
}
```

---

### 5. Preferences Edit Not Implemented

**File**: `components/dashboard/preferences-card.tsx`

**Problem**:
```tsx
<Button size="sm" variant="outline" className="w-full">
  <Edit className="w-4 h-4 mr-2" />
  Edit Preferences
</Button>
// No onClick, no dialog, no form
```

**Impact**: Users can't update their buying criteria

**Fix**: Add dialog with form

```tsx
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PreferencesCard({ dealer }: ...) {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    preferred_makes: [],
    max_price: 50000,
    max_mileage: 100000,
    // ...
  })

  const handleSave = async () => {
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    })

    if (res.ok) {
      setOpen(false)
      // Show success toast
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit Preferences</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Buying Preferences</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Add form fields */}
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

### 6. Email Settings Not Persisted

**File**: `components/dashboard/email-settings.tsx`

**Problem**:
```tsx
const handleSave = async () => {
  console.log("Saving email settings:", settings) // Only logs!
}
```

**Impact**: Email preferences lost on page reload

**Fix**: Connect to `/api/preferences` (already exists!)

```tsx
const handleSave = async () => {
  try {
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email_frequency: settings.digestFrequency,
        min_vehicles_to_send: settings.minVehicles,
      }),
    })

    if (res.ok) {
      // Show success toast
      console.log("Settings saved successfully")
    }
  } catch (error) {
    console.error("Failed to save settings:", error)
  }
}
```

---

### 7. Alerts Not Marked as Read

**File**: `components/dashboard/alerts-feed.tsx`

**Problem**:
```tsx
const markAsRead = async (alertId: string) => {
  console.log("Marking alert as read:", alertId) // Only logs!
}
```

**Impact**: Alert badge never clears

**Fix**: Add API route to update

**Step 1**: Create `app/api/alerts/[id]/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { error } = await supabase
    .from("car_alerts")
    .update({ is_read: true })
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**Step 2**: Update component:
```tsx
const markAsRead = async (alertId: string) => {
  try {
    await fetch(`/api/alerts/${alertId}`, { method: "PATCH" })
    // Update local state to hide alert
    setAlerts(alerts.filter(a => a.id !== alertId))
  } catch (error) {
    console.error("Failed to mark alert as read:", error)
  }
}
```

---

### 8. Subscription Card Missing Expiry Date

**File**: `components/dashboard/subscription-card.tsx`

**Problem**:
```tsx
{isTrialActive && expiresAt && (
  <div>{expiresAt.toLocaleDateString()}</div>
)}
// expiresAt is undefined
```

**Impact**: Users don't see when trial expires

**Fix**: Calculate from dealer data

```tsx
export default function SubscriptionCard({ dealer }: { dealer: any }) {
  const expiresAt = dealer?.subscription_expires_at
    ? new Date(dealer.subscription_expires_at)
    : null

  const daysLeft = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const isTrialActive = dealer?.subscription_status === "trial" && daysLeft > 0

  return (
    <Card>
      {isTrialActive && expiresAt && (
        <div className="text-sm">
          Trial expires: {expiresAt.toLocaleDateString()}
          <Badge variant="outline">{daysLeft} days left</Badge>
        </div>
      )}
    </Card>
  )
}
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 9. Mobile Responsive Gaps

**Issues Found**:
1. **No mobile navigation**: `<nav className="hidden md:flex">` with no mobile alternative
2. **Filter overflow**: 5 filters in one row on mobile (crowded)
3. **Vehicle cards**: Images don't stack well on small screens

**Fixes**:

**9.1 Add Mobile Navigation**:
```tsx
// In dashboard-header.tsx
"use client"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild className="md:hidden">
    <Button variant="ghost" size="icon">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>

  <SheetContent side="left">
    <nav className="flex flex-col gap-4 mt-8">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/inventory">Inventory</Link>
      {/* ... */}
    </nav>
  </SheetContent>
</Sheet>
```

**9.2 Responsive Filters**:
```tsx
// In todays-healthy-cars.tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
  {/* Filters stack on mobile, 2 cols on tablet, 5 on desktop */}
</div>
```

**9.3 Vehicle Card Layout**:
```tsx
<Card className="flex flex-col sm:flex-row">
  <div className="w-full sm:w-48 h-48 sm:h-auto">
    <Image ... />
  </div>
  <div className="flex-1 p-4">
    {/* Content */}
  </div>
</Card>
```

---

### 10. Type Safety Gaps

**Issues**:
1. Component props use `any` type
2. Database types manually defined instead of generated
3. API responses not typed

**Fix**: Generate types from Supabase

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Generate types
npx supabase gen types typescript --project-id fycvbkmgssdutumjpodz > lib/types/database.ts
```

**Usage**:
```typescript
import { Database } from "@/lib/types/database"

type Dealer = Database["public"]["Tables"]["dealers"]["Row"]
type VehicleMatch = Database["public"]["Tables"]["vehicle_matches"]["Row"]

export default function DashboardPage({ dealer }: { dealer: Dealer }) {
  // Fully typed!
}
```

---

## 📊 RESPONSIVE DESIGN AUDIT

### ✅ Working Responsive Patterns

1. **Grid Layouts**: Dashboard uses responsive grids correctly
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
   ```

2. **Container Queries**: Card headers use modern @container queries
   ```tsx
   className="@container/card-header grid auto-rows-min"
   ```

3. **Hidden Elements**: Navigation properly hidden on mobile
   ```tsx
   className="hidden md:flex"
   ```

4. **Breakpoints**: Consistent use of Tailwind breakpoints (sm, md, lg, xl)

### ⚠️ Responsive Improvements Needed

| Component | Issue | Fix |
|-----------|-------|-----|
| DashboardHeader | No mobile menu | Add Sheet/Drawer |
| TodaysHealthyCars | Filters cramped | Stack on mobile |
| Vehicle Card | Image layout breaks | Flex-col on mobile |
| Stats Cards | Too small text | Increase font on mobile |
| Alerts | Truncation issues | Show full text or tooltip |

---

## 🔄 DATA FLOW VERIFICATION

### ✅ Working Flows

1. **Authentication**:
   - Middleware → Check session → Redirect if needed ✅

2. **Dashboard Load**:
   - SSR → Query 6 tables → Pass as props ✅

3. **Scraping**:
   - Cron → Fetch HTML → Parse → AI analyze → Insert ✅

### ❌ Broken Flows

1. **Payment Activation**:
   - Stripe webhook → Update dealers_v2 ❌ (table doesn't exist)

2. **Vehicle Display**:
   - Scraper writes vehicle_matches → Dashboard reads healthy_cars ❌ (mismatch)

3. **Preferences Update**:
   - User clicks Edit → Nothing happens ❌ (not wired up)

---

## 🛠️ IMPLEMENTATION PRIORITY

### Week 1 (Critical Fixes)
- [ ] Fix Stripe webhook table reference (dealers_v2 → dealers)
- [ ] Update dashboard to query vehicle_matches instead of healthy_cars
- [ ] Add dealer_id to scraper inserts
- [ ] Test payment flow end-to-end

### Week 2 (High Priority)
- [ ] Implement preferences edit dialog
- [ ] Connect email settings to API
- [ ] Add alert mark-as-read functionality
- [ ] Implement actual data refresh

### Week 3 (Polish)
- [ ] Add mobile navigation
- [ ] Fix responsive layouts
- [ ] Generate TypeScript types from Supabase
- [ ] Add error boundaries

---

## 📋 TESTING CHECKLIST

### Backend Tests
- [ ] Stripe webhook creates subscription correctly
- [ ] Scraper inserts to correct tables with dealer_id
- [ ] Preferences API validates input correctly
- [ ] RLS policies prevent cross-dealer access

### Frontend Tests
- [ ] Dashboard loads all data without errors
- [ ] Filters work correctly
- [ ] Refresh button fetches new data
- [ ] Mobile navigation opens/closes
- [ ] Forms submit and persist data

### Integration Tests
- [ ] End-to-end payment flow (Stripe → DB → Dashboard)
- [ ] Scraping → Database → Dashboard display
- [ ] Preferences update → Next scrape uses new preferences
- [ ] Email digest sends based on saved settings

---

## 🎯 SUCCESS METRICS

After fixes are complete, verify:

1. **Payment Flow**: 100% of Stripe payments activate accounts
2. **Data Freshness**: Scraped vehicles appear within 1 minute
3. **User Control**: All settings persist across sessions
4. **Mobile Experience**: No horizontal scroll, all features accessible
5. **Type Safety**: 0 TypeScript errors, full IDE autocomplete

---

## 📚 FILES REQUIRING CHANGES

### Critical (3 files)
1. `app/api/stripe/webhook/route.ts` - Fix table name
2. `app/dashboard/page.tsx` - Query correct table
3. `app/api/cron/scrape-raw2k/route.ts` - Add dealer_id

### High Priority (6 files)
4. `components/dashboard/todays-healthy-cars.tsx` - Real refresh
5. `components/dashboard/preferences-card.tsx` - Add edit dialog
6. `components/dashboard/email-settings.tsx` - Persist to API
7. `components/dashboard/alerts-feed.tsx` - Mark as read
8. `components/dashboard/subscription-card.tsx` - Show expiry
9. `app/api/vehicles/route.ts` - NEW FILE: Fetch vehicles

### Medium Priority (4 files)
10. `components/dashboard/dashboard-header.tsx` - Mobile nav
11. `app/api/alerts/[id]/route.ts` - NEW FILE: Update alert
12. `lib/types/database.ts` - NEW FILE: Generated types
13. `app/globals.css` - Mobile style improvements

**Total Changes**: 13 files (3 critical, 6 high, 4 medium)

---

This audit provides a complete map of your application's communication layer and a prioritized fix list.
