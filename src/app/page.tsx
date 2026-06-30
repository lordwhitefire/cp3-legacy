"use client";

import { useState } from "react";
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

  return (
    <div className="site-wrapper clearfix">
      <MobileHeader />
      <Header onTogglePushyPanel={() => setPushyPanelOpen(v => !v)} />
      <PushyPanel isOpen={isPushyPanelOpen} onClose={() => setPushyPanelOpen(false)} featuredCategory={featuredCategory} />
      <HeroUnit />
      <FeaturedCarousel featuredCategory={featuredCategory} />
      <MainContent featuredCategory={featuredCategory} onCategoryChange={setFeaturedCategory} />
      <Footer />
      <Modals />
    </div>
  );
}
