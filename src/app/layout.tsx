import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: 'QuickVerdict', template: '%s | QuickVerdict' },
  description: 'Get a quick sense of any question.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: base, siteName: 'QuickVerdict', title: 'QuickVerdict', description: 'Get a quick sense of any question.' },
  twitter: { card: 'summary_large_image', title: 'QuickVerdict', description: 'Get a quick sense of any question.' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen">{children}</body>
      </html>
    </ClerkProvider>
  )
}
