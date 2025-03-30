"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Search, Info, Menu, FileText, LayoutDashboard, FileBarChart2, Palette } from "lucide-react"
import { spacing } from "@/lib/design-system"

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      href: "/dashboard/articles",
      label: "Articles",
      icon: <FileBarChart2 className="h-4 w-4 mr-2" />,
    },
    {
      href: "/dashboard/articles/new",
      label: "New Article",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      href: "/dashboard/style-guide",
      label: "Style Guide",
      icon: <Palette className="h-4 w-4 mr-2" />,
    },
    {
      href: "/search",
      label: "Advanced Search",
      icon: <Search className="h-4 w-4 mr-2" />,
    },
    {
      href: "/about",
      label: "About",
      icon: <Info className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <div className="flex flex-col gap-4">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    pathname === route.href ? "bg-muted font-medium" : "font-normal",
                  )}
                  asChild
                >
                  <Link href={route.href} className="flex items-center">
                    {route.icon}
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="md:hidden border-b sticky top-0 z-30 bg-background">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full flex justify-start h-14 px-4 gap-2">
                  <Menu className="h-5 w-5" />
                  <span>Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center text-lg font-medium transition-colors hover:text-primary",
                        pathname === route.href ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className={spacing.pageWrapper}>{children}</div>
        </main>
      </div>
    </div>
  )
}

