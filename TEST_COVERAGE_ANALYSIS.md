# Test Coverage Analysis Report

**Generated:** 2025-12-28
**Current Test Coverage:** 0%

## Executive Summary

The codebase currently has **zero test coverage** with no testing infrastructure in place. This analysis identifies critical areas requiring immediate test coverage and provides a phased implementation plan.

## Current State

### What's Missing
- ❌ No test files (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- ❌ No testing frameworks (Jest, Vitest, React Testing Library)
- ❌ No test scripts in package.json
- ❌ No coverage tools or configuration
- ❌ No CI/CD test automation

## Critical Areas Requiring Tests

### 🔴 Priority 1: Critical Business Logic

#### 1. Heuristic Analysis (`lib/analysis/heuristic.ts:3`)
**Impact:** Core vehicle evaluation algorithm affecting all dealer recommendations

**Test Requirements:**
- Risk scoring for vehicles of different ages
  - New vehicles (< 3 years)
  - Mid-age vehicles (3-10 years)
  - Old vehicles (> 10 years)
- Mileage impact on risk scores
  - Low mileage (< 30k)
  - Medium mileage (30k-100k)
  - High mileage (> 100k)
- Condition assessment logic
- Price factor calculations
- Profit estimate accuracy
- Risk level boundaries (1-10 clamping)
- Edge cases (zero mileage, missing data)

**Example Test Cases:**
```typescript
describe('heuristicAnalysis', () => {
  it('should mark old high-mileage vehicles as AVOID', () => {
    const vehicle = {
      year: 2010,
      mileage: 150000,
      price: 5000,
      condition: 'Poor'
    }
    const result = heuristicAnalysis(vehicle)
    expect(result.verdict).toBe('AVOID')
    expect(result.risk_level).toBeGreaterThan(7)
  })

  it('should calculate profit estimates correctly', () => {
    const vehicle = {
      year: 2020,
      mileage: 25000,
      price: 20000,
      condition: 'Good'
    }
    const result = heuristicAnalysis(vehicle)
    expect(result.profit_estimate).toBeGreaterThan(0)
  })
})
```

---

#### 2. Stripe Webhook Handler (`app/api/stripe/webhook/route.ts:8`)
**Impact:** Handles payment processing and subscription management

**Test Requirements:**
- Webhook signature verification
  - Valid signatures
  - Invalid signatures
  - Missing signatures
- Event handling
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Database updates
  - Subscriptions table upserts
  - Dealer status updates
- External service integration
  - N8N webhook notifications
  - Stripe API calls
- Error scenarios
  - Missing environment variables
  - Database failures
  - Network failures

**Example Test Cases:**
```typescript
describe('Stripe Webhook', () => {
  it('should reject webhooks with invalid signatures', async () => {
    const response = await POST(mockRequest({
      body: validWebhookPayload,
      headers: { 'stripe-signature': 'invalid' }
    }))
    expect(response.status).toBe(400)
  })

  it('should activate subscription on checkout completion', async () => {
    // Mock Stripe event
    // Verify database updates
    // Check N8N notification
  })
})
```

---

### 🟠 Priority 2: Data Processing

#### 3. Web Scrapers (`lib/scrapers/*.ts`)
**Impact:** Core data ingestion affecting all vehicle listings

**Files to Test:**
- `lib/scrapers/raw2k.ts:4`
- `lib/scrapers/autorola.ts`
- `lib/scrapers/bca.ts`
- `lib/scrapers/manheim.ts`
- `lib/scrapers/index.ts:59` (scraping orchestration)

**Test Requirements:**
- HTML parsing accuracy
- Price extraction from various formats
  - £12,000
  - 12,000
  - £12000.00
- Data extraction
  - Make/model parsing
  - Year extraction
  - Mileage parsing
  - Image URL extraction
- Missing data handling
- URL construction (relative vs absolute)
- Network error handling
- Empty results
- Malformed HTML

**Example Test Cases:**
```typescript
describe('scrapeRAW2K', () => {
  it('should parse vehicle listings from HTML', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHTML
    })

    const results = await scrapeRAW2K()
    expect(results).toHaveLength(5)
    expect(results[0]).toMatchObject({
      make: expect.any(String),
      model: expect.any(String),
      year: expect.any(Number),
      price: expect.any(Number)
    })
  })

  it('should handle network failures gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const results = await scrapeRAW2K()
    expect(results).toEqual([])
  })
})
```

---

#### 4. Inngest Workflow Functions (`lib/inngest/functions.ts:7`)
**Impact:** Orchestrates entire scraping and matching pipeline

**Test Requirements:**
- Multi-site scraping coordination
- Dealer preference matching
  - Year range filtering
  - Price filtering
  - Make/model matching
- Vehicle analysis integration
- Database operations
  - Insertion into vehicle_matches
  - Legacy table compatibility
  - Stats tracking
- Error recovery
- Rate limiting behavior

---

### 🟡 Priority 3: API & Server Logic

#### 5. Server Actions (`lib/actions.ts:6`)
**Test Requirements:**
- Preference saving (savePrefs)
- Preference retrieval with defaults (getPrefs)
- Input validation
- Error handling
- N8N webhook integration

#### 6. API Routes (`app/api/**/*.ts`)
**Key Routes:**
- `/api/vehicles` - Vehicle data retrieval
- `/api/dashboard` - Dashboard metrics
- `/api/insights` - Insight generation
- `/api/checkout` - Payment initiation
- `/api/workflow/*` - Workflow operations

**Test Requirements:**
- Authentication/authorization
- Request validation
- Response formats
- Error responses (400, 401, 404, 500)
- Database query correctness

---

### 🟢 Priority 4: Frontend Components

#### 7. React Components (`components/**/*.tsx`)

**Critical Components:**
- `components/auth/login-form.tsx:1` - Authentication
- `components/auth/signup-form.tsx:1` - Registration
- `components/dashboard/*` - Dashboard UI
- `components/admin/*` - Admin interfaces

**Test Requirements:**
- Form validation
- User interactions
- Error states
- Loading states
- Conditional rendering
- Accessibility (a11y)

---

## Recommended Testing Stack

### Testing Frameworks
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "happy-dom": "^12.0.0",
    "msw": "^2.0.0"
  }
}
```

### Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'components/ui/', // shadcn components
        '**/*.config.{ts,js}',
        '**/types/*.ts'
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## Phased Implementation Plan

### Phase 1: Infrastructure (Week 1)
- [ ] Install testing dependencies
- [ ] Configure Vitest
- [ ] Set up test utilities
- [ ] Create mock data fixtures
- [ ] Configure CI/CD to run tests

**Estimated Effort:** 8-12 hours

---

### Phase 2: Critical Business Logic (Week 2)
- [ ] Test heuristic analysis (lib/analysis/heuristic.ts)
  - All risk scoring scenarios
  - Profit calculations
  - Edge cases
- [ ] Test Stripe webhooks (app/api/stripe/webhook/route.ts)
  - Use Stripe test fixtures
  - Mock external calls
  - Test all event types
- [ ] Test scraper utilities
  - Price parsing
  - Data extraction helpers

**Target Coverage:** 90%+ for business logic
**Estimated Effort:** 16-24 hours

---

### Phase 3: Data Processing (Week 3)
- [ ] Test individual scrapers
  - Mock fetch responses
  - Test HTML parsing
  - Error scenarios
- [ ] Test scraper orchestration (lib/scrapers/index.ts)
- [ ] Test Inngest workflows
  - Mock Supabase calls
  - Test matching logic
  - Verify stats tracking

**Target Coverage:** 80%+ for scrapers
**Estimated Effort:** 20-30 hours

---

### Phase 4: API & Server Actions (Week 4)
- [ ] Test server actions (lib/actions.ts)
- [ ] Test API routes
  - Authentication
  - Data retrieval
  - Error handling
- [ ] Integration tests for key flows

**Target Coverage:** 80%+ for APIs
**Estimated Effort:** 16-24 hours

---

### Phase 5: Frontend Components (Week 5-6)
- [ ] Test authentication forms
- [ ] Test dashboard components
- [ ] Test admin interfaces
- [ ] Accessibility testing

**Target Coverage:** 70%+ for components
**Estimated Effort:** 24-32 hours

---

### Phase 6: E2E Tests (Optional)
- [ ] Install Playwright
- [ ] Test critical user flows
  - Sign up → Subscribe → Receive digest
  - Configure preferences
  - Admin operations
- [ ] Test scraping pipeline end-to-end

**Estimated Effort:** 16-24 hours

---

## Coverage Goals

| Area | Target Coverage | Priority |
|------|----------------|----------|
| Business Logic | 90%+ | Critical |
| Payment Processing | 95%+ | Critical |
| Scrapers | 80%+ | High |
| API Routes | 80%+ | High |
| Server Actions | 85%+ | High |
| Components | 70%+ | Medium |
| Utilities | 80%+ | Medium |
| **Overall** | **75%+** | - |

---

## Risks of Current Zero Coverage

### Financial Risks
- Stripe webhook bugs could cause billing issues
- Subscription status errors could grant/deny access incorrectly
- Payment failures might go undetected

### Data Quality Risks
- Scraper errors could provide incorrect vehicle data
- Analysis bugs could mislabel vehicles as HEALTHY/AVOID
- Price parsing errors could show wrong values

### User Experience Risks
- Broken preference matching means missed opportunities
- Failed workflows could prevent digest emails
- Authentication bugs could lock out users

### Business Continuity Risks
- No regression detection before deployment
- Changes could break existing functionality
- Debugging production issues without test reproduction

### Compliance Risks
- Payment processing errors could violate PCI requirements
- Data handling bugs could cause GDPR issues

---

## Sample Test Examples

### Example 1: Heuristic Analysis Test
```typescript
// tests/lib/analysis/heuristic.test.ts
import { describe, it, expect } from 'vitest'
import { heuristicAnalysis } from '@/lib/analysis/heuristic'

