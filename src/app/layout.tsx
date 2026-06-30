import type { Metadata } from "next";
import "./globals.css";
import "./image-specs.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Alchemists Basketball Club & Sports News HTML Template - Home",
  description: "Sports Club, League and News HTML Template",
  keywords: ["sports club news HTML template", "basketball", "Alchemists"],
  authors: [{ name: "Dan Fisher" }],
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
        {/* Google Fonts intentionally NOT loaded — when the original MHTML
            was screenshotted via file:// URL, cross-origin font requests
            were blocked, so the original rendered with the sans-serif
            fallback. To match, we deliberately don't load web fonts. */}

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
      </body>
    </html>
  );
}
