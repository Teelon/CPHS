"use client"

import { ImageIcon, ExternalLink, Globe } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

export function PhotoDatabaseInfo() {
  const { language, toggleLanguage } = useLanguage()

  const text = {
    title: {
      en: "CPHS Photo Database",
      fr: "Base de données photo CPHS",
    },
    bilingual: {
      en: "Bilingual",
      fr: "Bilingue",
    },
    description: {
      en: "The Canadian Pride Historical Society maintains a photo database and wiki with historical images and information.",
      fr: "La Société historique de la fierté canadienne maintient une base de données photographique et un wiki avec des images et des informations historiques.",
    },
    englishMetadata: {
      en: "English Metadata",
      fr: "Métadonnées en anglais",
    },
    englishDescription: {
      en: "Photo descriptions, locations, dates, and historical context are available in English.",
      fr: "Les descriptions de photos, les lieux, les dates et le contexte historique sont disponibles en anglais.",
    },
    frenchMetadata: {
      en: "French Metadata",
      fr: "Métadonnées en français",
    },
    frenchDescription: {
      en: "Photo descriptions, locations, dates, and historical context are available in French.",
      fr: "Les descriptions de photos, les lieux, les dates et le contexte historique sont disponibles en français.",
    },
    databaseUrl: {
      en: "Photo Database URL:",
      fr: "URL de la base de données photo:",
    },
    cphs: {
      en: "CPHS Wiki Photo Database",
      fr: "Base de données photo du Wiki CPHS",
    },
    browseDatabase: {
      en: "Browse Photo Database",
      fr: "Parcourir la base de données photo",
    },
    toggleLanguage: {
      en: "Français",
      fr: "English",
    },
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <ImageIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="flex items-center gap-2">
        {text.title[language]}
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-100">
          <Globe className="mr-1 h-3 w-3" />
          {text.bilingual[language]}
        </Badge>
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{text.description[language]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-white p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">{text.englishMetadata[language]}</h4>
            <p className="text-xs text-muted-foreground">{text.englishDescription[language]}</p>
          </div>
          <div className="bg-white p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">{text.frenchMetadata[language]}</h4>
            <p className="text-xs text-muted-foreground">{text.frenchDescription[language]}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {text.databaseUrl[language]}{" "}
          <a
            href="https://canandapridehistory.sharepoint.com/sites/CanadianPrideHistoricalSociety/Pride%20Photo%20Database/Forms/AllItems.aspx?ovuser=67502267%2Dcb7e%2D47ed%2Da00b%2Dcc5c3b64093b%2Cjklauke%40cphs%2Eca&OR=Teams%2DHL&CT=1732143945042&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNDEwMjAwMTMxNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D"
            className="underline text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text.cphs[language]}
            <ExternalLink className="ml-1 h-3 w-3 inline" />
          </a>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() =>
              window.open(
                "https://canandapridehistory.sharepoint.com/sites/CanadianPrideHistoricalSociety/Pride%20Photo%20Database/Forms/AllItems.aspx?ovuser=67502267%2Dcb7e%2D47ed%2Da00b%2Dcc5c3b64093b%2Cjklauke%40cphs%2Eca&OR=Teams%2DHL&CT=1732143945042&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNDEwMjAwMTMxNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D",
                "_blank",
              )
            }
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {text.browseDatabase[language]}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={toggleLanguage}
          >
            <Globe className="mr-2 h-4 w-4" />
            {text.toggleLanguage[language]}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

