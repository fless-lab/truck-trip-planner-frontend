"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Activity types and their order (from top to bottom)
const ACTIVITY_TYPES = ["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY_NOT_DRIVING"]

// Parse time string (e.g., "06:00:00" to decimal hours: 6.0)
const parseTime = (timeStr: string) => {
  const [hours, minutes, seconds] = timeStr.split(":").map((part) => Number.parseInt(part || "0"))
  return hours + minutes / 60 + seconds / 3600
}

// Format date for tab display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Driver log data from the provided JSON
const driverLogs = [
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "06:00:00",
    end_time: "07:00:00",
    location: "Conduite de New York, NY à Chicago, IL (60.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "07:00:00",
    end_time: "08:00:00",
    location: "Conduite de New York, NY à Chicago, IL (120.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "08:00:00",
    end_time: "09:00:00",
    location: "Conduite de New York, NY à Chicago, IL (180.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "09:00:00",
    end_time: "09:20:00",
    location: "Conduite de New York, NY à Chicago, IL (200.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "09:20:00",
    end_time: "10:20:00",
    location: "Ramassage à Chicago, IL (200.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "10:20:00",
    end_time: "11:20:00",
    location: "Conduite (260.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "11:20:00",
    end_time: "12:20:00",
    location: "Conduite (320.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "12:20:00",
    end_time: "13:20:00",
    location: "Conduite (380.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "13:20:00",
    end_time: "14:20:00",
    location: "Conduite (440.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "14:20:00",
    end_time: "15:01:00",
    location: "Conduite (481.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "OFF_DUTY",
    start_time: "15:01:00",
    end_time: "15:31:00",
    location: "Pause de 30 minutes (481.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "15:31:00",
    end_time: "16:31:00",
    location: "Conduite (541.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "16:31:00",
    end_time: "17:31:00",
    location: "Conduite (601.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "DRIVING",
    start_time: "17:31:00",
    end_time: "18:30:00",
    location: "Conduite (660.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "18:30:00",
    end_time: "20:00:00",
    location: "Fin de fenêtre de 14h (660.0 miles)",
  },
  {
    date: "2025-03-22",
    duty_status: "SLEEPER_BERTH",
    start_time: "20:00:00",
    end_time: "23:59:59",
    location: "Repos de 10h après 11h de conduite (660.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "SLEEPER_BERTH",
    start_time: "00:00:00",
    end_time: "06:00:00",
    location: "Repos de 10h après 11h de conduite (660.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "06:00:00",
    end_time: "07:00:00",
    location: "Conduite (720.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "07:00:00",
    end_time: "08:00:00",
    location: "Conduite (780.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "08:00:00",
    end_time: "09:00:00",
    location: "Conduite (840.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "09:00:00",
    end_time: "10:00:00",
    location: "Conduite (900.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "10:00:00",
    end_time: "11:00:00",
    location: "Conduite (960.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "11:00:00",
    end_time: "11:39:00",
    location: "Conduite (999.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "11:39:00",
    end_time: "11:40:00",
    location: "Conduite jusqu'au ravitaillement (999.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "11:40:00",
    end_time: "11:55:00",
    location: "Arrêt de ravitaillement (1000.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "11:55:00",
    end_time: "12:55:00",
    location: "Conduite (1060.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "12:55:00",
    end_time: "13:55:00",
    location: "Conduite (1120.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "13:55:00",
    end_time: "14:16:00",
    location: "Conduite (1141.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "OFF_DUTY",
    start_time: "14:16:00",
    end_time: "14:46:00",
    location: "Pause de 30 minutes (1141.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "14:46:00",
    end_time: "15:46:00",
    location: "Conduite (1201.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "15:46:00",
    end_time: "16:46:00",
    location: "Conduite (1261.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "DRIVING",
    start_time: "16:46:00",
    end_time: "17:45:00",
    location: "Conduite (1320.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "17:45:00",
    end_time: "20:00:00",
    location: "Fin de fenêtre de 14h (1320.0 miles)",
  },
  {
    date: "2025-03-23",
    duty_status: "SLEEPER_BERTH",
    start_time: "20:00:00",
    end_time: "23:59:59",
    location: "Repos de 10h après 11h de conduite (1320.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "SLEEPER_BERTH",
    start_time: "00:00:00",
    end_time: "06:00:00",
    location: "Repos de 10h après 11h de conduite (1320.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "06:00:00",
    end_time: "07:00:00",
    location: "Conduite (1380.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "07:00:00",
    end_time: "08:00:00",
    location: "Conduite (1440.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "08:00:00",
    end_time: "09:00:00",
    location: "Conduite (1500.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "09:00:00",
    end_time: "10:00:00",
    location: "Conduite (1560.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "10:00:00",
    end_time: "11:00:00",
    location: "Conduite (1620.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "11:00:00",
    end_time: "12:00:00",
    location: "Conduite (1680.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "12:00:00",
    end_time: "13:00:00",
    location: "Conduite (1740.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "13:00:00",
    end_time: "14:00:00",
    location: "Conduite (1800.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "14:00:00",
    end_time: "14:01:00",
    location: "Conduite (1801.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "OFF_DUTY",
    start_time: "14:01:00",
    end_time: "14:31:00",
    location: "Pause de 30 minutes (1801.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "14:31:00",
    end_time: "15:31:00",
    location: "Conduite (1861.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "15:31:00",
    end_time: "16:31:00",
    location: "Conduite (1921.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "DRIVING",
    start_time: "16:31:00",
    end_time: "17:30:00",
    location: "Conduite (1980.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "17:30:00",
    end_time: "20:00:00",
    location: "Fin de fenêtre de 14h (1980.0 miles)",
  },
  {
    date: "2025-03-24",
    duty_status: "SLEEPER_BERTH",
    start_time: "20:00:00",
    end_time: "23:59:59",
    location: "Repos de 10h après 11h de conduite (1980.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "SLEEPER_BERTH",
    start_time: "00:00:00",
    end_time: "06:00:00",
    location: "Repos de 10h après 11h de conduite (1980.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "06:00:00",
    end_time: "06:19:00",
    location: "Conduite (1999.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "06:19:00",
    end_time: "06:20:00",
    location: "Conduite jusqu'au ravitaillement (1999.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "06:20:00",
    end_time: "06:35:00",
    location: "Arrêt de ravitaillement (2000.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "06:35:00",
    end_time: "07:35:00",
    location: "Conduite (2060.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "07:35:00",
    end_time: "08:35:00",
    location: "Conduite (2120.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "08:35:00",
    end_time: "09:35:00",
    location: "Conduite (2180.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "09:35:00",
    end_time: "10:35:00",
    location: "Conduite (2240.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "10:35:00",
    end_time: "11:35:00",
    location: "Conduite (2300.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "11:35:00",
    end_time: "12:35:00",
    location: "Conduite (2360.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "12:35:00",
    end_time: "13:35:00",
    location: "Conduite (2420.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "13:35:00",
    end_time: "14:16:00",
    location: "Conduite (2461.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "OFF_DUTY",
    start_time: "14:16:00",
    end_time: "14:46:00",
    location: "Pause de 30 minutes (2461.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "14:46:00",
    end_time: "15:46:00",
    location: "Conduite (2521.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "15:46:00",
    end_time: "16:46:00",
    location: "Conduite (2581.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "DRIVING",
    start_time: "16:46:00",
    end_time: "17:45:00",
    location: "Conduite (2640.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "17:45:00",
    end_time: "20:00:00",
    location: "Fin de fenêtre de 14h (2640.0 miles)",
  },
  {
    date: "2025-03-25",
    duty_status: "SLEEPER_BERTH",
    start_time: "20:00:00",
    end_time: "23:59:59",
    location: "Repos de 10h après 11h de conduite (2640.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "SLEEPER_BERTH",
    start_time: "00:00:00",
    end_time: "06:00:00",
    location: "Repos de 10h après 11h de conduite (2640.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "06:00:00",
    end_time: "07:00:00",
    location: "Conduite (2700.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "07:00:00",
    end_time: "08:00:00",
    location: "Conduite (2760.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "08:00:00",
    end_time: "09:00:00",
    location: "Conduite (2820.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "09:00:00",
    end_time: "10:00:00",
    location: "Conduite (2880.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "10:00:00",
    end_time: "11:00:00",
    location: "Conduite (2940.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "11:00:00",
    end_time: "11:59:00",
    location: "Conduite (2999.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "DRIVING",
    start_time: "11:59:00",
    end_time: "12:00:00",
    location: "Conduite jusqu'au ravitaillement (2999.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "12:00:00",
    end_time: "12:15:00",
    location: "Arrêt de ravitaillement (3000.0 miles)",
  },
  {
    date: "2025-03-26",
    duty_status: "ON_DUTY_NOT_DRIVING",
    start_time: "12:15:00",
    end_time: "13:15:00",
    location: "Dépôt à Los Angeles, CA (3000.0 miles)",
  },
]

