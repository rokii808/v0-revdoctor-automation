"use client"

import { Button } from "@/components/ui/button"
import { Car, LogOut, Settings, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DashboardHeaderProps } from "@/lib/types"

export default function DashboardHeader({ user, dealer }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Revvdoctor</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className="text-foreground font-medium">
            Dashboard
          </a>
          <a href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Leaderboard
          </a>
          <a href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            Settings
          </a>
          <a href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
            Agents
          </a>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{dealer?.company_name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
