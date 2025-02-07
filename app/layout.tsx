import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'DeepShit | The Unfiltered Truth Engine',
  description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine. Now with $DEEPSHIT token!',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'DeepShit | The Unfiltered Truth Engine',
    description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DeepShit AI',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DeepShit | The Unfiltered Truth Engine',
    description: 'Because Google\'s got a stick up its ass. Get brutally honest answers with our AI-powered search engine.',
    creator: '@DeepShitAI',
    site: '@DeepShitAI',
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

            const theme = getInitialTheme()
            document.documentElement.classList.add(theme)
            localStorage.setItem('theme', theme)
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
        </ThemeProvider>
      </body>
    </html>
  )
}
