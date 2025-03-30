import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { typography, spacing } from "@/lib/design-system"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Style Guide | Pride History Archive",
  description: "Design system and component library for the Pride History Archive",
}

export default function StyleGuidePage() {
  return (
    <div className={spacing.section}>
      <PageHeader heading="Style Guide" text="Design system and component library for the Pride History Archive" />

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
        </TabsList>

        <TabsContent value="typography" className={spacing.section}>
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Font styles used throughout the application</CardDescription>
            </CardHeader>
            <CardContent className={spacing.section}>
              <div>
                <h3 className="text-lg font-medium mb-4">Headings</h3>
                <div className={spacing.card}>
                  <h1 className={typography.headings.h1}>Heading 1</h1>
                  <h2 className={typography.headings.h2}>Heading 2</h2>
                  <h3 className={typography.headings.h3}>Heading 3</h3>
                  <h4 className={typography.headings.h4}>Heading 4</h4>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Body Text</h3>
                <div className={spacing.card}>
                  <p className={typography.body.default}>Default body text</p>
                  <p className={typography.body.small}>Small body text</p>
                  <p className={typography.body.tiny}>Tiny body text</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className={spacing.section}>
          <Card>
            <CardHeader>
              <CardTitle>Color System</CardTitle>
              <CardDescription>Color palette used throughout the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-primary"></div>
                  <div className="text-sm font-medium">Primary</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-secondary"></div>
                  <div className="text-sm font-medium">Secondary</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-accent"></div>
                  <div className="text-sm font-medium">Accent</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-muted"></div>
                  <div className="text-sm font-medium">Muted</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-destructive"></div>
                  <div className="text-sm font-medium">Destructive</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-card"></div>
                  <div className="text-sm font-medium">Card</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-background"></div>
                  <div className="text-sm font-medium">Background</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 w-full rounded-md bg-border"></div>
                  <div className="text-sm font-medium">Border</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className={spacing.section}>
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>UI components used throughout the application</CardDescription>
            </CardHeader>
            <CardContent className={spacing.section}>
              <div>
                <h3 className="text-lg font-medium mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Form Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="example-input">Input</Label>
                    <Input id="example-input" placeholder="Enter text..." />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing" className={spacing.section}>
          <Card>
            <CardHeader>
              <CardTitle>Spacing System</CardTitle>
              <CardDescription>Consistent spacing used throughout the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Section Spacing</h3>
                  <div className={spacing.section}>
                    <div className="h-16 bg-muted rounded-md flex items-center justify-center">Section Item 1</div>
                    <div className="h-16 bg-muted rounded-md flex items-center justify-center">Section Item 2</div>
                    <div className="h-16 bg-muted rounded-md flex items-center justify-center">Section Item 3</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Card Spacing</h3>
                  <div className={spacing.card}>
                    <div className="h-12 bg-muted rounded-md flex items-center justify-center">Card Item 1</div>
                    <div className="h-12 bg-muted rounded-md flex items-center justify-center">Card Item 2</div>
                    <div className="h-12 bg-muted rounded-md flex items-center justify-center">Card Item 3</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Form Field Spacing</h3>
                  <div className={spacing.formField}>
                    <Label>Form Label</Label>
                    <Input placeholder="Form input" />
                    <p className="text-sm text-muted-foreground">Helper text</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

