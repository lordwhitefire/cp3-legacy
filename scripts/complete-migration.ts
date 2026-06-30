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

const PUBLIC_DIR = path.resolve("public");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

function imgRef(assetId: string) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

const STATS_AVATAR = "/alchemists/assets/images/samples/avatar-1.jpg";

// ─── Image Upload ────────────────────────────────────────────────────────────

async function findExistingAsset(
  filename: string
): Promise<string | null> {
  const result = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename }
  );
  return result?._id ?? null;
}

async function uploadImage(
  relativePath: string
): Promise<string | null> {
  const absPath = path.join(PUBLIC_DIR, relativePath);
  if (!fs.existsSync(absPath)) {
    console.warn(`  ⚠ Image not found: ${relativePath}`);
    return null;
  }
  const filename = path.basename(relativePath);
  const existingId = await findExistingAsset(filename);
  if (existingId) {
    console.log(`  ✓ Already exists: ${filename} (${existingId})`);
    return existingId;
  }
  try {
    const buffer = fs.readFileSync(absPath);
    const asset = await client.assets.upload("image", buffer, { filename });
    console.log(`  ✓ Uploaded: ${filename} -> ${asset._id}`);
    return asset._id;
  } catch (err: any) {
    console.error(`  ✗ Failed to upload ${filename}: ${err.message}`);
    return null;
  }
}

// ─── Article data builder ────────────────────────────────────────────────────

type ArticleEntry = {
  id: string;
  title: string;
  source: string;
  imagePath: string | null;
  hasAuthor: boolean;
  redditUrl?: string;
  excerpt?: string;
  category?: string;
  date?: string;
  views?: number;
  likes?: number;
  comments?: number;
  featured?: boolean;
};