describe('heuristicAnalysis', () => {
  it('should identify healthy low-risk vehicles', () => {
    const vehicle = {
      listing_id: 'test-1',
      lot_number: 'LOT-001',
      make: 'Toyota',
      model: 'Corolla',
      year: 2021,
      price: 12000,
      auction_date: '2025-12-30',
      auction_site: 'RAW2K',
      url: 'https://example.com',
      condition: 'Good',
      mileage: 25000
    }

    const result = heuristicAnalysis(vehicle)

    expect(result.verdict).toBe('HEALTHY')
    expect(result.risk_level).toBeLessThan(7)
    expect(result.profit_estimate).toBeGreaterThan(0)
  })

  it('should flag high-risk vehicles', () => {
    const vehicle = {
      year: 2010,
      mileage: 150000,
      price: 8000,
      condition: 'Poor - Damaged',
      // ... other required fields
    }

    const result = heuristicAnalysis(vehicle)

    expect(result.verdict).toBe('AVOID')
    expect(result.risk_level).toBeGreaterThan(7)
    expect(result.reason).toContain('High risk')
  })
})
```

### Example 2: Scraper Test
```typescript
// tests/lib/scrapers/raw2k.test.ts
import { describe, it, expect, vi } from 'vitest'
import { scrapeRAW2K } from '@/lib/scrapers/raw2k'

