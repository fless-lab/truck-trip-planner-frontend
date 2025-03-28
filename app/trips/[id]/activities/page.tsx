"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, MapPin, Clock, TruckIcon, MapIcon } from "lucide-react"
import DriverActivityChart from "@/components/driver-activity-chart"
import ActivityMap from "@/components/activity-map"
import { toast } from "sonner"
import { fetchApi } from "@/lib/api"

interface Activity {
  date: string
  duty_status: string
  start_time: string
  end_time: string
  location: string
  latitude?: number
  longitude?: number
}

interface Trip {
  id: number
  current_location: string
  pickup_location: string
  dropoff_location: string
  start_time: string
  distance: number
  estimated_duration: number
  logs: Activity[]
  summary: any[]
  route_geometry_to_pickup?: string
  route_geometry_to_dropoff?: string
}

// Function to organize activities by day
const organizeActivitiesByDay = (activities: Activity[]) => {
  const activitiesByDay: { [key: string]: Activity[] } = {}

  for (const activity of activities) {
    // Ensure we have a valid date
    if (!activity.date) continue

    // Normalize the date format
    const dateKey = activity.date.split("T")[0] // Handle ISO format if present

    if (!activitiesByDay[dateKey]) {
      activitiesByDay[dateKey] = []
    }
    activitiesByDay[dateKey].push(activity)
  }

  return Object.entries(activitiesByDay).map(([date, activities], index) => ({
    date,
    dayNumber: index + 1,
    activities,
  }))
}

export default function TripActivitiesPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState("0")
  const [viewMode, setViewMode] = useState<"chart" | "map">("chart")

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true)
        toast.loading("Loading trip activities...", { id: "fetch-trip" })

        const data = await fetchApi(`/api/trips/${tripId}/`)
        console.log("Trip data:", data)
        setTrip(data)

        toast.success("Trip activities loaded", {
          id: "fetch-trip",
          description: `Trip #${data.id} with ${data.logs?.length || 0} activities`,
          duration: 3000,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        console.error(err)

        toast.error("Failed to load trip", {
          id: "fetch-trip",
          description: errorMessage,
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [tripId])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activities...</span>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>Error: {error || "Trip not found"}</p>
          <Button variant="outline" className="mt-2" onClick={() => router.push("/trips")}>
            Return to trips list
          </Button>
        </div>
      </div>
    )
  }

  // Organize activities by day using logs instead of summary
  const activitiesByDay = organizeActivitiesByDay(trip.logs || [])

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/trips")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to trips
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trip #{trip.id} Activities</h1>
          <p className="text-muted-foreground">
            {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <TruckIcon className="h-5 w-5 text-primary mr-2" />
            <span>{Math.round(trip.distance)} miles</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <span>{Math.round(trip.estimated_duration)} hours</span>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-medium">{trip.current_location}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">{trip.pickup_location}</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery</p>
                <p className="font-medium">{trip.dropoff_location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Driver Activity Timeline</h2>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("chart")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button variant={viewMode === "map" ? "default" : "outline"} size="sm" onClick={() => setViewMode("map")}>
              <MapIcon className="mr-2 h-4 w-4" />
              Map
            </Button>
          </div>
        </div>

        {viewMode === "chart" ? (
          <>
            <p className="text-muted-foreground mb-4">Select a day to view activity details</p>

            <Tabs defaultValue="0" value={activeDay} onValueChange={setActiveDay}>
              <TabsList className="mb-4 flex flex-wrap">
                {activitiesByDay.map((day, index) => (
                  <TabsTrigger key={index} value={index.toString()} className="mb-1">
                    Day {day.dayNumber} ({new Date(day.date).toLocaleDateString()})
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="w-full">
                {activitiesByDay.map((day, index) => (
                  <TabsContent key={index} value={index.toString()} className="mt-0">
                    <DriverActivityChart activities={day.activities} />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </>
        ) : (
          <div className="w-full">
            <ActivityMap
              activities={trip.logs || []}
              tripData={{
                route_geometry_to_pickup: trip.route_geometry_to_pickup,
                route_geometry_to_dropoff: trip.route_geometry_to_dropoff,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

