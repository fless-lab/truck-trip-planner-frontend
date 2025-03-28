"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { CitySelect } from "@/components/city-select"

// Replace the existing toast implementation with Sonner
import { toast } from "sonner"
import { postApi } from "@/lib/api"

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_hours: "0",
    start_time: new Date().toISOString().slice(0, 16),
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCityChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Replace the handleSubmit function with this updated version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Convert current_cycle_hours to number
      const payload = {
        ...formData,
        current_cycle_hours: Number.parseFloat(formData.current_cycle_hours),
        start_time: new Date(formData.start_time).toISOString(),
      }

      toast.loading("Creating trip...", {
        id: "create-trip",
      })

      const response = await postApi("/api/trips/create/", payload)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error creating trip")
      }

      const data = await response.json()

      toast.success("Trip created successfully", {
        id: "create-trip",
        description: `Trip #${data.id} from ${data.current_location} to ${data.dropoff_location} has been created.`,
        duration: 5000,
      })

      router.push("/trips")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create trip", {
        id: "create-trip",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the CreateTripPage component to ensure arrays are properly initialized
  // Calculate excluded cities for each dropdown, ensuring we always have arrays
  const currentLocationExcludes = [formData.pickup_location, formData.dropoff_location].filter(
    (city) => city !== undefined && city !== "",
  )

  const pickupLocationExcludes = [formData.current_location, formData.dropoff_location].filter(
    (city) => city !== undefined && city !== "",
  )

  const dropoffLocationExcludes = [formData.current_location, formData.pickup_location].filter(
    (city) => city !== undefined && city !== "",
  )

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Create a new trip</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Trip Information</CardTitle>
          <CardDescription>Fill in the details to plan your new trip</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_location">Departure Location</Label>
              <CitySelect
                name="current_location"
                value={formData.current_location}
                onChange={(value) => handleCityChange("current_location", value)}
                placeholder="Select departure city"
                excludeCities={currentLocationExcludes}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_location">Pickup Location</Label>
              <CitySelect
                name="pickup_location"
                value={formData.pickup_location}
                onChange={(value) => handleCityChange("pickup_location", value)}
                placeholder="Select pickup city"
                excludeCities={pickupLocationExcludes}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff_location">Delivery Location</Label>
              <CitySelect
                name="dropoff_location"
                value={formData.dropoff_location}
                onChange={(value) => handleCityChange("dropoff_location", value)}
                placeholder="Select delivery city"
                excludeCities={dropoffLocationExcludes}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_cycle_hours">Current HOS Cycle Hours</Label>
              <Input
                id="current_cycle_hours"
                name="current_cycle_hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 0.0"
                value={formData.current_cycle_hours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Departure Date and Time</Label>
              <Input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

