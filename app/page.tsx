import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TruckIcon, MapIcon, ClipboardCheckIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Truck Trip Planner</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Plan your trips, track your activities, and comply with HOS regulations.
        </p>
      </div>

      <Card className="w-full max-w-3xl mx-auto mb-10">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl">Welcome, Driver!</CardTitle>
          <CardDescription className="text-primary-foreground/90">
            Your trip and activity management tool
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p>
              Welcome to Truck Trip Planner, your comprehensive solution for truck trip management. Our application
              helps you:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <TruckIcon className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-medium">Plan your trips</h3>
                <p className="text-sm text-muted-foreground">Create and manage your routes easily</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <MapIcon className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-medium">Track your activities</h3>
                <p className="text-sm text-muted-foreground">Visualize your driving time and breaks</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <ClipboardCheckIcon className="h-10 w-10 text-primary mb-2" />
                <h3 className="font-medium">Comply with HOS rules</h3>
                <p className="text-sm text-muted-foreground">Ensure you follow hours of service regulations</p>
              </div>
            </div>

            <p className="mt-6">To get started, create a new trip or view your existing trips.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/trips/create">Create a Trip</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trips">View My Trips</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

