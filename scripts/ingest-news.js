#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search?q=Chris+Paul+NBA&hl=en-US&gl=US&ceid=US:en';

function extractItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title>(.*?)<\/title>/) || ['', ''])[1]
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const link = (block.match(/<link>(.*?)<\/link>/) || ['', ''])[1];
    const source = (block.match(/<source[^>]*>(.*?)<\/source>/) || ['', ''])[1];
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/) || ['', ''])[1];
    const desc = (block.match(/<description>(.*?)<\/description>/) || ['', ''])[1];
    items.push({ title, link, source, pubDate, description: desc });
  }
  return items;
}

function extractOgImage(html, url) {
  const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (match) return match[1];
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function resolveRedirect(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 0,
      timeout: 5000,
      validateStatus: s => s >= 200 && s < 400,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.headers.location) return resolveRedirect(res.headers.location);
    return url;
  } catch {
    return url;
  }
}

async function go() {
  console.log('Fetching Google News RSS...');
  const { data: xml } = await axios.get(GOOGLE_NEWS_RSS, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const items = extractItems(xml);
  console.log(`Found ${items.length} articles`);

  const top = items.slice(0, 5);
  const mutations = [];

  for (let i = 0; i < top.length; i++) {
    const item = top[i];
    let imageUrl = null;
    let actualUrl = item.link;

    console.log(`[${i + 1}] ${item.title.substring(0, 50)}...`);

    try {
      actualUrl = await resolveRedirect(item.link);
      const res = await axios.get(actualUrl, {
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      imageUrl = extractOgImage(res.data, actualUrl);
      if (imageUrl) console.log(`  og:image found`);
      else console.log(`  no og:image`);
    } catch {
      console.log(`  cannot fetch article page`);
    }

    const docId = `news-${String(i + 1).padStart(3, '0')}`;
    mutations.push({
      createOrReplace: {
        _id: docId,
        _type: 'reaction',
        source: 'news',
        title: item.title,
        text: stripHtml(item.description).substring(0, 500),
        url: actualUrl,
        imageUrl,
        sourceName: stripHtml(item.source),
        created: new Date(item.pubDate).toISOString(),
        likes: 0,
        approved: true,
      }
    });
  }

  if (mutations.length === 0) {
    console.log('No news items to upload.');
    return;
  }

  console.log(`Uploading ${mutations.length} documents to Sanity...`);
  const res = await axios.post(SANITY_URL, { mutations }, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
  });
  console.log(`Done! Transaction: ${res.data.transactionId}`);
}

go().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
