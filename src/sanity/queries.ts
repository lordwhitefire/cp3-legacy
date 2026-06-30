import { client } from "./client";

export interface SanityHero {
  subtitle: string;
  title: string;
  titleHighlight: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface SanitySiteSettings {
  name: string;
  tagline: string;
  description: string;
  url: string;
  searchPlaceholder: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
}

export interface SanityContactItem {
  _key: string;
  icon: string;
  heading: string;
  linkText: string;
  linkHref: string;
}

export interface SanitySocialLink {
  _key: string;
  platform: string;
  url: string;
}

export interface SanityNavLink {
  _key: string;
  label: string;
  url: string;
}

export interface SanityFooter {
  contactTitle: string;
  contactDescription: string;
  contactItems: SanityContactItem[];
  socialLinks: SanitySocialLink[];
  galleryTitle: string;
  galleryButtonText: string;
  galleryButtonUrl: string;
  navLinks: SanityNavLink[];
}

export interface SanityPlayerStat {
  _key: string;
  label: string;
  value: string;
}

export interface SanityPlayer {
  firstName: string;
  lastName: string;
  number: string;
  stats: SanityPlayerStat[];
}

export interface SanitySeason {
  label: string;
  team: string;
  ppg: string;
  apg: string;
  rpg: string;
  order: number;
}

export interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  date: string;
  authorName: string;
  views: number;
  likes: number;
  comments: number;
  source: string;
  redditUrl: string;
  featured: boolean;
  image?: any;
}

const heroQuery = `*[_type == "hero"][0]{
  subtitle,
  title,
  titleHighlight,
  description,
  buttonText,
  buttonUrl
}`;

const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  name,
  tagline,
  description,
  url,
  searchPlaceholder,
  newsletterTitle,
  newsletterSubtitle,
  newsletterDescription,
  newsletterPlaceholder,
  newsletterButton
}`;

const footerQuery = `*[_type == "footer"][0]{
  contactTitle,
  contactDescription,
  contactItems[]{
    _key,
    icon,
    heading,
    linkText,
    linkHref
  },
  socialLinks[]{
    _key,
    platform,
    url
  },
  galleryTitle,
  galleryButtonText,
  galleryButtonUrl,
  navLinks[]{
    _key,
    label,
    url
  }
}`;

const playerQuery = `*[_type == "player"][0]{
  firstName,
  lastName,
  number,
  stats[]{
    _key,
    label,
    value
  }
}`;

const seasonsQuery = `*[_type == "season"] | order(order asc){
  label,
  team,
  ppg,
  apg,
  rpg,
  order
}`;

const articlesQuery = `*[_type == "article"]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  date,
  authorName,
  views,
  likes,
  comments,
  source,
  redditUrl,
  featured,
  image
}`;

export async function fetchHero(): Promise<SanityHero | null> {
  try {
    return await client.fetch(heroQuery);
  } catch {
    return null;
  }
}

export async function fetchSiteSettings(): Promise<SanitySiteSettings | null> {
  try {
    return await client.fetch(siteSettingsQuery);
  } catch {
    return null;
  }
}

export async function fetchFooter(): Promise<SanityFooter | null> {
  try {
    return await client.fetch(footerQuery);
  } catch {
    return null;
  }
}

export async function fetchPlayer(): Promise<SanityPlayer | null> {
  try {
    return await client.fetch(playerQuery);
  } catch {
    return null;
  }
}

export async function fetchSeasons(): Promise<SanitySeason[]> {
  try {
    return await client.fetch(seasonsQuery);
  } catch {
    return [];
  }
}

export async function fetchArticles(): Promise<SanityArticle[]> {
  try {
    return await client.fetch(articlesQuery);
  } catch {
    return [];
  }
}

export interface SanityPushyPanelPost {
  category: string;
  title: string;
  date: string;
  excerpt: string;
  author: { name: string; avatar: string };
  likes: number;
  comments: number;
}

export interface SanityPushyPanel {
  logo: string;
  posts: SanityPushyPanelPost[];
  tagCloud: { title: string; tags: string[] };
  banner: { image: string; url: string };
}

export interface SanityModalsField {
  type: string;
  placeholder: string;
}

export interface SanityModals {
  register: {
    title: string;
    fields: SanityModalsField[];
    button: { text: string; url: string };
    note: string;
  };
  login: {
    title: string;
    fields: SanityModalsField[];
    rememberMe: boolean;
    forgotPassword: { url: string };
    button: { text: string; url: string };
    socialLogin: {
      heading: string;
      buttons: { platform: string; icon: string; url: string }[];
    };
  };
}

const pushyPanelQuery = `*[_type == "pushyPanel"][0]{
  logo,
  posts,
  tagCloud,
  banner
}`;

const modalsQuery = `*[_type == "modals"][0]{
  register,
  login
}`;

export async function fetchPushyPanel(): Promise<SanityPushyPanel | null> {
  try {
    return await client.fetch(pushyPanelQuery);
  } catch {
    return null;
  }
}

export async function fetchModals(): Promise<SanityModals | null> {
  try {
    return await client.fetch(modalsQuery);
  } catch {
    return null;
  }
}

export interface AllSanityData {
  hero: SanityHero | null;
  siteSettings: SanitySiteSettings | null;
  footer: SanityFooter | null;
  player: SanityPlayer | null;
  seasons: SanitySeason[];
  articles: SanityArticle[];
  pushyPanel: SanityPushyPanel | null;
  modals: SanityModals | null;
}

export async function fetchAllSanityData(): Promise<AllSanityData> {
  const [hero, siteSettings, footer, player, seasons, articles, pushyPanel, modals] = await Promise.all([
    fetchHero(),
    fetchSiteSettings(),
    fetchFooter(),
    fetchPlayer(),
    fetchSeasons(),
    fetchArticles(),
    fetchPushyPanel(),
    fetchModals(),
  ]);
  return { hero, siteSettings, footer, player, seasons, articles, pushyPanel, modals };
}
