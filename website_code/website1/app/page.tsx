"use client"

import Link from "next/link"
import { Calendar, Globe, ListFilter, PlusCircle, Users, Image, BarChart, BookOpen } from "lucide-react"
import { DataSummary } from "@/components/data-summary"
import { SQLDatabaseInfo } from "@/components/sharepoint-info"
import { PhotoDatabaseInfo } from "@/components/photo-database-info"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrideEventsTimelineChart } from "@/components/dashboard/pride-events-timeline-chart"
import { PrideEventsCalendar } from "@/components/dashboard/pride-events-calendar"

export default function HomePage() {
  const { language } = useLanguage()

  const texts = {
    title: {
      en: "Pride Information Management System",
      fr: "Système de gestion de l'information sur la fierté",
    },
    subtitle: {
      en: "Preserving and celebrating Canadian LGBTQ+ history through ethical AI-powered archiving",
      fr: "Préserver et célébrer l'histoire LGBTQ+ canadienne grâce à l'archivage éthique alimenté par l'IA",
    },
    dashboardTitle: {
      en: "Dashboard Overview",
      fr: "Aperçu du tableau de bord",
    },
    metadataAccuracy: {
      en: "Metadata Accuracy",
      fr: "Précision des métadonnées",
    },
    searchTrends: {
      en: "Search Trends",
      fr: "Tendances de recherche",
    },
    researchTitle: {
      en: "Research Questions",
      fr: "Questions de recherche",
    },
    dashboards: {
      geographic: {
        title: { en: "Geographic Distribution", fr: "Distribution géographique" },
        description: { en: "Events by province and city", fr: "Événements par province et ville" },
        subtitle: { en: "Provincial Analysis", fr: "Analyse provinciale" },
        text: { en: "View events across Canada", fr: "Voir les événements à travers le Canada" },
      },
      topics: {
        title: { en: "Events by Topic", fr: "Événements par thème" },
        description: { en: "Categorization of Pride events", fr: "Catégorisation des événements de la Fierté" },
        subtitle: { en: "Topic Analysis", fr: "Analyse thématique" },
        text: { en: "Festivals, parades, workshops & more", fr: "Festivals, défilés, ateliers et plus" },
      },
      seasonal: {
        title: { en: "Seasonal Distribution", fr: "Distribution saisonnière" },
        description: { en: "Events by month and season", fr: "Événements par mois et saison" },
        subtitle: { en: "Monthly Trends", fr: "Tendances mensuelles" },
        text: { en: "When Pride events happen", fr: "Quand les événements de la Fierté ont lieu" },
      },
      organizations: {
        title: { en: "Organizations", fr: "Organisations" },
        description: { en: "Pride organizations across Canada", fr: "Organisations de la Fierté à travers le Canada" },
        subtitle: { en: "Organization Data", fr: "Données sur les organisations" },
        text: {
          en: "From community groups to national networks",
          fr: "Des groupes communautaires aux réseaux nationaux",
        },
      },
      recent: {
        title: { en: "Recent Additions", fr: "Ajouts récents" },
        description: { en: "Newly added Pride events", fr: "Événements de la Fierté récemment ajoutés" },
        subtitle: { en: "Latest Records", fr: "Derniers enregistrements" },
        text: { en: "Recently added to the database", fr: "Récemment ajoutés à la base de données" },
      },
      photos: {
        title: { en: "Photo Gallery", fr: "Galerie de photos" },
        description: { en: "Historical Pride images", fr: "Images historiques de la Fierté" },
        subtitle: { en: "Photo Archive", fr: "Archives photographiques" },
        text: { en: "Visual history of Pride in Canada", fr: "Histoire visuelle de la Fierté au Canada" },
      },
      research: {
        title: { en: "Research Portal", fr: "Portail de recherche" },
        description: { en: "Answer research questions", fr: "Répondre aux questions de recherche" },
        subtitle: { en: "Research Tools", fr: "Outils de recherche" },
        text: { en: "Explore Pride history data", fr: "Explorer les données historiques de la Fierté" },
      },
    },
    buttons: {
      explore: { en: "Explore Archives", fr: "Explorer les archives" },
      contribute: { en: "Contribute Data", fr: "Contribuer des données" },
      viewFullDashboard: { en: "View Full Dashboard", fr: "Voir le tableau de bord complet" },
      viewResearchPortal: { en: "View Research Portal", fr: "Voir le portail de recherche" },
    },
    cards: {
      prideEvents: {
        title: { en: "Pride Events Timeline", fr: "Chronologie des événements de la fierté" },
      },
      seasonal: {
        title: { en: "Seasonal Distribution", fr: "Distribution saisonnière" },
      },
    },
  }

  const dashboards = [
    {
      href: "/dashboard/geographic",
      icon: <Globe className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      textKey: "geographic",
    },
    {
      href: "/dashboard/topics",
      icon: <ListFilter className="h-6 w-6 text-pink-600" />,
      bgColor: "bg-pink-100",
      textKey: "topics",
    },
    {
      href: "/dashboard/seasonal",
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      textKey: "seasonal",
    },
    {
      href: "/dashboard/organizations",
      icon: <Users className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
      textKey: "organizations",
    },
    {
      href: "/dashboard/recent",
      icon: <PlusCircle className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
      textKey: "recent",
    },
    {
      href: "/photos",
      icon: <Image className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      textKey: "photos",
    },
    {
      href: "/research",
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      textKey: "research",
    },
  ]

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-white">
      <div className="w-full max-w-6xl">
        <div className="bg-purple-800 text-white p-8 rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-4">{texts.title[language]}</h1>
          <p className="text-lg mb-8">{texts.subtitle[language]}</p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/search"
              className="px-6 py-3 bg-white text-purple-800 rounded-lg font-medium hover:bg-purple-100 transition-colors"
            >
              {texts.buttons.explore[language]}
            </Link>
            <Link
              href="/contribute"
              className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {texts.buttons.contribute[language]}
            </Link>
          </div>
        </div>

        <SQLDatabaseInfo />
        <PhotoDatabaseInfo />

        <DataSummary />

        {/* Dashboard Overview Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center text-purple-800">
              <BarChart className="mr-2 h-6 w-6" />
              {texts.dashboardTitle[language]}
            </h2>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-purple-800 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {texts.buttons.viewFullDashboard[language]}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{texts.cards.prideEvents.title[language]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PrideEventsTimelineChart />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{texts.cards.seasonal.title[language]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PrideEventsCalendar />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.href}
              href={dashboard.href}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start mb-4">
                <div className={`${dashboard.bgColor} p-3 rounded-lg mr-4`}>{dashboard.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold">{texts.dashboards[dashboard.textKey].title[language]}</h2>
                  <p className="text-gray-600 text-sm">{texts.dashboards[dashboard.textKey].description[language]}</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="font-bold text-2xl text-gray-700">
                    {texts.dashboards[dashboard.textKey].subtitle[language]}
                  </p>
                  <p className="text-sm text-gray-500">{texts.dashboards[dashboard.textKey].text[language]}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

