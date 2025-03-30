"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type LanguageContextType = {
  language: "en" | "fr"
  setLanguage: (lang: "en" | "fr") => void
  toggleLanguage: () => void
  t: (key: string, texts: Record<string, Record<string, string>>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  // Try to load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("pims-language")
    if (savedLanguage === "en" || savedLanguage === "fr") {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("pims-language", language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en")
  }

  // Helper function to get translated text
  const t = (key: string, texts: Record<string, Record<string, string>>) => {
    if (!texts[key]) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    return texts[key][language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

