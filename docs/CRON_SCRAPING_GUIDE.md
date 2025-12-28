# RevvDoctor Cron-Based Scraping System

## Overview

This replaces the n8n workflow with native Vercel Cron jobs for automated vehicle scraping and digest sending.

## Architecture

### Cron Jobs

1. **Scrape RAW2K** (`/api/cron/scrape-raw2k`)
   - Runs every 6 hours: 12am, 6am, 12pm, 6pm
   - Scrapes RAW2K auction site for vehicle listings
   - Analyzes each vehicle with AI (OpenAI GPT-4o-mini)
   - Stores "HEALTHY" vehicles in insights table
   - Updates system stats

2. **Send Digests** (`/api/cron/send-digests`)
   - Runs daily at 8am GMT
   - Fetches today's healthy vehicles for each dealer
   - Sends personalized email digest via Resend
   - Tracks digest delivery in database

### Security

All cron endpoints require Bearer token authentication:
\`\`\`
Authorization: Bearer {CRON_SECRET}
\`\`\`

Set `CRON_SECRET` in environment variables.

### Testing Locally

Trigger scraping manually:
\`\`\`bash
curl http://localhost:3000/api/cron/test
\`\`\`

Or visit: `http://localhost:3000/api/cron/test` in browser

### Environment Variables Required

- `CRON_SECRET` - Secret for authenticating cron requests
- `RESEND_API_KEY` - For sending emails
- `NEXT_PUBLIC_BASE_URL` - Base URL for email links
- `OPENAI_API_KEY` - For AI vehicle analysis (via AI SDK)
- All Supabase vars (already configured)

### Customizing Scraping

Edit `/app/api/cron/scrape-raw2k/route.ts`:

1. **Add more auction sites**: Create similar scraper functions for BCA, Copart
2. **Adjust AI prompts**: Modify the analysis prompt for better insights
3. **Change schedule**: Edit `vercel.json` cron schedule
4. **Filter criteria**: Modify dealer matching logic

### Monitoring

Check logs in Vercel dashboard:
- Deployments → Functions → Cron logs
- See scraping results, errors, email delivery

### Advantages Over n8n

- No external service dependency
- Everything in one codebase
- TypeScript end-to-end
- Free on Vercel Pro plan
- Easier debugging with console.logs
- Version controlled workflow logic
