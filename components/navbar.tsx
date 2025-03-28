"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TruckIcon } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8 mx-auto">
        <Link href="/" className="flex items-center mr-4">
          <TruckIcon className="h-6 w-6 mr-2" />
          <span className="font-bold">Truck Trip Planner</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Home
          </Link>
          <Link
            href="/trips"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith("/trips") && pathname !== "/trips/create" ? "text-primary" : "text-muted-foreground",
            )}
          >
            My Trips
          </Link>
          <Link
            href="/trips/create"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/trips/create" ? "text-primary" : "text-muted-foreground",
            )}
          >
            New Trip
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Help
          </Button>
        </div>
      </div>
    </header>
  )
}

