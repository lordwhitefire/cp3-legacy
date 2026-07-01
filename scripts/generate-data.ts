import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import fs from "fs";
import path from "path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8dt6v1z";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-30",
  useCdn: false,
  perspective: "published",
});

const builder = createImageUrlBuilder({ projectId, dataset });
function urlFor(source: any) {
  return builder.image(source);
}

function buildImageUrl(image: any): string {
  if (!image || !image.asset?._ref) return "";
  try {
    return urlFor(image).width(1200).url() || "";
  } catch {
    return "";
  }
}

interface BackupData {
  site: any;
  header: any;
  mobileHeader: any;
  heroUnit: any;
  featuredCarousel: any;
  mainContent: any;
  footer: any;
  pushyPanel: any;
  modals: any;
}

interface SanityArticle {
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
  image: any;
  authorAvatar: any;
  titleHighlight?: string;
  titleEnd?: string;
}

async function main() {
  const dataPath = path.resolve("src/data/data.json");
  const backupPath = path.resolve("src/data/data.json.backup");
  const backup: BackupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

  const result: BackupData = JSON.parse(JSON.stringify(backup));

  // Fetch all Sanity data
  const [hero, siteSettings, articles, player, seasons, footer, pushyPanel, modals, matchResult] =
    await Promise.all([
      client.fetch(`*[_type == "hero"][0]`),
      client.fetch(`*[_type == "siteSettings"][0]`),
      client.fetch<SanityArticle[]>(`*[_type == "article"]`),
      client.fetch(`*[_type == "player"][0]`),
      client.fetch(`*[_type == "season"] | order(order asc)`),
      client.fetch(`*[_type == "footer"][0]`),
      client.fetch(`*[_type == "pushyPanel"][0]`),
      client.fetch(`*[_type == "modals"][0]`),
      client.fetch(`*[_type == "matchResult"][0]`),
    ]);

  // --- Hero Unit ---
  if (hero) {
    result.heroUnit = {
      subtitle: hero.subtitle || backup.heroUnit.subtitle,
      title: hero.title || backup.heroUnit.title,
      titleHighlight: hero.titleHighlight || backup.heroUnit.titleHighlight,
      description: hero.description || backup.heroUnit.description,
      button: {
        text: hero.buttonText || backup.heroUnit.button.text,
        url: hero.buttonUrl || backup.heroUnit.button.url,
      },
      image: buildImageUrl(hero.image) || backup.heroUnit.image,
    };
  }

  // --- Site Settings (newsletter + site info) ---
  if (siteSettings) {
    result.site = {
      ...backup.site,
      name: siteSettings.name || backup.site.name,
      tagline: siteSettings.tagline || backup.site.tagline,
      description: siteSettings.description || backup.site.description,
      url: siteSettings.url || backup.site.url,
      logo: buildImageUrl(siteSettings.logo) || backup.site.logo,
      favicon: buildImageUrl(siteSettings.favicon) || backup.site.favicon,
    };

    result.mainContent.newsletter = {
      title: siteSettings.newsletterTitle || backup.mainContent.newsletter.title,
      subtitle: siteSettings.newsletterSubtitle || backup.mainContent.newsletter.subtitle,
      description: siteSettings.newsletterDescription || backup.mainContent.newsletter.description,
      placeholder: siteSettings.newsletterPlaceholder || backup.mainContent.newsletter.placeholder,
      buttonText: siteSettings.newsletterButton || backup.mainContent.newsletter.buttonText,
    };
  }

  // --- Articles ---
  if (articles && articles.length > 0) {
    // Carousel slides
    const carouselArticles = articles.filter((a) => a.source === "carousel");
    if (carouselArticles.length > 0) {
      result.featuredCarousel.slides = carouselArticles.map((a) => ({
        id: a._id,
        image: buildImageUrl(a.image) || "",
        category: a.category || "",
        title: a.title || "",
        date: a.date || "",
        dateTime: a.date || "",
        views: a.views ?? 0,
        likes: a.likes ?? 0,
        comments: a.comments ?? 0,
      }));
    }

    // Featured news slides
    const featuredArticles = articles.filter((a) => a.source === "featured");
    if (featuredArticles.length > 0) {
      result.mainContent.featuredNews.slides = featuredArticles.map((a) => ({
        image: buildImageUrl(a.image) || "",
        category: a.category || "",
        categoryClass: "",
        title: a.title || "",
        titleHighlight: a.titleHighlight || "",
        titleEnd: a.titleEnd || "",
        excerpt: a.excerpt || "",
        author: {
          avatar: buildImageUrl(a.authorAvatar) || "",
          name: a.authorName || "",
        },
        date: a.date || "",
        dateTime: a.date || "",
      }));
    }

    // Latest news items
    const latestArticles = articles.filter((a) => a.source === "latest");
    if (latestArticles.length > 0) {
      result.mainContent.latestNews.items = latestArticles.map((a) => ({
        image: buildImageUrl(a.image) || "",
        category: a.category || "",
        title: a.title || "",
        excerpt: a.excerpt || "",
        date: a.date || "",
        dateTime: a.date || "",
        author: {
          name: a.authorName || "",
          avatar: buildImageUrl(a.authorAvatar) || "",
        },
        views: a.views ?? 0,
        likes: a.likes ?? 0,
        comments: a.comments ?? 0,
      }));
    }

    // Popular/Reddit news items
    const redditArticles = articles.filter((a) => a.source === "reddit");
    if (redditArticles.length > 0) {
      result.mainContent.popularNews.items = redditArticles.map((a) => ({
        title: a.title || "",
        excerpt: a.excerpt || "",
        image: buildImageUrl(a.image) || "",
        category: a.category || "",
        categoryClass: "",
        date: a.date || "",
        dateTime: a.date || "",
        author: {
          name: a.authorName || "",
          avatar: buildImageUrl(a.authorAvatar) || "",
        },
        redditUrl: a.redditUrl || "",
      }));
    }

    // Trending news tabs
    const trendingArticles = articles.filter(
      (a) => a.source === "newest" || a.source === "commented" || a.source === "popular"
    );
    if (trendingArticles.length > 0) {
      const newest = trendingArticles.filter((a) => a.source === "newest");
      const commented = trendingArticles.filter((a) => a.source === "commented");
      const popular = trendingArticles.filter((a) => a.source === "popular");

      const mapArticle = (a: SanityArticle) => ({
        title: a.title || "",
        excerpt: a.excerpt || "",
        image: buildImageUrl(a.image) || "",
        category: a.category || "",
        categoryClass: "",
        date: a.date || "",
        dateTime: a.date || "",
        views: a.views ?? 0,
        likes: a.likes ?? 0,
        comments: a.comments ?? 0,
      });

      result.mainContent.trendingNews.tabs = [
        {
          ...backup.mainContent.trendingNews.tabs[0],
          items: newest.length > 0 ? newest.map(mapArticle) : backup.mainContent.trendingNews.tabs[0]?.items || [],
        },
        {
          ...backup.mainContent.trendingNews.tabs[1],
          items: commented.length > 0 ? commented.map(mapArticle) : backup.mainContent.trendingNews.tabs[1]?.items || [],
        },
        {
          ...backup.mainContent.trendingNews.tabs[2],
          items: popular.length > 0 ? popular.map(mapArticle) : backup.mainContent.trendingNews.tabs[2]?.items || [],
        },
      ];
    }
  }

  // --- Seasons (Standings) ---
  if (seasons && seasons.length > 0) {
    result.mainContent.standings.seasons = seasons.map((s: any) => ({
      label: s.label || "",
      team: s.team || "",
      ppg: s.ppg?.toString() || "",
      apg: s.apg?.toString() || "",
      rpg: s.rpg?.toString() || "",
    }));
  }

  // --- Featured Player ---
  if (player) {
    result.mainContent.featuredPlayer = {
      teamLogo: buildImageUrl(player.teamLogo) || backup.mainContent.featuredPlayer.teamLogo,
      photo: buildImageUrl(player.photo) || backup.mainContent.featuredPlayer.photo,
      number: player.number?.toString() || backup.mainContent.featuredPlayer.number,
      firstName: player.firstName || backup.mainContent.featuredPlayer.firstName,
      lastName: player.lastName || backup.mainContent.featuredPlayer.lastName,
      stats: player.stats && player.stats.length > 0
        ? player.stats.map((s: any) => ({
            label: s.label || "",
            value: s.value || "",
            unit: s.unit || "",
          }))
        : backup.mainContent.featuredPlayer.stats,
      footerLabel: backup.mainContent.featuredPlayer.footerLabel,
    };
  }

  // --- Footer ---
  if (footer) {
    result.footer = {
      ...backup.footer,
      logo: {
        src: buildImageUrl(footer.logo) || backup.footer.logo.src,
        alt: backup.footer.logo.alt || "CP3 Legacy",
      },
      contactInfo: {
        title: footer.contactTitle || backup.footer.contactInfo.title,
        description: footer.contactDescription || backup.footer.contactInfo.description,
        items: footer.contactItems && footer.contactItems.length > 0
          ? footer.contactItems.map((i: any) => ({
              icon: i.icon || "",
              heading: i.heading || "",
              linkText: i.linkText || "",
              linkHref: i.linkHref || "",
            }))
          : backup.footer.contactInfo.items,
        social: footer.socialLinks && footer.socialLinks.length > 0
          ? footer.socialLinks.map((s: any) => ({
              platform: s.platform || "",
              url: s.url || "",
            }))
          : backup.footer.contactInfo.social,
      },
      gallery: {
        title: footer.galleryTitle || backup.footer.gallery.title,
        images: backup.footer.gallery.images,
        button: {
          text: footer.galleryButtonText || backup.footer.gallery.button?.text || "",
          url: footer.galleryButtonUrl || backup.footer.gallery.button?.url || "",
        },
      },
      nav: footer.navLinks && footer.navLinks.length > 0
        ? footer.navLinks.map((n: any) => ({
            label: n.label || "",
            url: n.url || "",
          }))
        : backup.footer.nav,
    };
  }

  // --- Pushy Panel ---
  if (pushyPanel) {
    result.pushyPanel = {
      logo: buildImageUrl(pushyPanel.logo) || (typeof pushyPanel.logo === "string" ? pushyPanel.logo : backup.pushyPanel.logo),
      posts: pushyPanel.posts && pushyPanel.posts.length > 0
        ? pushyPanel.posts.map((p: any) => ({
            category: p.category || "",
            title: p.title || "",
            date: p.date || "",
            excerpt: p.excerpt || "",
            author: {
              name: p.author?.name || "",
              avatar: p.author?.avatar || backup.pushyPanel.posts[0]?.author?.avatar || "",
            },
            likes: p.likes ?? 0,
            comments: p.comments ?? 0,
          }))
        : backup.pushyPanel.posts,
      tagCloud: {
        title: pushyPanel.tagCloud?.title || backup.pushyPanel.tagCloud.title,
        tags: pushyPanel.tagCloud?.tags || backup.pushyPanel.tagCloud.tags,
      },
      banner: {
        image: backup.pushyPanel.banner.image,
        url: pushyPanel.banner?.url || backup.pushyPanel.banner.url,
      },
    };
  }

  // --- Modals ---
  if (modals) {
    result.modals = {
      register: {
        title: modals.register?.title || backup.modals.register.title,
        fields: modals.register?.fields && modals.register.fields.length > 0
          ? modals.register.fields.map((f: any) => ({
              type: f.type || "",
              placeholder: f.placeholder || "",
            }))
          : backup.modals.register.fields,
        button: {
          text: modals.register?.button?.text || backup.modals.register.button.text,
          url: modals.register?.button?.url || backup.modals.register.button.url,
        },
        note: modals.register?.note || backup.modals.register.note,
      },
      login: {
        title: modals.login?.title || backup.modals.login.title,
        fields: modals.login?.fields && modals.login.fields.length > 0
          ? modals.login.fields.map((f: any) => ({
              type: f.type || "",
              placeholder: f.placeholder || "",
            }))
          : backup.modals.login.fields,
        rememberMe: modals.login?.rememberMe ?? backup.modals.login.rememberMe,
        forgotPassword: {
          url: modals.login?.forgotPassword?.url || backup.modals.login.forgotPassword.url,
        },
        button: {
          text: modals.login?.button?.text || backup.modals.login.button.text,
          url: modals.login?.button?.url || backup.modals.login.button.url,
        },
        socialLogin: {
          heading: modals.login?.socialLogin?.heading || backup.modals.login.socialLogin.heading,
          buttons: modals.login?.socialLogin?.buttons && modals.login.socialLogin.buttons.length > 0
            ? modals.login.socialLogin.buttons.map((b: any) => ({
                platform: b.platform || "",
                icon: b.icon || "",
                url: b.url || "",
              }))
            : backup.modals.login.socialLogin.buttons,
        },
      },
    };
  }

  // --- Match Result ---
  if (matchResult) {
    result.mainContent.lastGameResult.match = {
      date: matchResult.date || backup.mainContent.lastGameResult.match.date,
      dateTime: matchResult.date || backup.mainContent.lastGameResult.match.dateTime,
      title: matchResult.title || backup.mainContent.lastGameResult.match.title,
      scoreLabel: matchResult.scoreLabel || backup.mainContent.lastGameResult.match.scoreLabel,
      scoreWinner: matchResult.scoreWinner ?? backup.mainContent.lastGameResult.match.scoreWinner,
      scoreLoser: matchResult.scoreLoser ?? backup.mainContent.lastGameResult.match.scoreLoser,
      team1: {
        name: matchResult.team1Name || backup.mainContent.lastGameResult.match.team1.name,
        logo: buildImageUrl(matchResult.team1Logo) || backup.mainContent.lastGameResult.match.team1.logo,
        desc: matchResult.team1Description || backup.mainContent.lastGameResult.match.team1.desc,
      },
      team2: {
        name: matchResult.team2Name || backup.mainContent.lastGameResult.match.team2.name,
        logo: buildImageUrl(matchResult.team2Logo) || backup.mainContent.lastGameResult.match.team2.logo,
        desc: matchResult.team2Description || backup.mainContent.lastGameResult.match.team2.desc,
      },
      quarters: matchResult.quarters || backup.mainContent.lastGameResult.match.quarters,
      mvp: {
        name: matchResult.mvp?.name || backup.mainContent.lastGameResult.match.mvp.name,
        photo: buildImageUrl(matchResult.mvp?.photo) || backup.mainContent.lastGameResult.match.mvp.photo,
        position: matchResult.mvp?.position || backup.mainContent.lastGameResult.match.mvp.position,
        stats: matchResult.mvp?.stats || backup.mainContent.lastGameResult.match.mvp.stats,
      },
      stats: matchResult.stats || backup.mainContent.lastGameResult.match.stats,
    };
  }

  const output = {
    _lastUpdated: new Date().toISOString(),
    _source: "sanity-webhook",
    ...result,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), "utf-8");
  console.log("✓ data.json generated from Sanity data");
}

main().catch((err) => {
  console.error("Failed to generate data.json:", err);
  process.exit(1);
});
