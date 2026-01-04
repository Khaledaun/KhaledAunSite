'use client'

import { useState } from 'react'
import { Search, MessageSquare, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User
}

// Team member avatars (from mockup - R and K)
const teamMembers = [
  { id: 'reem', name: 'Reem', initials: 'R', color: 'bg-orange-500' },
  { id: 'khaled', name: 'Khaled', initials: 'K', color: 'bg-blue-500' },
]

export function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Get user initials
  const getUserInitials = () => {
    const name = user.user_metadata?.full_name || user.email || ''
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userName = user.user_metadata?.full_name || 'משתמש'
  const userRole = user.user_metadata?.role || 'עורך דין'

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="חיפוש..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 bg-muted/50"
          />
        </div>
      </div>

      {/* Team Avatars */}
      <div className="flex items-center -space-x-2 space-x-reverse">
        {teamMembers.map((member) => (
          <Avatar
            key={member.id}
            className={`w-8 h-8 border-2 border-background ${member.color}`}
          >
            <AvatarFallback className={`${member.color} text-white text-xs`}>
              {member.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <MessageSquare className="w-5 h-5" />
        <span className="absolute -top-1 -end-1 w-2 h-2 bg-green-500 rounded-full" />
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -end-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
          3
        </span>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 pe-2">
            <div className="text-end hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <span className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>פרופיל</DropdownMenuItem>
          <DropdownMenuItem>הגדרות</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action="/auth/logout" method="POST" className="w-full">
              <button type="submit" className="w-full text-start text-destructive">
                התנתק
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
