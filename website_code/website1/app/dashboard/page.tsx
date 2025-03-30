"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrideEventsTimelineChart } from "@/components/dashboard/pride-events-timeline-chart"
import { GeographicCoverageMap } from "@/components/dashboard/geographic-coverage-map"
import { PrideTopicsChart } from "@/components/dashboard/pride-topics-chart"
import { PrideEventsCalendar } from "@/components/dashboard/pride-events-calendar"
import { PrideCitiesChart } from "@/components/dashboard/pride-cities-chart"
import { useLanguage } from "@/contexts/language-context"
import { SQLDatabaseInfo } from "@/components/sharepoint-info"
import { Button } from "@/components/ui/button"
import { Download, Info } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type DashboardStats = {
  totalRecords: number
  provinces: number
  cities: number
  organizations: number
  topics: number
}

export default function DashboardPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    provinces: 0,
    cities: 0,
    organizations: 0,
    topics: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/pims?type=stats")

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error("Failed to fetch dashboard stats")
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const texts = {
    title: {
      en: "LGBTQ+ Research Dashboard",
      fr: "Tableau de bord de recherche LGBTQ+",
    },
    subtitle: {
      en: "Visualizing Canadian Pride history and LGBTQ+ community data",
      fr: "Visualisation de l'histoire de la Fierté canadienne et des données de la communauté LGBTQ+",
    },
    cards: {
      prideEvents: {
        title: {
          en: "Pride Events Timeline",
          fr: "Chronologie des événements de la Fierté",
        },
        description: {
          en: "Historical growth of Pride celebrations across Canada",
          fr: "Croissance historique des célébrations de la Fierté à travers le Canada",
        },
      },
      topics: {
        title: {
          en: "Top Pride Event Topics",
          fr: "Principaux sujets des événements de la Fierté",
        },
        description: {
          en: "Most common topics in Pride events",
          fr: "Sujets les plus courants dans les événements de la Fierté",
        },
      },
      seasonal: {
        title: {
          en: "Seasonal Distribution",
          fr: "Distribution saisonnière",
        },
        description: {
          en: "Pride events by month showing seasonal patterns",
          fr: "Événements de la Fierté par mois montrant les tendances saisonnières",
        },
      },
      cities: {
        title: {
          en: "Top Cities for Pride Events",
          fr: "Principales villes pour les événements de la Fierté",
        },
        description: {
          en: "Cities with the most Pride events",
          fr: "Villes avec le plus d'événements de la Fierté",
        },
      },
      geographic: {
        title: {
          en: "Geographic Coverage",
          fr: "Couverture géographique",
        },
        description: {
          en: "Distribution of documented Pride events by province",
          fr: "Répartition des événements de la Fierté documentés par province",
        },
      },
    },
    stats: {
      totalRecords: {
        label: {
          en: "Total Records",
          fr: "Total des enregistrements",
        },
      },
      provinces: {
        label: {
          en: "Provinces",
          fr: "Provinces",
        },
      },
      cities: {
        label: {
          en: "Cities & Towns",
          fr: "Villes et villages",
        },
      },
      organizations: {
        label: {
          en: "Organizations",
          fr: "Organisations",
        },
      },
      topics: {
        label: {
          en: "Topics",
          fr: "Sujets",
        },
      },
    },
    downloadData: {
      en: "Download Research Data",
      fr: "Télécharger les données de recherche",
    },
    methodology: {
      en: "Research Methodology",
      fr: "Méthodologie de recherche",
    },
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{texts.title[language]}</h1>
        <p className="text-gray-600 mb-6">{texts.subtitle[language]}</p>
        <SQLDatabaseInfo />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{texts.stats.totalRecords.label[language]}</p>
            <p className="text-2xl font-bold mt-2 text-purple-600">{stats.totalRecords}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalRecords} records</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{texts.stats.organizations.label[language]}</p>
            <p className="text-2xl font-bold mt-2 text-green-600">{stats.organizations}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.organizations} unique orgs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{texts.stats.cities.label[language]}</p>
            <p className="text-2xl font-bold mt-2 text-blue-600">{stats.cities}</p>
            <p className="text-xs text-muted-foreground mt-1">Across Canada</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{texts.stats.provinces.label[language]}</p>
            <p className="text-2xl font-bold mt-2 text-amber-600">{stats.provinces}</p>
            <p className="text-xs text-muted-foreground mt-1">Provinces & territories</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{texts.stats.topics.label[language]}</p>
            <p className="text-2xl font-bold mt-2 text-pink-600">{stats.topics}</p>
            <p className="text-xs text-muted-foreground mt-1">Unique topics</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{texts.cards.prideEvents.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{texts.cards.prideEvents.description[language]}</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <PrideEventsTimelineChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{texts.cards.topics.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{texts.cards.topics.description[language]}</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <PrideTopicsChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{texts.cards.seasonal.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{texts.cards.seasonal.description[language]}</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <PrideEventsCalendar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{texts.cards.cities.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{texts.cards.cities.description[language]}</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <PrideCitiesChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{texts.cards.geographic.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{texts.cards.geographic.description[language]}</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <GeographicCoverageMap />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {texts.downloadData[language]}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/methodology" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {texts.methodology[language]}
          </Link>
        </Button>
      </div>
    </div>
  )
}

