"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-white hover:bg-purple-700"
      onClick={toggleLanguage}
      aria-label={language === "en" ? "Switch to French" : "Switch to English"}
    >
      <Globe className="h-4 w-4" />
      <span>{language === "en" ? "Français" : "English"}</span>
    </Button>
  )
}

