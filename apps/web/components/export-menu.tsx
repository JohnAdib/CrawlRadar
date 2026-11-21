"use client"

import { Button } from "@crawlradar/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@crawlradar/ui/components/dropdown-menu"
import { Database, Download, Filter } from "lucide-react"

import { type Filters, toQuery } from "@/lib/filters"

export function ExportMenu({
  filters,
}: {
  filters: Filters & { site: string }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background">
          <Download /> <span className="hidden sm:inline">Export</span> CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download as CSV</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href={`/export${toQuery(filters)}`} download>
            <Filter /> Current view
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/export${toQuery({ site: filters.site })}`} download>
            <Database /> All data for this site
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
