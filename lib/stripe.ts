import Stripe from "stripe"

// Use a placeholder for build time, will fail at runtime if actually used without the key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build"

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-12-15.clover",
})

export const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || "price_basic_placeholder",
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
}
