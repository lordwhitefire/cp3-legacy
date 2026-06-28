#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;
const REDDIT_FEED = 'https://www.reddit.com/r/nba/search/.rss?q=Chris+Paul&restrict_sr=1&sort=new&t=day';
const UA = 'vantage-cp3-app/1.0 (by /u/lordwhitefire)';

function extractEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title[^>]*>(.*?)<\/title>/) || ['', ''])[1]
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const url = (block.match(/<link[^>]*href="([^"]+)"/) || ['', ''])[1];
    const author = (block.match(/<name>(.*?)<\/name>/) || ['', ''])[1];
    const updated = (block.match(/<updated>(.*?)<\/updated>/) || ['', ''])[1];
    const content = (block.match(/<content[^>]*>(.*?)<\/content>/) || ['', ''])[1];
    entries.push({ title, url, author, updated, content });
  }
  return entries;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function go() {
  console.log('Fetching Reddit RSS...');
  const { data: xml } = await axios.get(REDDIT_FEED, {
    headers: { 'User-Agent': UA }
  });

  const entries = extractEntries(xml);
  console.log(`Found ${entries.length} entries`);

  const top = entries.slice(0, 5);
  const mutations = [];

  for (let i = 0; i < top.length; i++) {
    const entry = top[i];
    const text = stripHtml(entry.content).substring(0, 500);

    console.log(`[${i + 1}] ${entry.title.substring(0, 50)}... (u/${entry.author})`);

    const docId = `reddit-${String(i + 1).padStart(3, '0')}`;
    mutations.push({
      createOrReplace: {
        _id: docId,
        _type: 'reaction',
        source: 'reddit',
        title: entry.title,
        text,
        url: entry.url,
        author: entry.author,
        created: new Date(entry.updated).toISOString(),
        likes: 0,
        approved: true,
      }
    });
  }

  if (mutations.length === 0) {
    console.log('No Reddit entries to upload.');
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
