'use client'

import { Mail, ChevronLeft, ChevronRight, Check, Archive } from 'lucide-react'

// Sample data matching mockup
const emails = [
  {
    id: '1',
    sender: 'Hisham Shaban, Adv.',
    date: '03.01.2026',
    subject: 'Rinnawi Vs Aun - Request',
    isUrgent: false,
    isUnread: true,
  },
  {
    id: '2',
    sender: 'Reem Rinawi - NAS',
    date: '01.01.2026',
    subject: 'Happy new year!',
    isUrgent: true,
    isUnread: true,
  },
  {
    id: '3',
    sender: 'Abed Nashef, Adv.',
    date: '26.12.2025',
    subject: 'Invoice',
    isUrgent: false,
    isUnread: false,
  },
  {
    id: '4',
    sender: 'Big Company LTD.',
    date: '22.12.2025',
    subject: 'Contract Renewal Pending',
    isUrgent: false,
    isUnread: true,
  },
]

export function ImportantEmails() {
  return (
    <div className="lawra-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">New Important E-Mails</h2>
          <Mail className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Emails List */}
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            className="update-item group"
          >
            {/* Avatar/Indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              {email.isUnread && (
                <span className="absolute -top-1 -end-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${email.isUnread ? '' : 'text-muted-foreground'}`}>
                {email.sender}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {email.date} - {email.isUrgent && <span className="text-destructive font-medium">Urgent </span>}
                {email.subject}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="action-icon" title="סמן כנקרא">
                <Check className="w-4 h-4" />
              </button>
              <button className="action-icon" title="ארכיון">
                <Archive className="w-4 h-4" />
              </button>
              <button className="action-icon" title="הבא">
                <ChevronLeft className="w-4 h-4 rtl-flip" />
              </button>
              <button className="action-icon" title="קודם">
                <ChevronRight className="w-4 h-4 rtl-flip" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
