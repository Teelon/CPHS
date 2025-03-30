import { PredictiveSearchBar } from "@/components/predictive-search-bar"
import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { ResearchQuestions } from "@/components/research-questions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConsentBanner } from "@/components/consent-banner"

export default function SearchPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Search Archives</h1>

      <ConsentBanner />

      <div className="mb-6">
        <PredictiveSearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilters />

          {/* Research Questions moved here from research portal */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Research Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResearchQuestions />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <SearchResults />
        </div>
      </div>
    </div>
  )
}

