import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'
import { clerkAppearance } from '@/lib/clerk-appearance'
import { clerkLocalization } from '@/lib/clerk-localization'

export const metadata: Metadata = {
  title: 'ConstructQA Agent — Construction Test Automation',
  description:
    'Test automation for construction project management workflows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={clerkLocalization}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  )
}
