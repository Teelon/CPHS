"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { useLanguage } from "@/contexts/language-context"

export function LGBTQRightsProgressChart() {
  const { language } = useLanguage()

  // Mock data representing LGBTQ+ rights milestones by decade
  const data = [
    {
      decade: "1960s",
      legal: 1,
      social: 0,
      milestones:
        language === "en" ? "Decriminalization of homosexuality (1969)" : "Décriminalisation de l'homosexualité (1969)",
    },
    {
      decade: "1970s",
      legal: 2,
      social: 3,
      milestones:
        language === "en"
          ? "First Pride marches, gay rights organizations formed"
          : "Premières marches de la Fierté, formation d'organisations pour les droits des homosexuels",
    },
    {
      decade: "1980s",
      legal: 4,
      social: 5,
      milestones:
        language === "en"
          ? "Sexual orientation protections begin in some provinces"
          : "Début des protections d'orientation sexuelle dans certaines provinces",
    },
    {
      decade: "1990s",
      legal: 8,
      social: 7,
      milestones:
        language === "en"
          ? "Military ban lifted, benefits for same-sex couples"
          : "Levée de l'interdiction militaire, prestations pour les couples de même sexe",
    },
    {
      decade: "2000s",
      legal: 15,
      social: 12,
      milestones:
        language === "en"
          ? "Same-sex marriage legalized nationally (2005)"
          : "Légalisation du mariage entre personnes de même sexe à l'échelle nationale (2005)",
    },
    {
      decade: "2010s",
      legal: 18,
      social: 16,
      milestones:
        language === "en"
          ? "Trans rights protections, conversion therapy bans begin"
          : "Protections des droits des trans, début des interdictions de thérapie de conversion",
    },
    {
      decade: "2020s",
      legal: 20,
      social: 18,
      milestones:
        language === "en"
          ? "National conversion therapy ban, expanded protections"
          : "Interdiction nationale de la thérapie de conversion, protections élargies",
    },
  ]

  const texts = {
    legal: {
      en: "Legal Protections",
      fr: "Protections juridiques",
    },
    social: {
      en: "Social Recognition",
      fr: "Reconnaissance sociale",
    },
    tooltip: {
      decade: {
        en: "Decade",
        fr: "Décennie",
      },
      milestones: {
        en: "Key Milestones",
        fr: "Jalons clés",
      },
    },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find((item) => item.decade === label)

      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-bold">
            {texts.tooltip.decade[language]}: {label}
          </p>
          <p className="text-purple-600">
            {texts.legal[language]}: {payload[0].value}
          </p>
          <p className="text-green-600">
            {texts.social[language]}: {payload[1].value}
          </p>
          {dataPoint && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-medium text-sm">{texts.tooltip.milestones[language]}:</p>
              <p className="text-sm text-gray-600">{dataPoint.milestones}</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="decade" />
        <YAxis
          label={{
            value: language === "en" ? "Number of Protections/Recognitions" : "Nombre de protections/reconnaissances",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="legal" name={texts.legal[language]} fill="#8884d8" />
        <Bar dataKey="social" name={texts.social[language]} fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

