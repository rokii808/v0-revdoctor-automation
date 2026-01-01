"use client"

import { motion } from "framer-motion"
import { Car, TrendingUp, Zap, DollarSign, Eye } from "lucide-react"
import { type PlanTier } from "@/lib/plans/config"

interface StatsCardsProps {
  todaysCars: number
  weeklyScans: number
  totalHealthy: number
  averageRoi: number
  planTier: PlanTier
}

export function StatsCards({
  todaysCars,
  weeklyScans,
  totalHealthy,
  averageRoi,
}: StatsCardsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const stats = [
    {
      label: "Today's Picks",
      value: todaysCars,
      change: "+12%",
      changeType: "positive" as const,
      icon: Car,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-500",
    },
    {
      label: "Weekly Scans",
      value: weeklyScans,
      change: "+23%",
      changeType: "positive" as const,
      icon: Eye,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-500",
    },
    {
      label: "Healthy Cars",
      value: totalHealthy,
      change: "+8%",
      changeType: "positive" as const,
      icon: Zap,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100/50",
      iconBg: "bg-green-500",
    },
    {
      label: "Avg. ROI Potential",
      value: `£${averageRoi.toLocaleString()}`,
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50",
      iconBg: "bg-orange-500",
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Background Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full blur-3xl opacity-30 -mr-16 -mt-16`} />

            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-${stat.iconBg}/30`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  stat.changeType === 'positive'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
