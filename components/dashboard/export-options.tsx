"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Table, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { useSubscription } from "@/components/providers/subscription-provider"
import type { ExportOptionsProps } from "@/lib/types"

export default function ExportOptions({ dealer }: ExportOptionsProps) {
  const [exporting, setExporting] = useState(false)
  const { canAccessFeature, plan } = useSubscription()

  const handleExport = async (format: "csv" | "pdf") => {
    // Check if user can access export feature
    if (!canAccessFeature('export')) {
      toast.error("Upgrade Required", {
        description: `Export feature is not available on the ${plan} plan. Please upgrade to access exports.`,
      })
      return
    }

    setExporting(true)
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      })

      if (res.ok) {
        if (format === 'csv') {
          // Download CSV file
          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `revvdoctor-export-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)

          toast.success("Export Complete", {
            description: "Your CSV file has been downloaded successfully.",
          })
        } else {
          const data = await res.json()
          toast.info("PDF Export", {
            description: data.message || "PDF export is coming soon. Please use CSV for now.",
          })
        }
      } else {
        const error = await res.json()
        if (error.error === 'payment_failed') {
          toast.error("Payment Required", {
            description: error.message,
          })
        } else if (error.error === 'feature_not_available') {
          toast.error("Upgrade Required", {
            description: error.message,
          })
        } else {
          toast.error("Export Failed", {
            description: error.message || "Failed to export data. Please try again.",
          })
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export Failed", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setExporting(false)
    }
  }

  const canExport = canAccessFeature('export')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => handleExport("csv")}
          disabled={exporting || !canExport}
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : !canExport ? (
            <Lock className="w-4 h-4 mr-2" />
          ) : (
            <Table className="w-4 h-4 mr-2" />
          )}
          Export to CSV
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => handleExport("pdf")}
          disabled={exporting || !canExport}
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : !canExport ? (
            <Lock className="w-4 h-4 mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Export to PDF
        </Button>

        <p className="text-xs text-muted-foreground">
          {canExport
            ? "Export today's healthy cars list with all details and filters applied."
            : `⚡ Upgrade to ${plan === 'trial' ? 'Basic' : 'higher'} plan to unlock export features.`}
        </p>
      </CardContent>
    </Card>
  )
}
