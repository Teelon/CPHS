"\"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

export function ConsentBanner() {
  const { language } = useLanguage()
  const [consentGiven, setConsentGiven] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const storedConsent = localStorage.getItem("pims-consent")
    if (storedConsent === "true") {
      setConsentGiven(true)
    }
  }, [])

  const giveConsent = () => {
    localStorage.setItem("pims-consent", "true")
    setConsentGiven(true)
  }

  const texts = {
    title: {
      en: "Data Collection Consent",
      fr: "Consentement de collecte de données",
    },
    description: {
      en: "We use cookies to analyze website traffic and optimize your experience. By using this site, you consent to our use of cookies.",
      fr: "Nous utilisons des cookies pour analyser le trafic du site Web et optimiser votre expérience. En utilisant ce site, vous consentez à notre utilisation de cookies.",
    },
    accept: {
      en: "Accept",
      fr: "Accepter",
    },
  }

  if (!mounted) {
    return null
  }

  if (consentGiven) {
    return null
  }

  return (
    <Card className="bg-yellow-50 border border-yellow-200">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-sm font-medium">{texts.title[language]}</h2>
          <p className="text-xs text-muted-foreground">{texts.description[language]}</p>
        </div>
        <Button size="sm" onClick={giveConsent}>
          {texts.accept[language]}
        </Button>
      </CardContent>
    </Card>
  )
}
"\

