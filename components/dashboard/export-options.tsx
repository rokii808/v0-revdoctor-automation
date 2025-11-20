"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Table } from "lucide-react"
import type { ExportOptionsProps } from "@/lib/types"

export default function ExportOptions({ dealer }: ExportOptionsProps) {
  const handleExport = async (format: "csv" | "pdf") => {
    // In real app, this would call API to generate export
    console.log("Exporting data as:", format)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("csv")}>
          <Table className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>

        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("pdf")}>
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </Button>

        <p className="text-xs text-muted-foreground">
          Export today's healthy cars list with all details and filters applied.
        </p>
      </CardContent>
    </Card>
  )
}
