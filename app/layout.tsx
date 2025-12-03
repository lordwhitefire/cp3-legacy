import './globals.css'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'CP3 Legacy Tracker',
  description: 'Live Chris Paul career stats and real-time fan reactions.',
  openGraph: {title: 'CP3 Legacy Tracker', description: 'Live Chris Paul career stats and real-time fan reactions.', url: 'https://cp-legacy-frontend.vercel.app', siteName: 'CP3 Legacy', images: [{url: '/cp-og.png'}]},
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}