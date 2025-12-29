# Onboarding Flow Documentation

**Created:** 2025-12-29
**Status:** ✅ Implemented

## Overview

This document describes the complete user authentication and onboarding flow for Revvdoctor, from signup to dashboard access with 7-day free trial.

---

## User Journey

### 1. Sign Up / Login
**URL:** `/auth/signup` or `/auth/login`

**What happens:**
- User creates account or logs in
- Email verification (optional, based on Supabase settings)
- Redirect to `/auth/callback`

---

### 2. Auth Callback
**URL:** `/auth/callback`

**Logic:**
```typescript
if (no dealer profile exists) {
  → Redirect to /onboarding (NEW USER)
} else if (trial active) {
  → Redirect to /dashboard (TRIAL ACCESS)
} else if (subscription active) {
  → Redirect to /dashboard (PAID ACCESS)
} else {
  → Redirect to /pricing (NEEDS SUBSCRIPTION)
}
```

---

### 3. Onboarding (New Users Only)
**URL:** `/onboarding`

#### Step 1: Welcome
- Shows benefits of Revvdoctor
- Highlights 7-day free trial
- "No credit card required" messaging
- Button: **"Get Started"**

#### Step 2: Plan Selection
**Features:**
- Display 3 plans: Basic (£29), Startup (£59), Premium (£99)
- Each plan shows "7-day free trial" badge
- User selects their preferred plan
- Button: **"Start Free Trial"**

**What happens on click:**
1. Creates dealer profile in `dealers` table:
   ```typescript
   {
     user_id: userId,
     email: userEmail,
     subscription_status: "trial",
     subscription_expires_at: Date.now() + 7 days,
     selected_plan: "startup", // User's choice
   }
   ```
2. Sets trial expiry to 7 days from now
3. Advances to Step 3

#### Step 3: Preferences
**User configures:**
- **Car Makes:** BMW, Mercedes, Audi, etc. (or leave empty for all)
- **Year Range:** Min/max year (default: 2015-2025)
- **Maximum Mileage:** Slider from 10k-200k miles (default: 100k)
- **Locations:** London, Birmingham, etc. (or leave empty for all)

**What happens on save:**
1. Saves preferences to Supabase:
   ```typescript
   await savePrefs(userId, {
     makes: ["BMW", "Audi"],
     minYear: 2015,
     maxYear: 2025,
     maxMileage: 100000,
     maxBid: 15000,
     locations: ["London", "Manchester"]
   })
   ```
2. Updates dealer profile with year/bid preferences
3. Redirects to `/dashboard?onboarding=complete`

---

### 4. Dashboard Access
**URL:** `/dashboard`

**Trial User Experience:**
- Full access to all features
- Banner showing "X days left in trial"
- CTA to upgrade before trial expires
- Daily vehicle screening starts immediately

---

## Trial Logic

### Trial Creation
- **Duration:** 7 days
- **Start:** Immediately when user selects plan in onboarding
- **End:** Exactly 7 days later
- **Access:** Full features of selected plan

### Trial Expiry
**Checked in:** `middleware.ts`

```typescript
if (subscription_status === "trial") {
  if (trial_expires_at > now) {
    // Allow dashboard access
  } else {
    // Redirect to /pricing?trial_expired=true
  }
}
```

### After Trial Ends
- User redirected to `/pricing?trial_expired=true`
- Shows message: "Your trial has expired"
- Prompts to enter payment and start subscription
- All data preserved (preferences, insights)

---

## Database Schema

### dealers table
```sql
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  email TEXT,
  dealer_name TEXT,
  subscription_status TEXT, -- 'trial', 'active', 'cancelled'
  subscription_expires_at TIMESTAMP,
  selected_plan TEXT, -- 'basic', 'startup', 'premium'
  min_year INTEGER DEFAULT 2015,
  max_bid INTEGER DEFAULT 15000,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### dealers_v2 table (preferences)
```sql
CREATE TABLE dealers_v2 (
  id UUID PRIMARY KEY REFERENCES dealers(id),
  prefs JSONB DEFAULT '{
    "makes": [],
    "min_year": 2015,
    "max_year": 2025,
    "max_mileage": 100000,
    "max_bid": 15000,
    "locations": []
  }'::jsonb
);
```

---

## Middleware Protection

### Public Routes (No Auth Required)
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/auth/callback` - OAuth callback
- `/pricing` - Pricing page
- `/api/*` - API routes

### Semi-Protected (Auth Required, No Subscription)
- `/onboarding` - Onboarding flow

