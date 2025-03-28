"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Activity types and their order (from top to bottom)
const ACTIVITY_TYPES = ["OFF_DUTY", "SLEEPER_BERTH", "DRIVING", "ON_DUTY_NOT_DRIVING"]

// Parse time string (e.g., "06:00:00" to decimal hours: 6.0)
const parseTime = (timeStr: string) => {
  const [hours, minutes, seconds] = timeStr.split(":").map((part) => Number.parseInt(part || "0"))
  return hours + minutes / 60 + seconds / 3600
}

interface DriverActivityChartProps {
  activities: any[]
}

export default function DriverActivityChart({ activities = [] }: DriverActivityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Function to draw the chart
  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height + 60 // Reduced from 80 to 60 for REMARKS

    // Clear canvas with a dark background
    ctx.fillStyle = "#1a1a1a" // Dark background for the chart
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Check if we have activities
    if (activities.length === 0) return

    // Calculate chart dimensions - reduced top margin
    const margin = { top: 30, right: 20, bottom: 20, left: 100 }
    const chartWidth = canvas.width - margin.left - margin.right
    const chartHeight = dimensions.height - margin.top - margin.bottom
    const remarksHeight = 40 // Reduced from 80 to 40

    // Calculate row height and time scale
    const rowHeight = chartHeight / ACTIVITY_TYPES.length
    const timeScale = chartWidth / 24 // 24 hours per day

    // Draw filled areas for DRIVING and ON_DUTY_NOT_DRIVING first (so grid lines appear on top)
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)" // Brighter blue with transparency

    const sortedActivities = [...activities].sort((a, b) => {
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

        // Draw the extension through the entire chart
        // More visible color for dark theme
        ctx.strokeStyle = "#333333" // Darker gray for quarter lines
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + ACTIVITY_TYPES.length * rowHeight) // Stops before REMARKS
        ctx.stroke()
      }
    }

    // Draw horizontal grid lines
    ctx.strokeStyle = "#666666" // Lighter gray for main grid lines
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

    // Draw vertical grid lines (hours)
    for (let hour = 0; hour <= 24; hour++) {
      const x = margin.left + hour * timeScale
      ctx.strokeStyle = "#666666" // Lighter gray for main grid lines
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + ACTIVITY_TYPES.length * rowHeight + remarksHeight)
      ctx.stroke()

      // Draw hour labels
      ctx.fillStyle = "#ffffff" // White text for dark background
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

        // Draw the visible part of quarter-hour lines at the top
        ctx.strokeStyle = "#999999" // Lighter gray for quarter hour indicators
        ctx.lineWidth = 0.8

        ctx.beginPath()
        ctx.moveTo(x, margin.top)

        // The middle line (30 min) is longer
        if (quarter === 2) {
          // Half-hour line - longer (about 1/3 of the height)
          ctx.lineTo(x, margin.top + rowHeight * 0.5)
        } else {
          // Quarter-hour lines (15 min and 45 min) - shorter
          ctx.lineTo(x, margin.top + rowHeight * 0.33)
        }
        ctx.stroke()
      }
    }

    // Draw activity labels
    ctx.textAlign = "right"
    ctx.font = "12px Arial"
    ctx.fillStyle = "#ffffff" // White text for dark background

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

    // Draw activity timeline
    ctx.strokeStyle = "#3b82f6" // Bright blue for the timeline
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

  // Draw chart on initial load
  useEffect(() => {
    // Wait for refs to be available
    setTimeout(() => {
      drawChart()
    }, 100)
  }, [dimensions, activities])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".chart-container")
      if (container) {
        const width = container.clientWidth
        setDimensions({
          width: width,
          height: Math.min(300, width * 0.3), // Reduced height to make it more compact
        })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Driver Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="chart-container w-full">
          <div className="w-full overflow-x-auto">
            <canvas
              ref={canvasRef}
              className="min-w-full rounded-md"
              style={{ height: `${dimensions.height + 60}px` }} // Reduced the extra padding from 80 to 60
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

