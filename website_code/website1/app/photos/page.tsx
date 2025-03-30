import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PhotoGallery } from "@/components/photo-gallery"
import { PhotoDatabaseInfo } from "@/components/photo-database-info"

export default function PhotosPage() {
  return (
    <div className="container mx-auto p-8">
      <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-2">Photo Gallery</h1>
      <p className="text-gray-600 mb-8">
        Browse historical photos from the Canadian Pride Historical Society's photo database
      </p>

      <PhotoDatabaseInfo />
      <PhotoGallery />
    </div>
  )
}