// Organize activities by day
const organizeActivitiesByDay = () => {
  const activitiesByDay = {}

  for (const log of driverLogs) {
    if (!activitiesByDay[log.date]) {
      activitiesByDay[log.date] = []
    }
    activitiesByDay[log.date].push(log)
  }

  return Object.entries(activitiesByDay).map(([date, activities]) => ({
    date,
    activities,
  }))
}

export default function DriverActivityChart() {
  const [activeDay, setActiveDay] = useState("0")
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({})
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Organize activities by day
  const activitiesByDay = organizeActivitiesByDay()

  // Fonction pour dessiner le graphique
  const drawChart = (canvasId: string) => {
    const canvas = canvasRefs.current[canvasId]
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height + 80 // Ajout d'espace pour REMARKS

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get current day's activities
    const dayIndex = Number.parseInt(canvasId)
    const currentDayData = activitiesByDay[dayIndex]
    if (!currentDayData) return

    // Calculate chart dimensions
    const margin = { top: 40, right: 20, bottom: 40, left: 100 }
    const chartWidth = canvas.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom
    const remarksHeight = 80

    // Calculate row height and time scale
    const rowHeight = chartHeight / ACTIVITY_TYPES.length
    const timeScale = chartWidth / 24 // 24 hours per day

    // Draw filled areas for DRIVING and ON_DUTY_NOT_DRIVING first (so grid lines appear on top)
    ctx.fillStyle = "rgba(0, 102, 204, 0.2)"

    const sortedActivities = [...currentDayData.activities].sort((a, b) => {
      return parseTime(a.start_time) - parseTime(b.start_time)
    })

    for (const activity of sortedActivities) {
      if (activity.duty_status === "DRIVING" || activity.duty_status === "ON_DUTY_NOT_DRIVING") {
        const activityIndex = ACTIVITY_TYPES.indexOf(activity.duty_status)
        const startTime = parseTime(activity.start_time)
        const endTime = parseTime(activity.end_time)

        const startX = margin.left + startTime * timeScale
        const endX = margin.left + endTime * timeScale
        const y = margin.top + activityIndex * rowHeight

        ctx.fillRect(startX, y, endX - startX, rowHeight)
      }
    }

    // Draw quarter-hour indicators FIRST (so they appear behind the main grid lines)
    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 1; quarter <= 3; quarter++) {
        const x = margin.left + (hour + quarter / 4) * timeScale

        // Dessiner d'abord le prolongement à travers tout le graphique
        // Couleur plus visible et épaisseur augmentée
        ctx.strokeStyle = "#dddddd" // Gris clair mais visible
        ctx.lineWidth = 0.8 // Épaisseur augmentée mais toujours plus fine que les lignes principales
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + ACTIVITY_TYPES.length * rowHeight) // S'arrête avant REMARKS
        ctx.stroke()
      }
    }

    // Draw horizontal grid lines
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1

    for (let i = 0; i <= ACTIVITY_TYPES.length; i++) {
      const y = margin.top + i * rowHeight
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(margin.left + chartWidth, y)
      ctx.stroke()
    }

    // Draw REMARKS section
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top + ACTIVITY_TYPES.length * rowHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + ACTIVITY_TYPES.length * rowHeight)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top + ACTIVITY_TYPES.length * rowHeight + remarksHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + ACTIVITY_TYPES.length * rowHeight + remarksHeight)
    ctx.stroke()

    // Draw vertical grid lines (hours) - plus épaisses
    for (let hour = 0; hour <= 24; hour++) {
      const x = margin.left + hour * timeScale
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + ACTIVITY_TYPES.length * rowHeight + remarksHeight)
      ctx.stroke()

      // Draw hour labels
      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"

      let hourLabel
      if (hour === 0) {
        hourLabel = "Midnight"
      } else if (hour === 12) {
        hourLabel = "Noon"
      } else if (hour === 24) {
        hourLabel = ""
      } else {
        hourLabel = hour.toString()
      }

      ctx.fillText(hourLabel, x, margin.top - 10)
    }

    // Draw quarter-hour indicators visible parts at the top
    for (let hour = 0; hour < 24; hour++) {
      for (let quarter = 1; quarter <= 3; quarter++) {
        const x = margin.left + (hour + quarter / 4) * timeScale

        // Dessiner la partie visible des lignes de quart d'heure au sommet
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 0.8 // Légèrement plus épais pour la partie visible

        ctx.beginPath()
        ctx.moveTo(x, margin.top)

        // La ligne du milieu (30 min) est plus longue
        if (quarter === 2) {
          // Ligne de demi-heure - plus longue (environ 1/3 de la hauteur)
          ctx.lineTo(x, margin.top + rowHeight * 0.5)
        } else {
          // Lignes de quart d'heure (15 min et 45 min) - plus courtes
          ctx.lineTo(x, margin.top + rowHeight * 0.33)
        }
        ctx.stroke()
      }
    }

    // Draw activity labels
    ctx.textAlign = "right"
    ctx.font = "12px Arial"
    ctx.fillStyle = "#000"

    for (let i = 0; i < ACTIVITY_TYPES.length; i++) {
      const y = margin.top + i * rowHeight + rowHeight / 2

      let label = ACTIVITY_TYPES[i]
      if (label === "ON_DUTY_NOT_DRIVING") {
        label = "On Duty\n(Not Driving)"
      } else if (label === "OFF_DUTY") {
        label = "Off Duty"
      } else if (label === "SLEEPER_BERTH") {
        label = "Sleeper\nBerth"
      } else if (label === "DRIVING") {
        label = "Driving"
      }

      const lines = label.split("\n")
      if (lines.length > 1) {
        ctx.fillText(lines[0], margin.left - 10, y - 6)
        ctx.fillText(lines[1], margin.left - 10, y + 6)
      } else {
        ctx.fillText(label, margin.left - 10, y)
      }
    }

    // Draw REMARKS label
    ctx.fillText("REMARKS", margin.left - 10, margin.top + ACTIVITY_TYPES.length * rowHeight + remarksHeight / 2)

    // Supprimer ou commenter les lignes qui dessinent la date en haut du graphique
    // Remplacer ces lignes:
    // Draw date label
    // ctx.textAlign = "left"
    // ctx.font = "bold 12px Arial"
    // const date = new Date(currentDayData.date)
    // const dateStr = date.toLocaleDateString("fr-FR", {
    //   weekday: "long",
    //   day: "numeric",
    //   month: "long",
    //   year: "numeric",
    // })
    // ctx.fillText(dateStr, 10, margin.top - 15)

    // Draw activity timeline
    ctx.strokeStyle = "#0066cc"
    ctx.lineWidth = 2

    let lastX = null
    let lastY = null
    let firstPoint = true

    // Process each activity for the current day
    for (const activity of sortedActivities) {
      // Calculate activity coordinates
      const activityIndex = ACTIVITY_TYPES.indexOf(activity.duty_status)
      const startTime = parseTime(activity.start_time)
      const endTime = parseTime(activity.end_time)

      const startX = margin.left + startTime * timeScale
      const startY = margin.top + activityIndex * rowHeight + rowHeight / 2

      const endX = margin.left + endTime * timeScale
      const endY = startY

      if (firstPoint) {
        firstPoint = false
      } else if (lastX !== null && lastY !== null) {
        // Connect to previous point
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(startX, startY)
        ctx.stroke()
      }

      // Draw horizontal line for this activity
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      lastX = endX
      lastY = endY
    }
  }

  // Dessiner tous les graphiques au chargement initial
  useEffect(() => {
    // Attendre que les refs soient disponibles
    setTimeout(() => {
      activitiesByDay.forEach((_, index) => {
        drawChart(index.toString())
      })
    }, 100)
  }, [dimensions])

  // Redessiner lors du changement d'onglet
  useEffect(() => {
    drawChart(activeDay)
  }, [activeDay])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".chart-container")
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(400, container.clientWidth * 0.4),
        })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chronologie d'Activité du Conducteur</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="0" value={activeDay} onValueChange={setActiveDay}>
          <TabsList className="mb-4 flex flex-wrap">
            {activitiesByDay.map((day, index) => (
              <TabsTrigger key={index} value={index.toString()} className="mb-1">
                Jour {index + 1} ({formatDate(day.date)})
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="chart-container w-full">
            {activitiesByDay.map((day, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-0">
                <div className="w-full overflow-x-auto">
                  <canvas
                    ref={(el) => (canvasRefs.current[index.toString()] = el)}
                    className="min-w-full"
                    style={{ height: `${dimensions.height + 80}px` }}
                  />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

