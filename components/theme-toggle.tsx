"use client"

import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="glass border-white/20 hover:border-white/30 hover:bg-white/10 w-10 h-10 p-0">
        <Palette className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="glass border-white/20 hover:border-white/30 hover:bg-white/10 w-10 h-10 p-0 relative overflow-hidden group transition-all duration-300 hover:scale-110"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sun Icon */}
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-yellow-500 group-hover:text-yellow-400" />
      
      {/* Moon Icon */}
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-400 group-hover:text-blue-300" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
