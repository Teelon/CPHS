import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About the Canadian Pride History Archive</h1>

        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="lead">
            The Canadian Pride History Archive is a digital repository dedicated to preserving and showcasing the rich
            history of Pride events and LGBTQ2S+ activism across Canada.
          </p>

          <div className="my-8 aspect-video relative rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=800&text=Pride+History+Timeline"
              alt="Pride History Timeline"
              fill
              className="object-cover"
            />
          </div>

          <h2>Our Mission</h2>
          <p>
            Our mission is to document, preserve, and make accessible the historical records of Pride events throughout
            Canada's history. By creating this digital archive, we aim to:
          </p>

          <ul>
            <li>Preserve the legacy of LGBTQ2S+ activism and celebration in Canada</li>
            <li>Educate the public about the evolution of Pride events over time</li>
            <li>Highlight the contributions of organizations and individuals to the movement</li>
            <li>Create a comprehensive resource for researchers, educators, and community members</li>
          </ul>

          <h2>Historical Context</h2>
          <p>
            Pride events in Canada have a complex and evolving history, beginning as protests against discrimination and
            evolving into celebrations of identity, community, and progress. The first recorded Pride events in Canada
            date back to the early 1970s, following the decriminalization of homosexuality in 1969.
          </p>

          <p>
            Over the decades, Pride has grown from small marches and demonstrations to large-scale festivals attracting
            hundreds of thousands of participants. These events have played a crucial role in advancing LGBTQ2S+ rights
            and visibility across the country.
          </p>

          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=300&text=Historical+Photo+1"
                alt="Historical Pride Photo 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=300&text=Historical+Photo+2"
                alt="Historical Pride Photo 2"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <h2>About the Canadian Pride History Society</h2>
          <p>
            The Canadian Pride History Society is a non-profit organization dedicated to researching, documenting, and
            preserving the history of LGBTQ2S+ communities and Pride events across Canada. Founded in 2010, the Society
            works with archives, libraries, community organizations, and individuals to collect and preserve historical
            materials.
          </p>

          <h2>About This Archive</h2>
          <p>
            This digital archive was created to make the Society's collection accessible to the public. The archive
            includes information about Pride events, organizations, locations, and topics related to LGBTQ2S+ history in
            Canada. Users can browse events chronologically, by location, or by topic, and can search for specific
            information.
          </p>

          <p>
            The archive is continuously updated as new information becomes available. If you have information,
            photographs, or documents related to Pride history in Canada that you would like to contribute to the
            archive, please contact us.
          </p>

          <div className="bg-muted p-6 rounded-lg my-8">
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <p className="mb-4">
              If you have questions, feedback, or would like to contribute to the archive, please reach out to us at:
            </p>
            <p className="font-medium">
              Email: info@canadianpridehistory.org
              <br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

