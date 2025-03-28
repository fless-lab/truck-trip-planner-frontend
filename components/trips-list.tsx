"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, TruckIcon, CalendarIcon, ArrowRightIcon, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface Trip {
  id: number
  current_location: string
  pickup_location: string
  dropoff_location: string
  start_time: string
  distance: number
  estimated_duration: number
}

export default function TripsList() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true)
        toast.loading("Loading trips...", { id: "fetch-trips" })

        const response = await fetch("http://localhost:8000/api/trips/")

        if (!response.ok) {
          throw new Error("Error retrieving trips")
        }

        const data = await response.json()
        setTrips(data)

        toast.success("Trips loaded successfully", {
          id: "fetch-trips",
          description: `${data.length} trips found`,
          duration: 3000,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        console.error(err)

        toast.error("Failed to load trips", {
          id: "fetch-trips",
          description: errorMessage,
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading trips...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        <p>Error: {error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
          <TruckIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No trips found</h3>
          <p className="text-muted-foreground mb-4">You haven't created any trips yet.</p>
          <Button asChild>
            <Link href="/trips/create">Create my first trip</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <Card key={trip.id} className="overflow-hidden">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Trip #{trip.id}</span>
              <span className="text-sm font-normal text-muted-foreground">{Math.round(trip.distance)} miles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-medium">{trip.current_location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{trip.pickup_location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="font-medium">{trip.dropoff_location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Departure date</p>
                  <p className="font-medium">{formatDate(trip.start_time)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 flex justify-end">
            <Button asChild variant="default">
              <Link href={`/trips/${trip.id}/activities`}>
                View activities <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

