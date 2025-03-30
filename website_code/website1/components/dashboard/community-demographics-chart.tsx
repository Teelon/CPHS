"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "@/components/ui/chart"
import { useLanguage } from "@/contexts/language-context"

export function CommunityDemographicsChart() {
  const { language } = useLanguage()

  // Mock data representing representation in archival records by identity
  const data =
    language === "en"
      ? [
          { name: "Gay Men", value: 42, color: "#8884d8" },
          { name: "Lesbian Women", value: 28, color: "#82ca9d" },
          { name: "Bisexual People", value: 12, color: "#ffc658" },
          { name: "Transgender People", value: 10, color: "#ff8042" },
          { name: "Two-Spirit", value: 4, color: "#0088fe" },
          { name: "Non-Binary/Gender Non-Conforming", value: 3, color: "#00C49F" },
          { name: "Other Identities", value: 1, color: "#FFBB28" },
        ]
      : [
          { name: "Hommes gais", value: 42, color: "#8884d8" },
          { name: "Femmes lesbiennes", value: 28, color: "#82ca9d" },
          { name: "Personnes bisexuelles", value: 12, color: "#ffc658" },
          { name: "Personnes transgenres", value: 10, color: "#ff8042" },
          { name: "Personnes bispirituelles", value: 4, color: "#0088fe" },
          { name: "Non-binaires/non-conformes", value: 3, color: "#00C49F" },
          { name: "Autres identités", value: 1, color: "#FFBB28" },
        ]

  const texts = {
    tooltip: {
      representation: {
        en: "Representation",
        fr: "Représentation",
      },
      percent: {
        en: "of records",
        fr: "des enregistrements",
      },
    },
    title: {
      en: "Representation in Archives by Identity",
      fr: "Représentation dans les archives par identité",
    },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-gray-700">
            {texts.tooltip.representation[language]}: {payload[0].value}% {texts.tooltip.percent[language]}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