### Protected Routes (Auth + Active Subscription/Trial)
- `/dashboard` - Main dashboard
- `/agents` - Agent management
- `/reports` - Reports
- `/settings` - User settings
- `/dealer-admin` - Admin panel

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Landing Page (/)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              Sign Up (/auth/signup)                           │
│              or Login (/auth/login)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              Auth Callback (/auth/callback)                   │
│                                                                │
│  Decision Point:                                               │
│  ├─ No dealer profile? → Onboarding                           │
│  ├─ Trial active? → Dashboard                                 │
│  ├─ Subscription active? → Dashboard                          │
│  └─ None? → Pricing                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓ (New User)
┌─────────────────────────────────────────────────────────────┐
│                  Onboarding (/onboarding)                     │
│                                                                │
│  Step 1: Welcome Screen                                       │
│    - Show benefits                                             │
│    - 7-day free trial info                                    │
│    - Click "Get Started"                                      │
│                                                                │
│  Step 2: Plan Selection                                       │
│    - Choose: Basic / Startup / Premium                        │
│    - All include 7-day trial                                  │
│    - Creates dealer profile with trial status                 │
│    - Sets expiry: NOW + 7 days                                │
│    - Click "Start Free Trial"                                 │
│                                                                │
│  Step 3: Preferences                                          │
│    - Select car makes                                         │
│    - Set year range                                           │
│    - Choose max mileage                                       │
│    - Select locations                                         │
│    - Saves to Supabase                                        │
│    - Click "Complete Setup & Go to Dashboard"                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              Dashboard (/dashboard)                           │
│                                                                │
│  During Trial (Day 1-7):                                      │
│  ✓ Full access to all features                                │
│  ✓ Daily vehicle screening                                    │
│  ✓ Banner: "5 days left in trial"                            │
│  ✓ Upgrade CTA visible                                        │
│                                                                │
│  After Trial Expires (Day 8+):                                │
│  → Redirect to /pricing?trial_expired=true                    │
└───────────────────────────────────────────────────────────────┘
```

---

## Payment Flow (After Trial)

When trial expires, user must:

1. Go to `/pricing` page
2. Select same or different plan
3. Click "Subscribe" → Redirects to Stripe Checkout
4. Enter payment details
5. Stripe webhook creates subscription record
6. `subscription_status` changes from "trial" to "active"
7. User can access dashboard again

---

## Key Features

### ✅ No Credit Card for Trial
- Users can start trial without payment info
- 7 full days of access
- All features unlocked during trial

### ✅ Smooth Onboarding
- 3 clear steps with progress indicator
- Visual, intuitive interface
- Saves all preferences for future use

### ✅ Trial Validation
- Middleware checks trial expiry on every request
- Automatic redirect when expired
- Clear messaging about trial status

### ✅ Data Persistence
- All user preferences saved
- Vehicle history preserved
- Insights retained after trial

---

## Testing Checklist

### New User Flow
- [ ] Sign up new account
- [ ] Verify redirect to onboarding
- [ ] Complete Step 1 (Welcome)
- [ ] Select plan in Step 2
- [ ] Verify dealer profile created with trial status
- [ ] Set preferences in Step 3
- [ ] Verify redirect to dashboard
- [ ] Check trial badge appears

### Trial Access
- [ ] Verify dashboard loads for trial users
- [ ] Check all features accessible
- [ ] Verify trial expiry date is 7 days out

### Trial Expiry
- [ ] Manually set `subscription_expires_at` to past date
- [ ] Try accessing /dashboard
- [ ] Verify redirect to /pricing?trial_expired=true
- [ ] Check "trial expired" message shows

### Returning User Flow
- [ ] Log in with existing account
- [ ] Verify redirect to dashboard (skip onboarding)
- [ ] Check preferences loaded correctly

---

## Troubleshooting

### User stuck in onboarding loop
**Cause:** Dealer profile not created properly
**Fix:** Check `dealers` table, ensure `subscription_status` is set

### Trial not working
**Cause:** `subscription_expires_at` is null or in past
**Fix:** Verify date is 7 days in future when created

### Can't access dashboard
**Cause:** Middleware rejecting trial status
**Fix:** Check middleware logic, ensure "trial" is treated as valid

---

## Future Enhancements

1. **Email Reminders**
   - Day 5: "2 days left in trial"
   - Day 7: "Last day of trial"
   - Day 8: "Trial expired, upgrade now"

2. **Trial Extensions**
   - Admin ability to extend trials
   - Promotional codes for longer trials

3. **A/B Testing**
   - Test different trial lengths (3, 7, 14 days)
   - Test different onboarding flows

4. **Analytics**
   - Track onboarding completion rate
   - Measure trial-to-paid conversion
   - Identify drop-off points

---

## Support

If users experience issues:
1. Check auth callback logs for redirect logic
2. Verify dealer profile in database
3. Check trial expiry date
4. Review middleware logs for access denials

**Admin Dashboard:** Access dealer profiles to troubleshoot trial issues

---

## Summary

This onboarding flow provides:
- ✅ Seamless signup experience
- ✅ No-risk 7-day free trial
- ✅ Personalized preferences collection
- ✅ Automatic trial management
- ✅ Clear upgrade path

Users go from signup to finding profitable cars in under 3 minutes!
