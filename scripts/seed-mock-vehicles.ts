/**
 * Script to seed mock vehicle data with images for testing the dashboard
 * Run with: npx tsx scripts/seed-mock-vehicles.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Real car images from Unsplash (free to use)
const carImages = [
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80', // BMW
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80', // Mercedes
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', // Audi
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', // Tesla
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', // Porsche
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', // Range Rover
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80', // Jaguar
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80', // Volvo
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80', // Lexus
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80', // Alfa Romeo
]

const mockVehicles = [
  {
    make: 'BMW',
    model: '3 Series',
    year: 2019,
    price: 18500,
    mileage: 45000,
    condition: 'Excellent',
    auction_site: 'RAW2K',
    listing_url: 'https://www.raw2k.co.uk/vehicle/bmw-3-series-2019',
    image_url: carImages[0],
    match_score: 92,
    verdict: 'HEALTHY',
    reason: 'Low mileage, excellent condition, strong resale value',
    profit_estimate: 3500,
  },
  {
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2020,
    price: 22900,
    mileage: 32000,
    condition: 'Excellent',
    auction_site: 'BCA',
    listing_url: 'https://www.bca.co.uk/vehicle/mercedes-c-class-2020',
    image_url: carImages[1],
    match_score: 95,
    verdict: 'HEALTHY',
    reason: 'Very low mileage, premium brand, high demand',
    profit_estimate: 4200,
  },
  {
    make: 'Audi',
    model: 'A4',
    year: 2018,
    price: 15200,
    mileage: 85000,
    condition: 'Good',
    auction_site: 'Autorola',
    listing_url: 'https://www.autorola.co.uk/vehicle/audi-a4-2018',
    image_url: carImages[2],
    match_score: 45,
    verdict: 'AVOID',
    reason: 'High mileage; Previous accident damage; Timing belt service overdue',
    profit_estimate: 0,
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    price: 28500,
    mileage: 28000,
    condition: 'Excellent',
    auction_site: 'RAW2K',
    listing_url: 'https://www.raw2k.co.uk/vehicle/tesla-model-3-2021',
    image_url: carImages[3],
    match_score: 88,
    verdict: 'HEALTHY',
    reason: 'Electric vehicle, low running costs, excellent condition',
    profit_estimate: 3800,
  },
  {
    make: 'Porsche',
    model: 'Cayenne',
    year: 2019,
    price: 45000,
    mileage: 38000,
    condition: 'Excellent',
    auction_site: 'Manheim',
    listing_url: 'https://www.manheim.co.uk/vehicle/porsche-cayenne-2019',
    image_url: carImages[4],
    match_score: 91,
    verdict: 'HEALTHY',
    reason: 'Luxury SUV, strong demand, excellent condition',
    profit_estimate: 5500,
  },
  {
    make: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2018,
    price: 35000,
    mileage: 52000,
    condition: 'Good',
    auction_site: 'BCA',
    listing_url: 'https://www.bca.co.uk/vehicle/range-rover-sport-2018',
    image_url: carImages[5],
    match_score: 78,
    verdict: 'HEALTHY',
    reason: 'Popular SUV, good condition, reasonable mileage',
    profit_estimate: 2800,
  },
  {
    make: 'Jaguar',
    model: 'F-Pace',
    year: 2019,
    price: 24500,
    mileage: 42000,
    condition: 'Good',
    auction_site: 'Autorola',
    listing_url: 'https://www.autorola.co.uk/vehicle/jaguar-f-pace-2019',
    image_url: carImages[6],
    match_score: 82,
    verdict: 'HEALTHY',
    reason: 'Premium SUV, good spec, solid condition',
    profit_estimate: 3100,
  },
  {
    make: 'Volvo',
    model: 'XC60',
    year: 2020,
    price: 27500,
    mileage: 35000,
    condition: 'Excellent',
    auction_site: 'RAW2K',
    listing_url: 'https://www.raw2k.co.uk/vehicle/volvo-xc60-2020',
    image_url: carImages[7],
    match_score: 86,
    verdict: 'HEALTHY',
    reason: 'Safe, reliable, low mileage, excellent condition',
    profit_estimate: 3300,
  },
  {
    make: 'Lexus',
    model: 'IS 300h',
    year: 2019,
    price: 19800,
    mileage: 48000,
    condition: 'Good',
    auction_site: 'BCA',
    listing_url: 'https://www.bca.co.uk/vehicle/lexus-is-300h-2019',
    image_url: carImages[8],
    match_score: 80,
    verdict: 'HEALTHY',
    reason: 'Hybrid, reliable brand, good fuel economy',
    profit_estimate: 2600,
  },
  {
    make: 'Alfa Romeo',
    model: 'Giulia',
    year: 2018,
    price: 16500,
    mileage: 65000,
    condition: 'Fair',
    auction_site: 'Manheim',
    listing_url: 'https://www.manheim.co.uk/vehicle/alfa-romeo-giulia-2018',
    image_url: carImages[9],
    match_score: 55,
    verdict: 'REVIEW',
    reason: 'Higher than average mileage, needs inspection for common issues',
    profit_estimate: 1200,
  },
]

async function seedMockVehicles() {
  console.log('🌱 Starting mock vehicle data seeding...\n')

  // Get the first dealer (or create a test dealer)
  const { data: dealers, error: dealerError } = await supabase
    .from('dealers')
    .select('*')
    .limit(1)

  if (dealerError) {
    console.error('❌ Error fetching dealers:', dealerError)
    process.exit(1)
  }

  if (!dealers || dealers.length === 0) {
    console.error('❌ No dealers found. Please create a dealer account first.')
    process.exit(1)
  }

  const dealer = dealers[0]
  console.log(`✅ Found dealer: ${dealer.dealer_name} (${dealer.id})\n`)

  // Add dealer_id and timestamps to all vehicles
  const vehiclesToInsert = mockVehicles.map(vehicle => ({
    ...vehicle,
    dealer_id: dealer.id,
    created_at: new Date().toISOString(),
    is_sent: false,
  }))

  // Insert vehicles
  console.log(`📝 Inserting ${vehiclesToInsert.length} mock vehicles...\n`)

  const { data, error } = await supabase
    .from('vehicle_matches')
    .insert(vehiclesToInsert)
    .select()

  if (error) {
    console.error('❌ Error inserting vehicles:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully inserted ${data?.length || 0} vehicles!\n`)
  console.log('📊 Summary:')
  console.log(`  - HEALTHY vehicles: ${mockVehicles.filter(v => v.verdict === 'HEALTHY').length}`)
  console.log(`  - AVOID vehicles: ${mockVehicles.filter(v => v.verdict === 'AVOID').length}`)
  console.log(`  - REVIEW vehicles: ${mockVehicles.filter(v => v.verdict === 'REVIEW').length}`)
  console.log(`  - Total profit potential: £${mockVehicles.reduce((sum, v) => sum + v.profit_estimate, 0).toLocaleString()}\n`)
  console.log('🎉 Mock data seeded successfully! Visit your dashboard to see the vehicles.')
}

seedMockVehicles().catch(console.error)