function buildArticles(data: any): ArticleEntry[] {
  const entries: ArticleEntry[] = [];

  // Carousel — index-based IDs
  const carouselSlides = data.featuredCarousel?.slides ?? [];
  for (let i = 0; i < carouselSlides.length; i++) {
    const slide = carouselSlides[i];
    if (!slide.title) continue;
    entries.push({
      id: `article-carousel-${i}`,
      title: slide.title,
      source: "carousel",
      imagePath: slide.image || null,
      hasAuthor: false,
      excerpt: "",
      category: slide.category || "",
      date: slide.dateTime || slide.date || "",
      views: slide.views || 0,
      likes: slide.likes || 0,
      comments: slide.comments || 0,
    });
  }

  // Featured news — index-based IDs
  const featuredSlides = data.mainContent?.featuredNews?.slides ?? [];
  for (let i = 0; i < featuredSlides.length; i++) {
    const slide = featuredSlides[i];
    if (!slide.title) continue;
    entries.push({
      id: `article-featured-${i}`,
      title: slide.title,
      source: "featured",
      imagePath: slide.image || null,
      hasAuthor: !!slide.author,
      excerpt: slide.excerpt || "",
      category: slide.category || "",
      date: slide.dateTime || slide.date || "",
      featured: true,
    });
  }

  // Latest news — index-based IDs
  const latestItems = data.mainContent?.latestNews?.items ?? [];
  for (let i = 0; i < latestItems.length; i++) {
    const item = latestItems[i];
    if (!item.title) continue;
    entries.push({
      id: `article-latestnews-${i}`,
      title: item.title,
      source: "latest",
      imagePath: item.image || null,
      hasAuthor: !!item.author,
      excerpt: item.excerpt || "",
      category: item.category || "",
      date: item.dateTime || item.date || "",
      views: item.views || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
    });
  }

  // Reddit / popular news — index-based IDs
  const redditItems = data.mainContent?.popularNews?.items ?? [];
  for (let i = 0; i < redditItems.length; i++) {
    const item = redditItems[i];
    if (!item.title) continue;
    entries.push({
      id: `article-reddit-${i}`,
      title: item.title,
      source: "reddit",
      imagePath: item.image || null,
      hasAuthor: !!item.author,
      excerpt: item.excerpt || "",
      category: item.category || "",
      date: item.dateTime || item.date || "",
      redditUrl: item.redditUrl || "",
    });
  }

  // Trending tabs — index-based IDs per tab, source from tab ID
  const sourceMap: Record<string, string> = {
    "widget-tabbed-newest": "newest",
    "widget-tabbed-commented": "commented",
    "widget-tabbed-popular": "popular",
  };
  const prefixMap: Record<string, string> = {
    "widget-tabbed-newest": "newest",
    "widget-tabbed-commented": "commented",
    "widget-tabbed-popular": "popular",
  };
  for (const tab of data.mainContent?.trendingNews?.tabs ?? []) {
    const source = sourceMap[tab.id] || "trending";
    const prefix = prefixMap[tab.id] || "trending";
    const items = tab.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.title) continue;
      entries.push({
        id: `article-${prefix}-${i}`,
        title: item.title,
        source,
        imagePath: item.image || null,
        hasAuthor: false,
        excerpt: item.excerpt || "",
        category: item.category || "",
        date: item.dateTime || item.date || "",
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
      });
    }
  }

  return entries;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const dataPath = path.resolve("src/data/data.json.backup");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  let imagesUploaded = 0;
  let docsCreated = 0;
  let docsPatched = 0;
  let errors: string[] = [];

  console.log("=".repeat(60));
  console.log("STEP 1: Uploading images");
  console.log("=".repeat(60));

  const allImagePaths = Array.from(
    new Set([
      // From the prompt spec
      "/alchemists/assets/images/logo.png",
      "/alchemists/assets/images/samples/avatar-1.jpg",
      "/alchemists/assets/images/samples/banner.jpg",
      "/alchemists/assets/images/samples/header_player.png",
      "/alchemists/assets/images/samples/widget-featured-player.png",
      "/alchemists/assets/images/samples/stats_player_02.jpg",
      "/alchemists/assets/images/samples/logos/alchemists_b_shield.png",
      // refresh-featured-{1..14}
      ...Array.from({ length: 14 }, (_, i) =>
        `/alchemists/assets/images/samples/refresh-featured-${i + 1}.jpg`
      ),
      // refresh-news-{1..4}
      ...Array.from({ length: 4 }, (_, i) =>
        `/alchemists/assets/images/samples/refresh-news-${i + 1}.jpg`
      ),
      // refresh-trending-newest-{1..5}
      ...Array.from({ length: 5 }, (_, i) =>
        `/alchemists/assets/images/samples/refresh-trending-newest-${i + 1}.jpg`
      ),
      // refresh-trending-popular-{1..5}
      ...Array.from({ length: 5 }, (_, i) =>
        `/alchemists/assets/images/samples/refresh-trending-popular-${i + 1}.jpg`
      ),
      // instagram-img{1..6}
      ...Array.from({ length: 6 }, (_, i) =>
        `/alchemists/assets/images/samples/instagram-img${i + 1}.jpg`
      ),
      // Additional images referenced in data.json
      "/alchemists/assets/images/samples/cart-sm-1.jpg",
      "/alchemists/assets/images/samples/cart-sm-2.jpg",
      "/alchemists/assets/images/samples/cart-sm-3.jpg",
      "/alchemists/assets/images/samples/post-img3-xs.jpg",
      "/alchemists/assets/images/samples/post-img1-xs.jpg",
      "/alchemists/assets/images/samples/post-img4-xs.jpg",
    ])
  );

  const imageMap: Record<string, string> = {};

  for (const relPath of allImagePaths) {
    const assetId = await uploadImage(relPath);
    if (assetId) {
      imageMap[relPath] = assetId;
      imagesUploaded++;
    }
  }

  console.log(`\nImages uploaded: ${imagesUploaded}`);

  // ─── STEP 2: Process articles ──────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Processing articles (create/patch)");
  console.log("=".repeat(60));

  const articleEntries = buildArticles(data);

  let articlesCreated = 0;

  for (const entry of articleEntries) {
    const imageRef = entry.imagePath ? imageMap[entry.imagePath] : null;
    const authorAvatarRef = entry.hasAuthor ? imageMap[STATS_AVATAR] : null;

    const payload: Record<string, any> = {
      title: entry.title,
      slug: { _type: "slug", current: slugify(entry.title) },
      excerpt: entry.excerpt || "",
      category: entry.category || "",
      date: entry.date || new Date().toISOString(),
      source: entry.source,
      views: entry.views || 0,
      likes: entry.likes || 0,
      comments: entry.comments || 0,
      featured: entry.source === "featured",
      redditUrl: entry.redditUrl || "",
    };

    if (imageRef) {
      payload.image = imgRef(imageRef);
    }
    if (authorAvatarRef) {
      payload.authorAvatar = imgRef(authorAvatarRef);
    }
    if (entry.hasAuthor && imageMap[STATS_AVATAR]) {
      payload.authorName = "Victor Makuo";
    }

    try {
      await client.createIfNotExists({
        _id: entry.id,
        _type: "article",
        ...payload,
      });
      articlesCreated++;
    } catch (err: any) {
      errors.push(`Article "${entry.title}": ${err.message}`);
    }
  }

  console.log(`  Articles created: ${articlesCreated}`);

  // ─── STEP 3: Create single-instance documents ──────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Creating single-instance documents");
  console.log("=".repeat(60));

  // Hero
  try {
    const heroImg = imageMap["/alchemists/assets/images/samples/header_player.png"];
    await client.createIfNotExists({
      _id: "hero",
      _type: "hero",
      description:
        data.heroUnit.description ||
        "Celebrating 19 seasons of greatness — from Wake Forest to the Hall of Fame.",
      buttonText: data.heroUnit.button?.text || "Explore CP3's Journey",
      buttonUrl: data.heroUnit.button?.url || "#",
      ...(heroImg ? { image: imgRef(heroImg) } : {}),
    });
    docsCreated++;
    console.log("  ✓ Hero created");
  } catch (err: any) {
    errors.push(`Hero: ${err.message}`);
  }

  // Featured Player
  try {
    const teamLogo = imageMap["/alchemists/assets/images/logo.png"];
    const playerPhoto =
      imageMap["/alchemists/assets/images/samples/widget-featured-player.png"];
    const fp = data.mainContent.featuredPlayer;
    await client.createIfNotExists({
      _id: "featuredPlayer",
      _type: "player",
      firstName: fp.firstName,
      lastName: fp.lastName,
      number: fp.number,
      stats: fp.stats || [],
      ...(teamLogo ? { teamLogo: imgRef(teamLogo) } : {}),
      ...(playerPhoto ? { photo: imgRef(playerPhoto) } : {}),
    });
    docsCreated++;
    console.log("  ✓ FeaturedPlayer created");
  } catch (err: any) {
    errors.push(`FeaturedPlayer: ${err.message}`);
  }

  // Footer
  try {
    const logoId = imageMap["/alchemists/assets/images/logo.png"];
    await client.createIfNotExists({
      _id: "footer",
      _type: "footer",
      ...(logoId ? { logo: imgRef(logoId) } : {}),
    });
    docsCreated++;
    console.log("  ✓ Footer created");
  } catch (err: any) {
    errors.push(`Footer: ${err.message}`);
  }

  // SiteSettings
  try {
    const logoId = imageMap["/alchemists/assets/images/logo.png"];
    await client.createIfNotExists({
      _id: "siteSettings",
      _type: "siteSettings",
      ...(logoId ? { logo: imgRef(logoId) } : {}),
    });
    docsCreated++;
    console.log("  ✓ SiteSettings created");
  } catch (err: any) {
    errors.push(`SiteSettings: ${err.message}`);
  }

  // PushyPanel
  try {
    const pp = data.pushyPanel;
    await client.createIfNotExists({
      _id: "pushyPanel",
      _type: "pushyPanel",
      logo: pp.logo || "/alchemists/assets/images/logo.png",
      posts:
        pp.posts?.map((p: any, i: number) => ({
          _key: `post${i + 1}`,
          image: p.image || "",
          category: p.category || "",
          title: p.title || "",
          date: p.date || "",
          excerpt: p.excerpt || "",
          author: p.author || { name: "", avatar: "" },
          likes: p.likes || 0,
          comments: p.comments || 0,
        })) || [],
      tagCloud: {
        title: pp.tagCloud?.title || "Tag Cloud",
        tags: pp.tagCloud?.tags || [],
      },
      banner: {
        image: pp.banner?.image || "/alchemists/assets/images/samples/banner.jpg",
        url: pp.banner?.url || "#",
      },
    });
    docsCreated++;
    console.log("  ✓ PushyPanel created");
  } catch (err: any) {
    errors.push(`PushyPanel: ${err.message}`);
  }

  // ─── STEP 4: Create seasons ──────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: Creating season documents");
  console.log("=".repeat(60));

  const seasonsData = data.mainContent?.standings?.seasons ?? [];
  for (let i = 0; i < seasonsData.length; i++) {
    const s = seasonsData[i];
    try {
      await client.createIfNotExists({
        _id: `season-${i}`,
        _type: "season",
        order: i,
        label: s.label || "",
        team: s.team || "",
        ppg: s.ppg?.toString() || "",
        apg: s.apg?.toString() || "",
        rpg: s.rpg?.toString() || "",
      });
      docsCreated++;
    } catch (err: any) {
      errors.push(`Season ${i}: ${err.message}`);
    }
  }
  console.log(`  Seasons created: ${seasonsData.length}`);

  // ─── STEP 5: Create modals ─────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: Creating modals document");
  console.log("=".repeat(60));

  try {
    const mod = data.modals;
    await client.createIfNotExists({
      _id: "modals",
      _type: "modals",
      register: {
        title: mod.register?.title || "",
        fields: mod.register?.fields || [],
        button: mod.register?.button || { text: "", url: "" },
        note: mod.register?.note || "",
      },
      login: {
        title: mod.login?.title || "",
        fields: mod.login?.fields || [],
        rememberMe: mod.login?.rememberMe ?? false,
        forgotPassword: mod.login?.forgotPassword || { url: "" },
        button: mod.login?.button || { text: "", url: "" },
        socialLogin: mod.login?.socialLogin || { heading: "", buttons: [] },
      },
    });
    docsCreated++;
    console.log("  ✓ Modals created");
  } catch (err: any) {
    errors.push(`Modals: ${err.message}`);
  }

  // ─── STEP 6: Create matchResult ────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("STEP 6: Creating matchResult document");
  console.log("=".repeat(60));

  try {
    const match = data.mainContent?.lastGameResult?.match;
    if (match) {
      const team1LogoId =
        imageMap[match.team1?.logo] ||
        imageMap["/alchemists/assets/images/samples/logos/alchemists_b_shield.png"];
      const team2LogoId =
        imageMap[match.team2?.logo] ||
        imageMap["/alchemists/assets/images/samples/logos/alchemists_b_shield.png"];
      const mvpPhotoId =
        imageMap[match.mvp?.photo] ||
        imageMap["/alchemists/assets/images/samples/stats_player_02.jpg"];

      await client.createIfNotExists({
        _id: "matchResult",
        _type: "matchResult",
        title: match.title || "San Antonio Spurs vs ",
        date: match.dateTime || match.date || "",
        scoreLabel: match.scoreLabel || "Final Score",
        scoreWinner: match.scoreWinner ?? 0,
        scoreLoser: match.scoreLoser ?? 0,
        team1Name: match.team1?.name || "San Antonio Spurs",
        team1Logo: team1LogoId ? imgRef(team1LogoId) : undefined,
        team1Description: match.team1?.desc || "",
        team2Name: match.team2?.name || "",
        team2Logo: team2LogoId ? imgRef(team2LogoId) : undefined,
        // Extra fields beyond schema
        quarters: match.quarters || null,
        stats: match.stats || [],
        mvp: match.mvp
          ? {
              name: match.mvp.name || "",
              photo: mvpPhotoId ? imgRef(mvpPhotoId) : undefined,
              position: match.mvp.position || "",
              stats: match.mvp.stats || [],
            }
          : null,
      });
      docsCreated++;
      console.log("  ✓ matchResult created");
    } else {
      console.log("  ⚠ No match data found");
    }
  } catch (err: any) {
    errors.push(`matchResult: ${err.message}`);
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(60));
  console.log("MIGRATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Images uploaded: ${imagesUploaded}`);
  console.log(`  Documents created: ${docsCreated}`);
  console.log(`  Documents patched: ${docsPatched}`);
  console.log(`  Total article count from JSON: ${articleEntries.length}`);
  if (errors.length > 0) {
    console.log(`\n  Errors (${errors.length}):`);
    for (const e of errors) {
      console.log(`    ✗ ${e}`);
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
