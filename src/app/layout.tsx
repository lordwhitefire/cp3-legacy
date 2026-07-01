import type { Metadata } from "next";
import "./globals.css";
import "./image-specs.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteUrl = "https://cp3-legacy.vercel.app";
const siteName = "CP3 Legacy";
const siteDescription =
  "Celebrating 19 seasons of greatness — from Wake Forest to the Hall of Fame. Welcome to the ultimate Chris Paul fan destination.";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Chris Paul",
    "CP3",
    "NBA",
    "basketball",
    "Point God",
    "Wake Forest",
  ],
  authors: [{ name: "Ifedike Victor Makuo", url: "https://github.com/lordwhitefire" }],
  creator: "Ifedike Victor Makuo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/alchemists/assets/images/samples/header_player.png",
        width: 1200,
        height: 630,
        alt: "CP3 Legacy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/alchemists/assets/images/samples/header_player.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/alchemists/assets/images/basketball/favicons/favicon.ico",
    apple: "/alchemists/assets/images/basketball/favicons/favicon-120.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Montserrat self-hosted via @font-face in globals.css — zero external requests */}

        {/* Alchemists vendor + theme CSS — loaded in original order */}
        <link
          rel="stylesheet"
          href="/alchemists/assets/vendor/bootstrap/css/bootstrap.css"
        />
        <link
          rel="stylesheet"
          href="/alchemists/assets/fonts/font-awesome/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="/alchemists/assets/fonts/simple-line-icons/css/simple-line-icons.css"
        />
        <link
          rel="stylesheet"
          href="/alchemists/assets/vendor/magnific-popup/dist/magnific-popup.css"
        />
        <link
          rel="stylesheet"
          href="/alchemists/assets/vendor/slick/slick.css"
        />
        <link
          rel="stylesheet"
          href="/alchemists/assets/css/style-basketball-dark.css"
        />
        <link rel="stylesheet" href="/alchemists/assets/css/custom.css" />
      </head>
      <body
        data-template="template-basketball"
        style={{ display: "block" }}
      >
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
