"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { LanguageToggle } from "@/components/language-toggle"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: { en: "Home", fr: "Accueil" } },
    { href: "/search", label: { en: "Search", fr: "Recherche" } },
    { href: "/contribute", label: { en: "Contribute", fr: "Contribuer" } },
    { href: "/dashboard", label: { en: "Dashboards", fr: "Tableaux de bord" } },
    { href: "/research", label: { en: "Research", fr: "Recherche" } },
    { href: "/photos", label: { en: "Photos", fr: "Photos" } },
  ]

  return (
    <header className="bg-purple-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl text-white flex items-center">
            <span className="mr-2">CPHS</span>
            <span className="text-lg font-normal">PIMS</span>
          </Link>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-purple-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex gap-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`hover:text-purple-200 transition-colors ${
                        pathname === item.href ? "text-white font-medium border-b-2 border-white pb-1" : ""
                      }`}
                    >
                      {item.label[language]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav>
              <ul className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-2 hover:bg-purple-700 px-3 rounded ${
                        pathname === item.href ? "bg-purple-700 font-medium" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label[language]}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-purple-700">
                  <LanguageToggle />
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

