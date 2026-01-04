'use client'

import Link from 'next/link'
import { ChevronLeft, Folder, FileText, Eye, Phone, Mail } from 'lucide-react'
import { Scale } from 'lucide-react'

// Sample data matching mockup
const updates = [
  {
    id: '1',
    type: 'verdict',
    icon: Scale,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Verdict - CC : 12345-10-25',
    subtitle: 'Rinnawi Vs Aun & others, 04.01.2026',
    subtitleColor: 'text-primary',
  },
  {
    id: '2',
    type: 'client',
    icon: Phone,
    iconBg: 'bg-green-100 text-green-600',
    title: 'Dr. Sami Abu Al-Haija',
    subtitle: 'Dispute update request, set a meeting',
    subtitleColor: 'text-orange-500',
  },
  {
    id: '3',
    type: 'order',
    icon: Scale,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Order - CC : 98765-04-24',
    subtitle: 'Ahmed Vs Yousef, 02.01.2026',
    subtitleColor: 'text-primary',
  },
  {
    id: '4',
    type: 'proposal',
    icon: FileText,
    iconBg: 'bg-purple-100 text-purple-600',
    title: 'Service Fee Proposal Review',
    subtitle: 'The Big Company LTD, Proposal from 01.12.25',
    subtitleColor: 'text-muted-foreground',
  },
]

export function GeneralUpdates() {
  return (
    <div className="lawra-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">General Updates:</h2>
        <Link
          href="/updates"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rtl-flip" />
        </Link>
      </div>

      {/* Updates List */}
      <div className="space-y-2">
        {updates.map((update) => {
          const Icon = update.icon
          return (
            <div key={update.id} className="update-item group">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${update.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{update.title}</p>
                <p className={`text-sm truncate ${update.subtitleColor}`}>
                  {update.subtitle}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="action-icon" title="פתח תיקייה">
                  <Folder className="w-4 h-4" />
                </button>
                <button className="action-icon" title="פתח מסמך">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="action-icon" title="צפה">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
