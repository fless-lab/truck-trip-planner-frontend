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
  const mapInstanceRef = useRef<any>(null) // Référence pour stocker l'instance de la carte
  const [loading, setLoading] = useState(true)

  // Fonction pour charger Leaflet dynamiquement
  const loadLeaflet = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).L) {
        console.log("Leaflet already loaded")
        resolve()
        return
      }

      // Ajouter le CSS de Leaflet
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)

      // Charger le script Leaflet
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
      script.crossOrigin = "anonymous"
      script.onload = () => {
        console.log("Leaflet script loaded")
        resolve()
      }
      script.onerror = () => {
        console.error("Failed to load Leaflet script")
        reject(new Error("Failed to load Leaflet script"))
      }
      document.body.appendChild(script)
    })
  }


  // Fonction pour initialiser ou mettre à jour la carte
  const initOrUpdateMap = () => {
    if (!mapRef.current) {
      console.error("Map container not found")
      setLoading(false)
      return
    }

    console.log("Map container found:", mapRef.current)

    // Vérifier les dimensions du conteneur
    const rect = mapRef.current.getBoundingClientRect()
    console.log("Map container dimensions:", rect)

    const L = (window as any).L
    if (!L) {
      console.error("Leaflet not loaded")
      setLoading(false)
      return
    }

    // Nettoyer l'instance de carte existante si elle existe
    if (mapInstanceRef.current) {
      console.log("Removing existing map instance")
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Initialiser la carte
    try {
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795], // Centre des États-Unis
        zoom: 4,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)
      

      // Trier les activités par date et heure
      const sortedActivities = [...activities].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`)
        const dateB = new Date(`${b.date}T${b.start_time}`)
        return dateA.getTime() - dateB.getTime()
      })

      // Overlapping fix
      const areConsecutive = (activity1: any, activity2: any) => {
        const endTime1 = new Date(`${activity1.date}T${activity1.end_time}`);
        const startTime2 = new Date(`${activity2.date}T${activity2.start_time}`);
        const timeDiffMinutes = ((startTime2 as any) - (endTime1 as any)) / (1000 * 60);
        const sameStatus = activity1.duty_status === activity2.duty_status;
        const latDiff = Math.abs(activity1.latitude - activity2.latitude);
        const lonDiff = Math.abs(activity1.longitude - activity2.longitude);
        const sameCoords = latDiff < 0.001 && lonDiff < 0.001; // Tolérance de 0.001 degrés
        return sameStatus && sameCoords && timeDiffMinutes <= 1;
      };
  
      // Regrouper les activités consécutives
      const groupedActivities = [];
      let currentGroup = null as unknown as any;


      sortedActivities.forEach((activity, index) => {
        if (!activity.latitude || !activity.longitude) {
          console.warn(`Activity ${index} has no valid coordinates:`, activity);
          return;
        }
      
        if (!currentGroup) {
          // Démarrer un nouveau groupe
          currentGroup = {
            duty_status: activity.duty_status,
            start_date: activity.date,
            start_time: activity.start_time,
            end_date: activity.date,
            end_time: activity.end_time,
            location: activity.location,
            latitude: activity.latitude,
            longitude: activity.longitude,
            activities: [activity],
          };
        } else {
          // Vérifier si l'activité peut être ajoutée au groupe actuel
          if (areConsecutive(currentGroup.activities[currentGroup.activities.length - 1], activity)) {
            currentGroup.end_date = activity.date;
            currentGroup.end_time = activity.end_time;
            currentGroup.activities.push(activity);
          } else {
            // Terminer le groupe actuel et en démarrer un nouveau
            groupedActivities.push(currentGroup);
            currentGroup = {
              duty_status: activity.duty_status,
              start_date: activity.date,
              start_time: activity.start_time,
              end_date: activity.date,
              end_time: activity.end_time,
              location: activity.location,
              latitude: activity.latitude,
              longitude: activity.longitude,
              activities: [activity],
            };
          }
        }
      });
      
      // Ajouter le dernier groupe
      if (currentGroup) {
        groupedActivities.push(currentGroup);
      }
      
      console.log("Grouped activities count:", groupedActivities.length);

      // Extraire les coordonnées pour chaque activité
      const points: Array<[number, number]> = []
      const markers: any[] = []

      // Fonction pour obtenir l'icône en fonction du statut
      const getStatusIcon = (status: string, isStart: boolean, isPickup: boolean, isDropoff: boolean) => {
        const iconOptions = {
          size: [25, 41],
          anchor: [12, 41],
          popupAnchor: [1, -34],
        }

        let iconUrl = ""
        if (isStart) {
          iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" // Rouge pour le départ
        } else if (isPickup) {
          iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" // Bleu pour le ramassage
        } else if (isDropoff) {
          iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png" // Noir pour la livraison
        } else {
          switch (status) {
            case "DRIVING":
              iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" // Gris par défaut pour la conduite
              break
            case "ON_DUTY_NOT_DRIVING":
              iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" // Orange pour les arrêts (ex. ravitaillement)
              break
            case "OFF_DUTY":
              iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" // Vert pour les pauses/repos
              break
            case "SLEEPER_BERTH":
              iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" // Violet pour les repos longs
              break
            default:
              iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
          }
        }

        return L.icon({
          iconUrl,
          iconSize: iconOptions.size,
          iconAnchor: iconOptions.anchor,
          popupAnchor: iconOptions.popupAnchor,
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        })
      }

      console.log("Activities count:", sortedActivities.length)

      // Variable pour suivre si le premier marqueur DRIVING a été affiché
      let firstDrivingMarkerDisplayed = false;
      
      groupedActivities.forEach((group, index) => {
        const coords = [group.latitude, group.longitude];
        points.push(coords);
      
        // Déterminer si c'est le départ, le ramassage ou la livraison
        const isStart = index === 0;
        const isDropoff = index === groupedActivities.length - 1;
        const isPickup = group.location.includes("Ramassage") || group.location.includes("Pickup");
      
        // Pour les activités de type DRIVING, n'afficher que le premier marqueur
        if (group.duty_status === "DRIVING") {
          if (!firstDrivingMarkerDisplayed) {
            // C'est le premier marqueur DRIVING, on l'affiche
            firstDrivingMarkerDisplayed = true;
            console.log(
              `Displaying first DRIVING marker at [${coords[0]}, ${coords[1]}] for activity ${index}: ${group.duty_status} (${group.location})`
            );
          } else {
            // Ce n'est pas le premier marqueur DRIVING, on le saute
            console.log(
              `Skipping marker at [${coords[0]}, ${coords[1]}] for DRIVING activity ${index}: ${group.duty_status} (${group.location})`
            );
            return;
          }
        }
      
        // Formater les dates et heures pour la popup
        const startDateFormatted = formatDate(group.start_date);
        const endDateFormatted = formatDate(group.end_date);
        const dateDisplay =
          startDateFormatted === endDateFormatted
            ? startDateFormatted
            : `${startDateFormatted} - ${endDateFormatted}`;
      
        // Ajouter un marqueur pour le groupe
        const marker = L.marker(coords, {
          icon: getStatusIcon(group.duty_status, isStart, isPickup, isDropoff),
        }).bindPopup(`
          <div style="min-width: 200px;">
            <strong>${group.duty_status.replace(/_/g, " ")}</strong><br>
            <strong>Date:</strong> ${dateDisplay}<br>
            <strong>Time:</strong> ${formatTime(group.start_time)} - ${formatTime(group.end_time)}<br>
            <strong>Location:</strong> ${group.location}
          </div>
        `);
        markers.push(marker);
        marker.addTo(map);
        console.log(
          `Marker added at [${coords[0]}, ${coords[1]}] for grouped activity ${index}: ${group.duty_status} (${group.location})`
        );
      });

      console.log("Points count:", points.length)
      console.log("Route geometry available:", !!tripData?.route_geometry_to_pickup)

      // Ajouter les polylines si disponibles
      if (tripData?.route_geometry_to_pickup) {
        try {
          const pickupCoords = polyline.decode(tripData.route_geometry_to_pickup)
          console.log("Pickup coords count:", pickupCoords.length)
          if (pickupCoords.length > 0) {
            const pickupPolyline = L.polyline(pickupCoords, { color: "blue", weight: 3, opacity: 0.7 })
            pickupPolyline.addTo(map)
            console.log("Pickup polyline added")
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
            console.log("Dropoff polyline added")
          }
        } catch (error) {
          console.error("Error decoding dropoff polyline:", error)
        }
      }

      // Ajuster la vue de la carte
      if (tripData?.route_geometry_to_pickup || tripData?.route_geometry_to_dropoff) {
        try {
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
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] })
            console.log("Map fitted to polyline bounds")
          } else {
            console.warn("Invalid bounds for polylines")
          }
        } catch (error) {
          console.error("Error fitting bounds to polylines:", error)
        }
      } else if (points.length > 1) {
        const polyline = L.polyline(points, { color: "blue", weight: 3, opacity: 0.7 })
        polyline.addTo(map)
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
        console.log("Map fitted to points bounds")
      } else if (points.length === 1) {
        map.setView(points[0], 10)
        console.log("Map centered on single point:", points[0])
      } else {
        console.warn("No points or polylines to fit bounds")
      }

      // Ajouter une légende
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
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" width="15" height="24" style="margin-right: 5px;">
            <span>Start</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" width="15" height="24" style="margin-right: 5px;">
            <span>Pickup</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png" width="15" height="24" style="margin-right: 5px;">
            <span>Dropoff</span>
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
      console.log("Legend added")

      // Forcer un redimensionnement pour s'assurer que la carte s'affiche correctement
      setTimeout(() => {
        map.invalidateSize()
        console.log("Map resized")
      }, 100)

      console.log("Map initialized successfully")
      setLoading(false)
    } catch (error) {
      console.error("Error initializing map:", error)
      setLoading(false)
      toast.error("Failed to initialize map", {
        description: error.message || "An unknown error occurred",
      })
    }
  }

  // Charger Leaflet et initialiser la carte
  useEffect(() => {
    setLoading(true)
    loadLeaflet()
      .then(() => {
        initOrUpdateMap()
      })
      .catch((error) => {
        console.error("Error loading Leaflet:", error)
        setLoading(false)
        toast.error("Failed to load map", {
          description: error.message || "An unknown error occurred",
        })
      })

    // Nettoyage lors du démontage du composant
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map instance")
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // Dépendance vide pour ne s'exécuter qu'une fois au montage

  // Mettre à jour la carte lorsque les activités ou les données du trajet changent
  useEffect(() => {
    if (!mapInstanceRef.current) {
      console.log("Map instance not ready, initializing")
      initOrUpdateMap()
    } else {
      console.log("Map instance exists, updating")
      initOrUpdateMap()
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
          <div
            ref={mapRef}
            className="w-full h-[400px] rounded-md z-0"
            style={{ height: "400px", width: "100%" }} // Assurer une hauteur explicite
          />
        )}
      </CardContent>
    </Card>
  )
}