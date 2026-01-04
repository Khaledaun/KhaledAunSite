'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Scale,
  CheckSquare,
  FileText,
  Brain,
  Receipt,
  BookOpen,
  Megaphone,
  Settings,
  UsersRound,
  LogOut,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User
}

// Navigation items matching the mockup
const navItems = [
  {
    title: 'דשבורד',
    titleEn: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'תיקים',
    titleEn: 'Files',
    href: '/cases',
    icon: FolderOpen,
  },
  {
    title: 'לקוחות',
    titleEn: 'CRM',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'נט המשפט',
    titleEn: 'Net-Hamishpat',
    href: '/court-system',
    icon: Scale,
  },
  {
    title: 'ניהול משימות',
    titleEn: 'Task Management',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'מפעל מסמכים',
    titleEn: 'Document Factory',
    href: '/documents',
    icon: FileText,
  },
  {
    title: 'Legal Mind',
    titleEn: 'Legal Mind',
    href: '/legal-mind',
    icon: Brain,
  },
  {
    title: 'כספים וחיובים',
    titleEn: 'Finance and Billing',
    href: '/finance',
    icon: Receipt,
  },
  {
    title: 'מאגר ידע',
    titleEn: 'Knowledge Base',
    href: '/knowledge',
    icon: BookOpen,
  },
  {
    title: 'שיווק',
    titleEn: 'Marketing',
    href: '/marketing',
    icon: Megaphone,
  },
]

const bottomNavItems = [
  {
    title: 'הגדרות',
    titleEn: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'ניהול צוות',
    titleEn: 'Team Management',
    href: '/team',
    icon: UsersRound,
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="lawra-sidebar w-64 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">LaWra</h1>
            <p className="text-xs text-muted-foreground">AI Legal Assistant</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'lawra-sidebar-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'lawra-sidebar-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}

        {/* Logout */}
        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="lawra-sidebar-item w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate">התנתק</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
