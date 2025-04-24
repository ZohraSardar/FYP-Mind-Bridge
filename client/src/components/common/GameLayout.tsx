"use client"

import { type PropsWithChildren, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, X, Timer } from "lucide-react"
import { Link } from "wouter"
import type { GameMode } from "@shared/schema"
import { Toggle } from "@/components/ui/toggle"

interface GameLayoutProps extends PropsWithChildren {
  title: string
  mode: GameMode
  onModeChange: (mode: GameMode) => void
}

export default function GameLayout({ title, mode, onModeChange, children }: GameLayoutProps) {
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (mode === "quiz") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    } else {
      setTimer(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [mode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                <Home className="h-5 w-5 text-blue-600" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-blue-900">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {mode === "quiz" && (
              <div className="flex items-center gap-2 text-blue-600">
                <Timer className="h-4 w-4" />
                <span>{formatTime(timer)}</span>
              </div>
            )}

            <Toggle
              pressed={mode === "practice"} // ✅ Changed from "learning" to "practice"
              onPressedChange={() => onModeChange(mode === "practice" ? "quiz" : "practice")} // ✅ Fixed toggle logic
              className="bg-blue-50 data-[state=on]:bg-blue-200 hover:bg-blue-100"
            >
              {mode === "practice" ? "Practice Mode" : "Quiz Mode"} {/* ✅ Updated text */}
            </Toggle>

            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-red-50">
                <X className="h-5 w-5 text-red-600" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
