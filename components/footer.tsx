import Link from "next/link"
import { LinkedinIcon as LinkedInIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row items-center justify-center py-6 px-4 sm:px-6 lg:px-8 text-center sm:text-left text-sm text-muted-foreground">
        <div className="flex items-center">
          <span>Made by Abdou-Raouf ATARMLA (</span>
          <Link
            href="https://www.linkedin.com/in/abdou-raouf-atarmla/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mx-1 text-primary hover:underline"
          >
            <LinkedInIcon className="h-4 w-4 mr-1" />
            LinkedIn
          </Link>
          <span>) for Spotter.ai hiring assessment | Fullstack Developer</span>
        </div>
      </div>
    </footer>
  )
}

