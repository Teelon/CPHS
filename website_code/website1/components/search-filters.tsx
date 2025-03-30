"use client"

import { useState } from "react"
import { CalendarIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function SearchFilters() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const [yearRange, setYearRange] = useState([1950, 2023])

  const eventTypes = [
    { id: "parade", label: "Pride Parade" },
    { id: "protest", label: "Protest/Demonstration" },
    { id: "conference", label: "Conference" },
    { id: "publication", label: "Publication" },
    { id: "legislation", label: "Legislation" },
    { id: "organization", label: "Organization Founding" },
  ]

  const locations = [
    { id: "toronto", label: "Toronto" },
    { id: "montreal", label: "Montreal" },
    { id: "vancouver", label: "Vancouver" },
    { id: "ottawa", label: "Ottawa" },
    { id: "halifax", label: "Halifax" },
    { id: "winnipeg", label: "Winnipeg" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <Button variant="outline" size="sm" className="mb-4">
          Reset All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["date", "type", "location"]}>
        <AccordionItem value="date">
          <AccordionTrigger>Date Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{yearRange[0]}</span>
                  <span className="text-sm">{yearRange[1]}</span>
                </div>
                <Slider defaultValue={yearRange} min={1950} max={2023} step={1} onValueChange={setYearRange} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1950</span>
                  <span>2023</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Event Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {eventTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox id={`type-${type.id}`} />
                  <Label htmlFor={`type-${type.id}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center space-x-2">
                  <Checkbox id={`location-${location.id}`} />
                  <Label htmlFor={`location-${location.id}`}>{location.label}</Label>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="language">
          <AccordionTrigger>Language</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="lang-en" defaultChecked />
                <Label htmlFor="lang-en">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="lang-fr" defaultChecked />
                <Label htmlFor="lang-fr">French</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

