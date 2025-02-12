import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aideepshit.me'),
  title: 'DeepShit | The Unfiltered Truth Engine',
  description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine. Now with $DEEPSHIT token!',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'DeepShit | The Unfiltered Truth Engine',
    description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine.',
    siteName: 'DeepShit AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DeepShit AI - The Unfiltered Truth Engine',
      },
    ],
    type: 'website',
    url: 'https://aideepshit.me',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepShit | The Unfiltered Truth Engine',
    description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine.',
    creator: '@deepshits_ai',
    site: '@deepshits_ai',
    images: ['/og-image.png'],
  },
}

function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function getInitialTheme() {
              const storedTheme = localStorage.getItem('theme')
              if (storedTheme) {
                return storedTheme
              }
              return 'dark'
            }

            function getInitialSound() {
              const storedSound = localStorage.getItem('soundEnabled')
              return storedSound === null ? true : storedSound === 'true'
            }

            const theme = getInitialTheme()
            document.documentElement.classList.add(theme)
            localStorage.setItem('theme', theme)
            
            if (localStorage.getItem('soundEnabled') === null) {
              localStorage.setItem('soundEnabled', 'true')
            }
          })()
        `,
      }}
    />
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
