"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { MetadataValidationForm } from "@/components/contribute/metadata-validation-form"
import { ContributionStats } from "@/components/contribute/contribution-stats"
import { Suspense } from "react"

// Import the RecordSubmissionForm with no SSR
const RecordSubmissionForm = dynamic(
  () => import("@/components/contribute/record-submission-form").then((mod) => mod.RecordSubmissionForm),
  { ssr: false },
)

export default function ContributePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
        Contribute & Validate
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="submit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-pink-100 to-violet-100">
              <TabsTrigger
                value="submit"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white"
              >
                Submit Record
              </TabsTrigger>
              <TabsTrigger
                value="validate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white"
              >
                Validate Metadata
              </TabsTrigger>
            </TabsList>
            <TabsContent value="submit" className="border border-pink-200 rounded-lg p-6">
              <Suspense fallback={<div className="p-12 text-center">Loading submission form...</div>}>
                <RecordSubmissionForm />
              </Suspense>
            </TabsContent>
            <TabsContent value="validate" className="border border-pink-200 rounded-lg p-6">
              <MetadataValidationForm />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <ContributionStats />
        </div>
      </div>
    </div>
  )
}

