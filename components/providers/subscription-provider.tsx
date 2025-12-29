"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface SubscriptionContextType {
  isActive: boolean
  status: 'active' | 'trial' | 'expired' | 'canceled' | 'payment_failed' | null
  plan: 'basic' | 'startup' | 'premium' | 'trial' | null
  daysLeft: number
  paymentFailed: boolean
  loading: boolean
  canAccessFeature: (feature: string) => boolean
  checkLimit: (feature: string) => Promise<{ allowed: boolean; reason?: string }>
  showPaymentModal: boolean
  setShowPaymentModal: (show: boolean) => void
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/status")
      if (res.ok) {
        const data = await res.json()
        setSubscriptionData(data)

        // Auto-show payment modal if payment failed
        if (data.paymentFailed) {
          setShowPaymentModal(true)
        }
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const canAccessFeature = (feature: string): boolean => {
    if (!subscriptionData || loading) return false
    if (subscriptionData.paymentFailed) return false
    if (!subscriptionData.isActive) return false

    // Feature access logic
    const planLimits: Record<string, Record<string, boolean>> = {
      trial: {
        export: false,
        api_access: false,
        priority_support: false,
        email_alerts: true,
      },
      basic: {
        export: true,
        api_access: false,
        priority_support: false,
        email_alerts: true,
      },
      startup: {
        export: true,
        api_access: true,
        priority_support: false,
        email_alerts: true,
      },
      premium: {
        export: true,
        api_access: true,
        priority_support: true,
        email_alerts: true,
      },
    }

    const plan = subscriptionData.plan || 'trial'
    return planLimits[plan]?.[feature] === true
  }

  const checkLimit = async (feature: string): Promise<{ allowed: boolean; reason?: string }> => {
    try {
      const res = await fetch(`/api/subscription/check-limit?feature=${feature}`)
      if (res.ok) {
        return await res.json()
      }
      return { allowed: false, reason: "Failed to check limit" }
    } catch (error) {
      console.error("Failed to check limit:", error)
      return { allowed: false, reason: "An error occurred" }
    }
  }

  const value: SubscriptionContextType = {
    isActive: subscriptionData?.isActive || false,
    status: subscriptionData?.status || null,
    plan: subscriptionData?.plan || null,
    daysLeft: subscriptionData?.daysLeft || 0,
    paymentFailed: subscriptionData?.paymentFailed || false,
    loading,
    canAccessFeature,
    checkLimit,
    showPaymentModal,
    setShowPaymentModal,
    refresh: fetchSubscription,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
