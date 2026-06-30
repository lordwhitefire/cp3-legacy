"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import data from "@/data/data.json";
import { fetchAllSanityData } from "./queries";
import type { AllSanityData } from "./queries";

const SanityDataContext = createContext<AllSanityData>({
  hero: null,
  siteSettings: null,
  footer: null,
  player: null,
  seasons: [],
  articles: [],
  pushyPanel: null,
  modals: null,
});

export function SanityDataProvider({ children }: { children: ReactNode }) {
  const [sanityData, setSanityData] = useState<AllSanityData>({
    hero: null,
    siteSettings: null,
    footer: null,
    player: null,
    seasons: [],
    articles: [],
    pushyPanel: null,
    modals: null,
  });

  useEffect(() => {
    fetchAllSanityData().then(setSanityData);
  }, []);

  return (
    <SanityDataContext.Provider value={sanityData}>
      {children}
    </SanityDataContext.Provider>
  );
}

export function useSanityData() {
  return useContext(SanityDataContext);
}
