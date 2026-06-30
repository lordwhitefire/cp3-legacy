import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8dt6v1z",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-06-30",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const dataPath = path.resolve("src/data/data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function migrate() {
  const results: { type: string; id: string }[] = [];

  // 1. Site Settings
  const siteSettings = await client.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    name: data.site.name,
    tagline: data.site.tagline,
    description: data.site.description,
    url: data.site.url,
    searchPlaceholder: data.header.searchPlaceholder,
    newsletterTitle: data.mainContent.newsletter.title,
    newsletterSubtitle: data.mainContent.newsletter.subtitle,
    newsletterDescription: data.mainContent.newsletter.description,
    newsletterPlaceholder: data.mainContent.newsletter.placeholder,
    newsletterButton: data.mainContent.newsletter.buttonText,
  });
  results.push({ type: "siteSettings", id: siteSettings._id });
  console.log(`✓ siteSettings`);

  // 2. Hero
  const hero = await client.createIfNotExists({
    _id: "hero",
    _type: "hero",
    subtitle: data.heroUnit.subtitle,
    title: data.heroUnit.title,
    titleHighlight: data.heroUnit.titleHighlight,
    description: data.heroUnit.description,
    buttonText: data.heroUnit.button.text,
    buttonUrl: data.heroUnit.button.url,
  });
  results.push({ type: "hero", id: hero._id });
  console.log(`✓ hero`);

  // 3. Articles (from all news sections)
  const articleSources = [
    ...data.featuredCarousel.slides.map((s: any) => ({ ...s, source: "carousel" })),
    ...data.mainContent.featuredNews.slides.map((s: any) => ({ ...s, source: "featured" })),
    ...data.mainContent.latestNews.items.map((s: any) => ({ ...s, source: "latest" })),
    ...data.mainContent.popularNews.items.map((s: any) => ({ ...s, source: "reddit", redditUrl: s.redditUrl })),
  ];

  // Add trending news items
  for (const tab of data.mainContent.trendingNews.tabs) {
    for (const item of tab.items) {
      articleSources.push({ ...item, source: tab.id === "tab-newest" ? "trending" : tab.id === "tab-popular" ? "popular" : "trending" });
    }
  }

  let articleCount = 0;
  for (const src of articleSources) {
    if (!src.title) continue;
    const slug = src.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 96);
    try {
      await client.createIfNotExists({
        _id: `article-${slug}`,
        _type: "article",
        title: src.title,
        slug: { _type: "slug", current: slug },
        excerpt: src.excerpt || "",
        category: src.category || "",
        date: src.dateTime || src.date || new Date().toISOString(),
        authorName: src.author?.name || "",
        views: src.views || 0,
        likes: src.likes || 0,
        comments: src.comments || 0,
        source: src.source || "latest",
        redditUrl: src.redditUrl || "",
        featured: src.source === "featured",
      });
      articleCount++;
    } catch (e: any) {
      console.error(`✗ Failed to create article "${src.title}": ${e.message}`);
    }
  }
  console.log(`✓ articles: ${articleCount} created`);

  // 4. Seasons
  let seasonCount = 0;
  for (const s of data.mainContent.standings.seasons) {
    if (!s.label) continue;
    try {
      const seasonSlug = s.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await client.createIfNotExists({
        _id: `season-${seasonSlug}`,
        _type: "season",
        label: s.label,
        team: s.team || "",
        ppg: s.ppg?.toString() || "",
        apg: s.apg?.toString() || "",
        rpg: s.rpg?.toString() || "",
        order: seasonCount,
      });
      seasonCount++;
    } catch (e: any) {
      console.error(`✗ Failed to create season "${s.label}": ${e.message}`);
    }
  }
  console.log(`✓ seasons: ${seasonCount} created`);

  // 5. Featured Player
  const fp = data.mainContent.featuredPlayer;
  const player = await client.createIfNotExists({
    _id: "featuredPlayer",
    _type: "player",
    firstName: fp.firstName,
    lastName: fp.lastName,
    number: fp.number,
    stats: fp.stats || [],
  });
  results.push({ type: "player", id: player._id });
  console.log(`✓ player`);

  // 6. Footer
  const footer = await client.createIfNotExists({
    _id: "footer",
    _type: "footer",
    contactTitle: data.footer.contactInfo.title,
    contactDescription: data.footer.contactInfo.description,
    contactItems: data.footer.contactInfo.items?.map((i: any) => ({
      _key: i.heading?.toLowerCase().replace(/\s+/g, "-") || Math.random().toString(36).slice(2),
      icon: i.icon,
      heading: i.heading,
      linkText: i.linkText,
      linkHref: i.linkHref,
    })) || [],
    socialLinks: data.footer.contactInfo.social?.map((s: any) => ({
      _key: s.platform,
      platform: s.platform,
      url: s.url,
    })) || [],
    galleryTitle: data.footer.gallery.title,
    galleryButtonText: data.footer.gallery.button?.text,
    galleryButtonUrl: data.footer.gallery.button?.url,
    navLinks: data.footer.nav?.map((n: any) => ({
      _key: n.label?.toLowerCase().replace(/\s+/g, "-") || Math.random().toString(36).slice(2),
      label: n.label,
      url: n.url,
    })) || [],
  });
  results.push({ type: "footer", id: footer._id });
  console.log(`✓ footer`);

  console.log(`\nMigration complete. ${results.length + articleCount + seasonCount} total documents created.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
