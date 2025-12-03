#!/usr/bin/env node
/* Pull recent CP3 tweets & /r/nba hot posts */
const axios = require('axios');
const {TwitterApi} = require('twitter-api-v2');
const Snoowrap = require('snoowrap');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

const twitter = new TwitterApi(process.env.TWITTER_BEARER);
const reddit = new Snoowrap({
  userAgent: 'cp-legacy-bot',
  clientId: process.env.REDDIT_CLIENT,
  clientSecret: process.env.REDDIT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH
});

async function go() {
  const tweets = await twitter.v2.search('chris paul -is:retweet lang:en', {max_results: 15});
  const redditPosts = await reddit.getSubreddit('nba').getHot({limit: 15});

  const mutations = [];

  tweets.data?.forEach(t => mutations.push({
    createOrReplace: {
      _id: `tweet_${t.id}`,
      _type: 'reaction',
      source: 'twitter',
      text: t.text.substring(0, 280),
      url: `https://twitter.com/i/status/${t.id}`,
      votes: 0,
      created: new Date(t.created_at).toISOString(),
      approved: false
    }
  }));

  redditPosts.forEach(p => mutations.push({
    createOrReplace: {
      _id: `reddit_${p.id}`,
      _type: 'reaction',
      source: 'reddit',
      text: p.title.substring(0, 280),
      url: `https://reddit.com${p.permalink}`,
      votes: 0,
      created: new Date(p.created_utc * 1000).toISOString(),
      approved: false
    }
  }));

  if (mutations.length) {
    await axios.post(SANITY_URL, {mutations}, {
      headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'}
    });
    console.log(`Upserted ${mutations.length} reactions`);
  }
}

go().catch(console.error);