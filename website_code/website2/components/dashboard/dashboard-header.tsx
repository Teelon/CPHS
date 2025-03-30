import type React from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { components } from "@/lib/design-system"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export default function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className={components.pageHeader}>
      <div>
        <h1 className={components.pageTitle}>{heading}</h1>
        {text && <p className={components.pageDescription}>{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <div className="hidden md:flex items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}

