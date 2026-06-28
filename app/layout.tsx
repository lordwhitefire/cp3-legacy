import './globals.css'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Alchemists Basketball Club & Sports News',
  description: 'Sports Club, League and News HTML Template replication - built by LordWhiteFire.',
  other: {
    'llms': '/llms.txt',
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="llms" href="/llms.txt" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/vendor/bootstrap/css/bootstrap.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/fonts/font-awesome/css/all.min.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/fonts/simple-line-icons/css/simple-line-icons.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/vendor/magnific-popup/dist/magnific-popup.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/vendor/slick/slick.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/css/style-basketball-dark.css" rel="stylesheet" />
        <link href="https://alchemists.dan-fisher.dev/basketball-dark/assets/css/custom.css" rel="stylesheet" />
      </head>
      <body className="template-basketball bg-[#1e2024]" style={{ display: 'block' }}>
        {children}
      </body>
    </html>
  )
}