describe('scrapeRAW2K', () => {
  it('should extract vehicle listings from HTML', async () => {
    const mockHTML = `
      <div class="vehicle-card">
        <h3>2021 Toyota Corolla</h3>
        <span class="price">£12,000</span>
        <span class="mileage">25,000 miles</span>
      </div>
    `

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHTML
    })

    const results = await scrapeRAW2K()

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      make: 'Toyota',
      model: expect.stringContaining('Corolla'),
      price: 12000,
      mileage: 25000
    })
  })
})
```

---

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Success Metrics

### Short-term (1-2 months)
- [ ] All critical business logic has 90%+ coverage
- [ ] Payment processing has 95%+ coverage
- [ ] CI/CD runs tests on every PR
- [ ] Zero deployment failures due to untested code

### Medium-term (3-6 months)
- [ ] Overall coverage reaches 75%+
- [ ] All new code requires tests (enforced in PR reviews)
- [ ] Test suite runs in < 5 minutes
- [ ] Mutation testing shows high quality tests

### Long-term (6-12 months)
- [ ] E2E tests cover critical user journeys
- [ ] Performance tests prevent regression
- [ ] Security tests catch vulnerabilities
- [ ] Test maintenance is routine part of development

---

## Next Steps

1. **Get buy-in** - Present this analysis to the team
2. **Set up infrastructure** - Install and configure testing tools
3. **Start with critical** - Begin with heuristic analysis and Stripe webhooks
4. **Build momentum** - Add tests incrementally with each PR
5. **Track progress** - Monitor coverage metrics weekly
6. **Enforce quality** - Require tests for new features

---

## Conclusion

With zero test coverage, this codebase faces significant risks in reliability, maintainability, and business continuity. Implementing the phased approach outlined above will:

- Reduce production bugs
- Enable confident refactoring
- Improve developer velocity
- Protect revenue streams
- Build a sustainable codebase

**Recommended immediate action:** Start with Phase 1 (infrastructure) and Phase 2 (critical business logic) to address the highest-risk areas within the next 2-3 weeks.
