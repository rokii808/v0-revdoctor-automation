// RAW2K Vehicle Scraper
// Scrapes vehicle listings from RAW2K auction site

import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const input = await Actor.getInput();
const {
    startUrls = ['https://www.raw2k.co.uk/vehicles'],
    maxPages = 10,
    proxyConfiguration = { useApifyProxy: true }
} = input;

const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

const crawler = new PuppeteerCrawler({
    proxyConfiguration: proxyConfig,
    maxRequestsPerCrawl: maxPages,

    async requestHandler({ request, page, enqueueLinks }) {
        console.log(`Processing ${request.url}...`);

        // Wait for vehicle listings to load
        await page.waitForSelector('.vehicle-card, .vehicle-listing, article.vehicle', {
            timeout: 30000
        }).catch(() => {
            console.log('No vehicles found on this page');
            return;
        });

        // Extract vehicle data
        const vehicles = await page.$$eval('.vehicle-card, .vehicle-listing, article.vehicle', (cards) => {
            return cards.map(card => {
                // Helper to safely get text
                const getText = (selector) => {
                    const el = card.querySelector(selector);
                    return el ? el.textContent.trim() : '';
                };

                const getAttr = (selector, attr) => {
                    const el = card.querySelector(selector);
                    return el ? el.getAttribute(attr) : '';
                };

                // Extract title and parse make/model/year
                const title = getText('.title, h3, h4, .vehicle-name, .vehicle-title');
                const yearMatch = title.match(/\b(19|20)\d{2}\b/);
                const year = yearMatch ? yearMatch[0] : '';

                // Extract make (usually first word after year)
                const titleParts = title.split(' ');
                const yearIndex = titleParts.findIndex(part => part === year);
                const make = yearIndex >= 0 && titleParts[yearIndex + 1]
                    ? titleParts[yearIndex + 1]
                    : titleParts[0];

                // Model is everything after make
                const makeIndex = titleParts.indexOf(make);
                const model = titleParts.slice(makeIndex + 1).join(' ');

                // Get URL
                const relativeUrl = getAttr('a', 'href') || card.getAttribute('href');
                const url = relativeUrl && relativeUrl.startsWith('http')
                    ? relativeUrl
                    : `https://www.raw2k.co.uk${relativeUrl}`;

                // Extract price
                const priceText = getText('.price, .current-bid, .amount');
                const price = priceText.replace(/[^0-9.]/g, '');

                // Extract mileage
                const mileageText = getText('.mileage, .odometer, .miles');
                const mileage = mileageText.replace(/[^0-9]/g, '');

                return {
                    id: getAttr('', 'data-id') || `RAW2K-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    lotNumber: getText('.lot-number, .lot'),
                    make: make || '',
                    model: model || '',
                    year: year || '',
                    price: price || '0',
                    mileage: mileage || '0',
                    condition: getText('.condition, .category, .grade'),
                    auctionDate: getText('.auction-date, .time-left, .sale-date'),
                    url: url,
                    image: getAttr('img', 'src'),
                };
            }).filter(v => v.make && v.model && v.url); // Only valid vehicles
        });

        console.log(`Found ${vehicles.length} vehicles on ${request.url}`);

        // Save to dataset
        if (vehicles.length > 0) {
            await Actor.pushData(vehicles);
        }

        // Enqueue pagination links
        await enqueueLinks({
            selector: '.pagination a, a.next, a[rel="next"]',
            label: 'LISTING',
        });
    },

    async failedRequestHandler({ request }) {
        console.log(`Request ${request.url} failed after retries`);
    },
});

await crawler.run();

await Actor.exit();
