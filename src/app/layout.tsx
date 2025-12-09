import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://samswim.vercel.app'),
  title: "Sam's Swim Academy | Professional Swimming Lessons Dubai",
  description: 'Learn to swim with Coach Sam Maysem in Dubai. Professional swimming lessons for kids and adults. Book your lesson today.',
  keywords: ['swimming lessons', 'Dubai', 'learn to swim', 'swim coach', 'kids swimming', 'adult swimming lessons'],
  authors: [{ name: 'Sam Maysem' }],
  creator: 'Sam Maysem',
  publisher: "Sam's Swim Academy",
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: 'https://samswim.vercel.app',
    siteName: "Sam's Swim Academy",
    title: "Sam's Swim Academy | Professional Swimming Lessons Dubai",
    description: 'Learn to swim with Coach Sam Maysem in Dubai. Professional swimming lessons for kids and adults.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Sam's Swim Academy",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sam's Swim Academy",
    description: 'Professional swimming lessons in Dubai',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E5AA8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
