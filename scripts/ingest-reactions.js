#!/usr/bin/env node
/* Pull ONLY recent CP3 tweets */
const axios = require('axios');
const { TwitterApi, ApiResponseError } = require('twitter-api-v2');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

const twitter = new TwitterApi(process.env.TWITTER_BEARER);

async function waitForRateLimitReset(resetTime) {
  const resetDate = new Date(resetTime * 1000);
  const now = new Date();
  const waitMs = resetDate - now;
  
  console.log(`⏳ Rate limited until: ${resetDate.toLocaleString()} (${Math.round(waitMs/1000)}s)`);
  return new Promise(resolve => setTimeout(resolve, Math.max(waitMs, 1000)));
}

async function go() {
  try {
    console.log('🔍 Searching recent Chris Paul tweets...');
    
    const res = await twitter.v2.search('chris paul -is:retweet lang:en', { 
      max_results: 10,  // Fixed: Explicitly set 10-100 range
      'tweet.fields': 'created_at,author_id,public_metrics'  // Added more useful fields
    });
    
    const tweets = res.data?.data || [];
    console.log(`\n✅ Found ${tweets.length} tweets:\n`);
    console.log('='.repeat(90));
    
    tweets.forEach((t, i) => {
      const date = t.created_at ? new Date(t.created_at).toLocaleString() : 'N/A';
      const preview = t.text.length > 100 ? t.text.substring(0, 100) + '...' : t.text;
      
      console.log(`${i+1}. [${date}] ${preview}`);
      console.log(`   👤 ID: ${t.id} | URL: https://twitter.com/i/status/${t.id}`);
      if (t.public_metrics) {
        console.log(`   📊 Likes: ${t.public_metrics.like_count} | Retweets: ${t.public_metrics.retweet_count}`);
      }
      console.log('');
    });
    
    console.log('='.repeat(90));
    
    // Pause to review tweets
    console.log('\n⏸️  Tweets displayed. Waiting 10s before Sanity upsert... (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Sanity upsert
    const mutations = tweets.map(t => ({
      createOrReplace: {
        _id: `tweet_${t.id}`,
        _type: 'reaction',
        source: 'twitter',
        text: t.text.substring(0, 280),
        url: `https://twitter.com/i/status/${t.id}`,
        votes: t.public_metrics?.like_count || 0,
        created: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
        approved: false
      }
    }));

    if (mutations.length) {
      await axios.post(SANITY_URL, {mutations}, {
        headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'}
      });
      console.log(`✅ Upserted ${mutations.length} tweets to Sanity!`);
    }
    
  } catch (error) {
    if (error instanceof ApiResponseError) {
      if (error.code === 429 && error.rateLimit) {
        console.log('🚫 Rate limit hit!');
        await waitForRateLimitReset(error.rateLimit.reset);
        return go(); // Retry
      } else if (error.code === 400) {
        console.error('❌ Invalid request:', error.data?.errors?.[0]?.message || error.message);
        return;
      }
    }
    console.error('💥 Unexpected error:', error.message);
    throw error;
  }
}

go().catch(console.error);
