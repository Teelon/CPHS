import { DatabaseInitializer } from "@/components/database-initializer"

export default function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Administration</h1>

      <div className="max-w-2xl mx-auto">
        <DatabaseInitializer />
      </div>
    </div>
  )
}

