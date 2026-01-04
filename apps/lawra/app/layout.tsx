import type { Metadata } from 'next'
import { Heebo, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'
import './globals.css'

// Hebrew font
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

// English font (fallback)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LaWra AI | ניהול משרד עורכי דין',
    template: '%s | LaWra AI',
  },
  description: 'מערכת ניהול משרד עורכי דין מבוססת בינה מלאכותית',
  keywords: ['עורך דין', 'ניהול משרד', 'בינה מלאכותית', 'legal tech', 'law firm management'],
  authors: [{ name: 'LaWra AI' }],
  creator: 'LaWra AI',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    alternateLocale: 'en_US',
    siteName: 'LaWra AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="he" 
      dir="rtl" 
      className={`${heebo.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
