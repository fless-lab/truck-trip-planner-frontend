"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// List of cities provided
const CITIES = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "San Francisco, CA",
  "Columbus, OH",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "Miami, FL",
  "Atlanta, GA",
  "Portland, OR",
  "Las Vegas, NV",
  "Minneapolis, MN",
  "Richmond, VA",
  "Fredericksburg, VA",
  "Baltimore, MD",
  "Cherry Hill, NJ",
  "Newark, NJ",
  "Charlotte, NC",
  "Indianapolis, IN",
  "Fort Worth, TX",
  "Tucson, AZ",
  "Mesa, AZ",
  "Sacramento, CA",
  "Kansas City, MO",
  "Raleigh, NC",
  "Omaha, NE",
  "Tampa, FL",
  "Orlando, FL",
  "St. Louis, MO",
  "Pittsburgh, PA",
  "Cincinnati, OH",
  "Cleveland, OH",
  "Nashville, TN",
  "Memphis, TN",
  "Louisville, KY",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Oklahoma City, OK",
  "Tulsa, OK",
  "Bakersfield, CA",
  "Fresno, CA",
  "Anaheim, CA",
  "Santa Ana, CA",
  "Riverside, CA",
  "Stockton, CA",
  "Corpus Christi, TX",
  "Lexington, KY",
  "Buffalo, NY",
  "Rochester, NY",
  "Albany, NY",
  "Syracuse, NY",
  "Greensboro, NC",
  "Winston-Salem, NC",
  "Durham, NC",
  "Birmingham, AL",
  "Montgomery, AL",
  "Mobile, AL",
  "Huntsville, AL",
  "Little Rock, AR",
  "Fayetteville, AR",
  "Boise, ID",
  "Spokane, WA",
  "Tacoma, WA",
  "Salt Lake City, UT",
  "Provo, UT",
  "Des Moines, IA",
  "Cedar Rapids, IA",
  "Wichita, KS",
  "Topeka, KS",
  "Shreveport, LA",
  "Baton Rouge, LA",
  "New Orleans, LA",
  "Lafayette, LA",
  "Jackson, MS",
  "Gulfport, MS",
  "Billings, MT",
  "Missoula, MT",
  "Fargo, ND",
  "Bismarck, ND",
  "Sioux Falls, SD",
  "Rapid City, SD",
  "Charleston, SC",
  "Columbia, SC",
  "Greenville, SC",
  "Knoxville, TN",
  "Chattanooga, TN",
  "El Paso, TX",
  "Lubbock, TX",
  "Amarillo, TX",
  "Brownsville, TX",
  "McAllen, TX",
]

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  excludeCities?: string[]
  name: string
  required?: boolean
}

export function CitySelect({
  value,
  onChange,
  placeholder,
  excludeCities = [], // Ensure this has a default empty array
  name,
  required = false,
}: CitySelectProps) {
  const [open, setOpen] = React.useState(false)

  // Filter out excluded cities, ensuring excludeCities is an array
  const availableCities = CITIES.filter((city) =>
    !Array.isArray(excludeCities) ? true : !excludeCities.includes(city),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search for a city...`} />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {availableCities.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => {
                    onChange(city)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === city ? "opacity-100" : "opacity-0")} />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      <input type="hidden" name={name} value={value} required={required} />
    </Popover>
  )
}

