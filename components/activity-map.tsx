"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import polyline from "@mapbox/polyline"

// Define activity interface
interface Activity {
  date: string
  duty_status: string
  start_time: string
  end_time: string
  location: string
  latitude?: number
  longitude?: number
}

interface ActivityMapProps {
  activities: Activity[]
  tripData?: any
}

// Format time for display
const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map((part) => part.padStart(2, "0"))
  return `${hours}:${minutes}`
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function ActivityMap({ activities, tripData }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Add Leaflet CSS to head
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    // Function to initialize map
    const initMap = () => {
      if (!mapRef.current) return

      try {
        // Get Leaflet from window
        const L = (window as any).L
        if (!L) {
          throw new Error("Leaflet not loaded")
        }

        console.log("Initializing map with Leaflet:", L.version)

        // Create map
        const map = L.map(mapRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          zoomControl: true,
        })

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Sort activities by time
        const sortedActivities = [...activities].sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.start_time}`)
          const dateB = new Date(`${b.date}T${b.start_time}`)
          return dateA.getTime() - dateB.getTime()
        })

        // Extract coordinates for each activity
        const points: Array<[number, number]> = []
        const markers: any[] = []

        // Get icon based on duty status
        const getStatusIcon = (status: string) => {
          // Define different icons for different statuses
          const iconOptions = {
            size: [25, 41],
            anchor: [12, 41],
            popupAnchor: [1, -34],
          }

          let iconUrl = ""

          switch (status) {
            case "DRIVING":
              iconUrl = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png"
              break
            case "ON_DUTY_NOT_DRIVING":
              iconUrl =
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
              break
            case "OFF_DUTY":
              iconUrl =
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
              break
            case "SLEEPER_BERTH":
              iconUrl =
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"
              break
            default:
              iconUrl = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png"
          }

          return L.icon({
            iconUrl,
            iconSize: iconOptions.size,
            iconAnchor: iconOptions.anchor,
            popupAnchor: iconOptions.popupAnchor,
            shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
          })
        }

        console.log("Activities count:", activities.length)

        // Add markers for activities with coordinates
        sortedActivities.forEach((activity) => {
          if (activity.latitude && activity.longitude) {
            const coords: [number, number] = [activity.latitude, activity.longitude]
            points.push(coords)

            // Add markers for all non-driving activities or start/end points
            if (
              activity.duty_status !== "DRIVING" ||
              activity === sortedActivities[0] ||
              activity === sortedActivities[sortedActivities.length - 1]
            ) {
              // Create marker with popup
              const marker = L.marker(coords, { icon: getStatusIcon(activity.duty_status) }).bindPopup(`
                <div style="min-width: 200px;">
                  <strong>${activity.duty_status.replace(/_/g, " ")}</strong><br>
                  <strong>Date:</strong> ${formatDate(activity.date)}<br>
                  <strong>Time:</strong> ${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}<br>
                  <strong>Location:</strong> ${activity.location}
                </div>
              `)

              markers.push(marker)
              marker.addTo(map)
            }
          }
        })

        console.log("Points count:", points.length)
        console.log("Route geometry available:", !!tripData?.route_geometry_to_pickup)

        // Add route polylines if available
        if (tripData?.route_geometry_to_pickup) {
          try {
            const pickupCoords = polyline.decode(tripData.route_geometry_to_pickup)
            console.log("Pickup coords count:", pickupCoords.length)

            if (pickupCoords.length > 0) {
              const pickupPolyline = L.polyline(pickupCoords, { color: "blue", weight: 3, opacity: 0.7 })
              pickupPolyline.addTo(map)
            }
          } catch (error) {
            console.error("Error decoding pickup polyline:", error)
          }
        }

        if (tripData?.route_geometry_to_dropoff) {
          try {
            const dropoffCoords = polyline.decode(tripData.route_geometry_to_dropoff)
            console.log("Dropoff coords count:", dropoffCoords.length)

            if (dropoffCoords.length > 0) {
              const dropoffPolyline = L.polyline(dropoffCoords, { color: "green", weight: 3, opacity: 0.7 })
              dropoffPolyline.addTo(map)
            }
          } catch (error) {
            console.error("Error decoding dropoff polyline:", error)
          }
        }

        // If we have polylines, fit to their bounds
        if (tripData?.route_geometry_to_pickup || tripData?.route_geometry_to_dropoff) {
          try {
            // Create bounds from all polyline points
            const bounds = L.latLngBounds([])

            if (tripData?.route_geometry_to_pickup) {
              polyline.decode(tripData.route_geometry_to_pickup).forEach((coord) => {
                bounds.extend(coord)
              })
            }

            if (tripData?.route_geometry_to_dropoff) {
              polyline.decode(tripData.route_geometry_to_dropoff).forEach((coord) => {
                bounds.extend(coord)
              })
            }

            // Fit map to bounds
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50] })
            }
          } catch (error) {
            console.error("Error fitting bounds to polylines:", error)
          }
        }
        // Otherwise fit to markers
        else if (points.length > 1) {
          const polyline = L.polyline(points, { color: "blue", weight: 3, opacity: 0.7 })
          polyline.addTo(map)
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
        } else if (points.length === 1) {
          map.setView(points[0], 10)
        }

        // Add a legend
        const legend = L.control({ position: "bottomright" })

        legend.onAdd = () => {
          const div = L.DomUtil.create("div", "info legend")
          div.style.backgroundColor = "hsl(var(--background))"
          div.style.padding = "10px"
          div.style.borderRadius = "5px"
          div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)"
          div.style.color = "hsl(var(--foreground))"
          div.style.border = "1px solid hsl(var(--border))"

          div.innerHTML = `
            <div style="margin-bottom: 5px;"><strong>Activity Types</strong></div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <img src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png" width="15" height="24" style="margin-right: 5px;">
              <span>Driving</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" width="15" height="24" style="margin-right: 5px;">
              <span>On Duty (Not Driving)</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" width="15" height="24" style="margin-right: 5px;">
              <span>Off Duty</span>
            </div>
            <div style="display: flex; align-items: center;">
              <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" width="15" height="24" style="margin-right: 5px;">
              <span>Sleeper Berth</span>
            </div>
          `

          return div
        }

        legend.addTo(map)

        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          map.invalidateSize()
          console.log("Map resized")
        }, 100)

        setLoading(false)
        console.log("Map initialized successfully")
      } catch (error) {
        console.error("Error initializing map:", error)
        setLoading(false)
        toast.error("Error initializing map", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })
      }
    }

    // Load Leaflet script
    if (!(window as any).L) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => {
        console.log("Leaflet script loaded")
        initMap()
      }
      script.onerror = () => {
        console.error("Failed to load Leaflet script")
        setLoading(false)
        toast.error("Failed to load map library", {
          description: "Please check your internet connection and try again.",
        })
      }
      document.body.appendChild(script)
    } else {
      console.log("Leaflet already loaded")
      initMap()
    }

    // Cleanup
    return () => {
      // Remove the script and link if needed
    }
  }, [activities, tripData])

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Route Map</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[400px] rounded-md" />
        ) : (
          <div ref={mapRef} className="w-full h-[400px] rounded-md z-0" />
        )}
      </CardContent>
    </Card>
  )
}

