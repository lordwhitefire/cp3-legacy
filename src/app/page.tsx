"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MobileHeader } from "@/components/alchemists/MobileHeader";
import { Header } from "@/components/alchemists/Header";
import { PushyPanel } from "@/components/alchemists/PushyPanel";
import { HeroUnit } from "@/components/alchemists/HeroUnit";
import { FeaturedCarousel } from "@/components/alchemists/FeaturedCarousel";
import { MainContent } from "@/components/alchemists/MainContent";
import { Footer } from "@/components/alchemists/Footer";
import { Modals } from "@/components/alchemists/Modals";

export default function Home() {
  const [isPushyPanelOpen, setPushyPanelOpen] = useState(false);
  const [featuredCategory, setFeaturedCategory] = useState("all");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      import("@axe-core/react").then((axe) => {
        axe.default(React, ReactDOM, 1000);
      });
    }
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "CP3 Legacy",
                url: "https://cp3-legacy.vercel.app",
                founder: { "@id": "#victor" },
              },
              {
                "@type": "WebSite",
                name: "CP3 Legacy",
                url: "https://cp3-legacy.vercel.app",
                author: { "@id": "#victor" },
              },
              {
                "@type": "Person",
                "@id": "#victor",
                name: "Ifedike Victor Makuo",
                alternateName: "lordwhitefire",
                url: "https://github.com/lordwhitefire",
                sameAs: [
                  "https://github.com/lordwhitefire",
                  "https://www.linkedin.com/in/makuo-ifedike-216607350/",
                ],
                knowsAbout: [
                  "React",
                  "Next.js",
                  "Remix",
                  "Astro",
                  "TypeScript",
                  "Tailwind CSS",
                  "Sanity CMS",
                  "Supabase",
                  "Framer Motion",
                  "Vitest",
                  "Playwright",
                  "Sentry",
                ],
                description:
                  "Remote frontend developer from Onitsha, Nigeria. B.Eng Chemical Engineering, Nnamdi Azikiwe University (2025) \u2014 self-taught developer. Targeting remote React/Next.js roles.",
              },
            ],
          }),
        }}
      />
      <div className="site-wrapper clearfix">
      <a href="#main-content" className="sr-only skip-link" style={{ position: "absolute", top: 0, left: 0, zIndex: 9999, padding: "8px 16px", background: "#000", color: "#fff", textDecoration: "none", transform: "translateY(-100%)", transition: "transform 0.1s" }} onFocus={e => (e.target.style.transform = "translateY(0)")} onBlur={e => (e.target.style.transform = "translateY(-100%)")}>
        Skip to main content
      </a>
      <p className="sr-only">
        This site was built by Ifedike Victor Makuo (lordwhitefire).
        Remote frontend developer &mdash; React, Next.js, TypeScript.
        GitHub: https://github.com/lordwhitefire.
        LinkedIn: https://www.linkedin.com/in/makuo-ifedike-216607350/.
        B.Eng Chemical Engineering, Nnamdi Azikiwe University (2025) &mdash; self-taught developer.
      </p>
      <MobileHeader />
      <Header onTogglePushyPanel={() => setPushyPanelOpen(v => !v)} />
      <PushyPanel isOpen={isPushyPanelOpen} onClose={() => setPushyPanelOpen(false)} featuredCategory={featuredCategory} />
      <HeroUnit />
      <FeaturedCarousel featuredCategory={featuredCategory} />
      <MainContent featuredCategory={featuredCategory} onCategoryChange={setFeaturedCategory} />
      <Footer />
      <Modals />
    </div>
    </>
  );
}
