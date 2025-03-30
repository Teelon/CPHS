"use client"

import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function Footer() {
  const { language } = useLanguage()

  const footerText = {
    copyright: {
      en: "Canadian Pride Historical Society",
      fr: "Société historique de la fierté canadienne",
    },
    subtitle: {
      en: "Pride Information Management System (PIMS)",
      fr: "Système de gestion de l'information sur la fierté (PIMS)",
    },
    about: {
      en: "About",
      fr: "À propos",
    },
    privacy: {
      en: "Privacy",
      fr: "Confidentialité",
    },
    contact: {
      en: "Contact",
      fr: "Contact",
    },
  }

  return (
    <footer className="py-8 border-t mt-auto bg-gradient-to-r from-purple-800 to-pink-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} {footerText.copyright[language]}
            </p>
            <p className="text-center md:text-left text-sm text-pink-200">{footerText.subtitle[language]}</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="text-pink-200 hover:text-white transition-colors">
              {footerText.about[language]}
            </Link>
            <Link href="/privacy" className="text-pink-200 hover:text-white transition-colors">
              {footerText.privacy[language]}
            </Link>
            <Link href="/contact" className="text-pink-200 hover:text-white transition-colors">
              {footerText.contact[language]}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

