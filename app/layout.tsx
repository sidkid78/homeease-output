import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HOMEase | AI',
  description: 'AI-powered aging-in-place lead generation platform',
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * The root layout for the HOMEase AI application.
 * This component sets up the basic HTML structure, applies global styles, and defines metadata.
 * @param {RootLayoutProps} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
