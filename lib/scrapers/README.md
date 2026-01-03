# Auction Site API Integration Guide

This document outlines API access for each auction site and how to configure scrapers.

## 🎯 Auction Sites & API Status

### 1. RAW2K (https://www.raw2k.co.uk)
**API Status:** Contact for API access
**Alternative:** RSS feed or web scraping
**Contact:** info@raw2k.co.uk

**What to ask for:**
- API endpoint for active vehicle listings
- Authentication method (API key, OAuth)
- Rate limits
- Documentation URL

**Required fields:**
- Vehicle ID / Lot number
- Make, Model, Year
- Price (current bid)
- Mileage
- Direct URL to listing page
- Images (at least 1-3)
- Auction date/time

---

### 2. BCA (British Car Auctions)
**API Status:** Partner program available
**Website:** https://www.bca.co.uk/
**Documentation:** https://www.bca.co.uk/partner-services

**Options:**
1. **BCA Partner API** - Requires partnership agreement
2. **BCA Data Feed** - XML/JSON feed for partners
3. **Manual access** - Login portal scraping (not recommended)

**Contact:** partnerships@bca.com

---

### 3. Autorola
**API Status:** API available for registered dealers
**Website:** https://www.autorola.co.uk/
**Documentation:** https://api.autorola.com/

**How to get access:**
1. Register as a dealer on Autorola
2. Request API credentials from account manager
3. Use RESTful API with OAuth2

**Endpoints:**
- `GET /api/v1/vehicles` - List all vehicles
- `GET /api/v1/vehicles/{id}` - Get vehicle details

---

### 4. Manheim
**API Status:** Manheim Digital (API available)
**Website:** https://www.manheim.co.uk/
**Product:** Manheim Express / Simulcast API

**Access requirements:**
- Active Manheim dealer account
- API key from account manager
- Possible subscription fee

**Contact:** manheim.digital@coxautoinc.com

---

## 🔧 Implementation Priority

### Phase 1: Mock Data (Immediate - Testing)
Use hardcoded vehicle data to test the full workflow

### Phase 2: RAW2K (Week 1)
- Easiest to start with (smaller site)
- Contact for API or use RSS if available
- Fallback to web scraping if needed

### Phase 3: Autorola (Week 2)
- Register dealer account
- Request API credentials
- Implement OAuth2 flow

### Phase 4: BCA + Manheim (Week 3-4)
- These require partnership agreements
- May need to start with smaller volume
- Consider paid tiers

---

## 📋 Environment Variables Needed

Add to `.env.local`:

```bash
# RAW2K API
RAW2K_API_KEY=your-key-here
RAW2K_API_URL=https://api.raw2k.co.uk/v1

# BCA API
BCA_API_KEY=your-key-here
BCA_API_SECRET=your-secret-here
BCA_API_URL=https://api.bca.co.uk/v1

# Autorola API
AUTOROLA_CLIENT_ID=your-client-id
AUTOROLA_CLIENT_SECRET=your-client-secret
AUTOROLA_API_URL=https://api.autorola.com/v1

# Manheim API
MANHEIM_API_KEY=your-key-here
MANHEIM_DEALER_ID=your-dealer-id
MANHEIM_API_URL=https://api.manheim.com/v1
```

---

## 🚀 Quick Start: Testing with Mock Data

While waiting for API access, use the mock scraper to test:

```typescript
import { createMockScraper } from './lib/scrapers/mock-scraper'

// Returns realistic test data
const vehicles = await createMockScraper()
```

This allows you to:
- ✅ Test AI classification
- ✅ Test preference matching
- ✅ Test email digests
- ✅ Prove the workflow works end-to-end

---

## 📞 Next Steps

1. **Immediate:** Implement mock scraper for testing
2. **Day 1-3:** Contact RAW2K for API access
3. **Day 3-7:** Register with Autorola, request API
4. **Week 2:** Reach out to BCA partnerships team
5. **Week 3:** Contact Manheim for dealer API access

---

## ⚠️ Important Notes

- **Never scrape without permission** - Can lead to IP bans
- **Respect rate limits** - APIs have request quotas
- **Cache responses** - Don't request same data repeatedly
- **Use webhooks** - If available, for real-time updates
- **Legal compliance** - Some sites prohibit automated access in ToS
