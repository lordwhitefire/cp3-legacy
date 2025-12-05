#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });  // ✅ Load from .env.local
const axios = require('axios');
const { TwitterApi, ApiResponseError } = require('twitter-api-v2');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

// Twitter client
const twitter = new TwitterApi(process.env.TWITTER_BEARER);

console.log('🔍 Loaded tokens:');
console.log('PROJECT_ID:', PROJECT_ID ? '✅ OK' : '❌ MISSING');
console.log('TOKEN:', TOKEN ? '✅ OK (hidden)' : '❌ MISSING');
console.log('TWITTER_BEARER:', process.env.TWITTER_BEARER ? '✅ OK (hidden)' : '❌ MISSING');

async function testSanityUpload() {
  try {
    console.log('🧪 Testing Sanity upload...');
    
    const testMutations = [{
      create: {
        _type: 'reaction',
        source: 'test',
        text: 'Token test',
        likes: 0,
        url: 'https://test.com',
        created: new Date().toISOString(),
        approved: false
      }
    }];
    
    const res = await axios.post(SANITY_URL, {mutations: testMutations}, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ WRITE access OK!');
    return true;
    
  } catch (error) {
    console.log('❌ WRITE access FAILED:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 TOKEN ISSUE: Regenerate token with Editor/Administrator role');
    } else if (error.response?.status === 400) {
      console.log('\n📋 SCHEMA ISSUE: Check field names match exactly');
    }
    
    return false;
  }
}

async function go() {
  const writeOK = await testSanityUpload();
  
  if (!writeOK) {
    console.log('❌ Stopping - Sanity write test failed');
    return;
  }
  
  try {
    // ✅ Twitter search
    console.log('\n🔍 Searching Twitter for "chris paul -is:retweet lang:en"...');
    const res = await twitter.v2.search('chris paul -is:retweet lang:en', { 
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,author_id'
    });
    
    const tweets = res.data?.data || [];
    console.log(`\n✅ Found ${tweets.length} tweets`);
    
    // Take only the latest 10 tweets
    const latestTweets = tweets.slice(0, 10);
    
    console.log('\n📊 Latest 10 tweets to be uploaded:');
    latestTweets.forEach((t, i) => {
      const date = new Date(t.created_at).toLocaleString();
      console.log(`${i+1}. [${date}] ${t.text.substring(0, 80)}${t.text.length > 80 ? '...' : ''}`);
      console.log(`   Likes: ${t.public_metrics?.like_count || 0} | ID: ${t.id}\n`);
    });
    
    // ✅ Upload to Sanity - UPDATING 10 STATIC DOCUMENTS
    console.log('\n📤 Uploading/Updating 10 static documents in Sanity...');
    
    // Create mutations for 10 static documents (tweet_001 to tweet_010)
    const mutations = latestTweets.map((t, index) => {
      const staticId = `tweet_${String(index + 1).padStart(3, '0')}`; // tweet_001, tweet_002, etc.
      
      return {
        createOrReplace: {
          _id: staticId,  // ✅ Always the same 10 IDs
          _type: 'reaction',
          source: 'twitter',
          text: t.text.substring(0, 280),
          likes: t.public_metrics?.like_count || 0,
          url: `https://twitter.com/i/status/${t.id}`,
          created: new Date(t.created_at).toISOString(),
          approved: true  // ✅ Changed to true for automatic approval
        }
      };
    });
    
    // If we have less than 10 tweets, fill with empty/dummy data for remaining slots
    for (let i = latestTweets.length; i < 10; i++) {
      const staticId = `tweet_${String(i + 1).padStart(3, '0')}`;
      const dummyDate = new Date(Date.now() - (i * 3600000)).toISOString();
      
      mutations.push({
        createOrReplace: {
          _id: staticId,
          _type: 'reaction',
          source: 'twitter',
          text: 'No recent tweet available',
          likes: 0,
          url: 'https://twitter.com',
          created: dummyDate,
          approved: false
        }
      });
    }
    
    // Display which documents will be updated
    console.log('\n📝 Document IDs being updated:');
    mutations.forEach((mutation, i) => {
      console.log(`  ${i + 1}. ${mutation.createOrReplace._id}`);
    });
    
    // Upload to Sanity
    const sanityRes = await axios.post(SANITY_URL, { mutations }, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n✅ SUCCESS! Updated ${mutations.length} documents in Sanity`);
    console.log('Transaction ID:', sanityRes.data.transactionId);
    console.log('\n🎉 The same 10 documents (tweet_001 to tweet_010) have been updated with fresh tweets!');
    console.log('Next run will replace these same documents with new tweets.');
    
  } catch (error) {
    if (error instanceof ApiResponseError && error.code === 429) {
      console.log('🚫 Twitter rate limit - wait 15 minutes');
    } else {
      console.error('💥 Error:', error.message);
      console.error('Full error:', error);
    }
  }
}

go().catch(console.error);