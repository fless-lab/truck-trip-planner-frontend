import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TruckIcon } from "lucide-react"
import TripsList from "@/components/trips-list"

export default function TripsPage() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button asChild>
          <Link href="/trips/create">
            <TruckIcon className="mr-2 h-4 w-4" /> New Trip
          </Link>
        </Button>
      </div>

      <TripsList />
    </div>
  )
}

