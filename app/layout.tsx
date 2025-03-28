import type React from "react"
import { Inter } from "next/font/google"
// import "./globals.css.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Truck Trip Planner",
  description: "Trip planning and tracking application for truck drivers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 bg-background px-4 sm:px-6 lg:px-8">{children}</main>
            <Footer />
            <SonnerProvider />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'