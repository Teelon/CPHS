import type React from "react"
import { components } from "@/lib/design-system"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ heading, text, children, className }: PageHeaderProps) {
  return (
    <div className={cn(components.pageHeader, className)}>
      <div>
        <h1 className={components.pageTitle}>{heading}</h1>
        {text && <p className={components.pageDescription}>{text}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

