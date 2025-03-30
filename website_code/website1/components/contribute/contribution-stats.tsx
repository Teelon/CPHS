"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

type ContributionStatsData = {
  totalContributions: number
  pendingValidations: number
  recentContributions: {
    title: string
    date: string
  }[]
}

export function ContributionStats() {
  const { language } = useLanguage()
  const [stats, setStats] = useState<ContributionStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        // Get total contributions
        const { count: totalCount, error: totalError } = await supabase
          .from("pims_entries")
          .select("*", { count: "exact", head: true })

        if (totalError) throw totalError

        // Get recent contributions
        const { data: recentData, error: recentError } = await supabase
          .from("pims_entries")
          .select("title, date")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentError) throw recentError

        setStats({
          totalContributions: totalCount || 0,
          pendingValidations: Math.floor(Math.random() * 20), // Mock data
          recentContributions: recentData || [],
        })
      } catch (error) {
        console.error("Error fetching contribution stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const texts = {
    title: {
      en: "Contribution Statistics",
      fr: "Statistiques de contribution",
    },
    totalContributions: {
      en: "Total Contributions",
      fr: "Contributions totales",
    },
    pendingValidations: {
      en: "Pending Validations",
      fr: "Validations en attente",
    },
    recentContributions: {
      en: "Recent Contributions",
      fr: "Contributions récentes",
    },
    loading: {
      en: "Loading statistics...",
      fr: "Chargement des statistiques...",
    },
    noRecentContributions: {
      en: "No recent contributions",
      fr: "Aucune contribution récente",
    },
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-violet-50 border-pink-200">
      <CardHeader>
        <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
          {texts.title[language]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mr-2" />
            <span>{texts.loading[language]}</span>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-pink-200">
                <p className="text-sm text-gray-500">{texts.totalContributions[language]}</p>
                <p className="text-2xl font-bold text-pink-600">{stats.totalContributions}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-pink-200">
                <p className="text-sm text-gray-500">{texts.pendingValidations[language]}</p>
                <p className="text-2xl font-bold text-violet-600">{stats.pendingValidations}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">{texts.recentContributions[language]}</h3>
              {stats.recentContributions.length > 0 ? (
                <ul className="space-y-2">
                  {stats.recentContributions.map((contribution, index) => (
                    <li key={index} className="bg-white p-3 rounded border border-pink-100 text-sm">
                      <p className="font-medium text-gray-800">{contribution.title}</p>
                      {contribution.date && <p className="text-xs text-gray-500">{contribution.date}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">{texts.noRecentContributions[language]}</p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

