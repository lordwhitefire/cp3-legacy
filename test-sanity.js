#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

console.log('🔍 Loaded tokens:');
console.log('PROJECT_ID:', PROJECT_ID ? '✅ OK' : '❌ MISSING');
console.log('TOKEN:', TOKEN ? '✅ OK (hidden)' : '❌ MISSING');

// Generate realistic dummy Twitter data about Chris Paul
function generateDummyTweet(index) {
  const tweets = [
    "Chris Paul's veteran leadership would be perfect for any contending team looking for a floor general.",
    "The way CP3 controls the game tempo is still elite. Teams are sleeping on his impact.",
    "Chris Paul mentoring young guards could be his most valuable contribution at this stage of his career.",
    "CP3's basketball IQ is off the charts. You can't teach that kind of court vision.",
    "Despite injuries, Chris Paul still had a 3.6:1 assist-to-turnover ratio last season. Incredible.",
    "Any team that signs Chris Paul automatically gets better locker room culture and professionalism.",
    "Chris Paul to the Lakers? The fit makes too much sense for both sides.",
    "CP3's mid-range game is timeless. Defenses still can't stop that pull-up jumper.",
    "The leadership void Chris Paul would fill on a young team is worth every penny.",
    "Chris Paul's contract situation might be complicated, but his value to a contender is undeniable."
  ];
  
  const authors = ["@NBAInsider", "@BballAnalyst", "@CP3Fan", "@HoopsTalk", "@GMThoughts"];
  const baseTime = Date.now() - (index * 3600000); // 1 hour between each
  
  return {
    id: `tweet_${String(index + 1).padStart(3, '0')}`, // tweet_001, tweet_002, etc.
    text: tweets[index] || tweets[0],
    likes: Math.floor(Math.random() * 100) + 10,
    url: `https://twitter.com/${authors[index % authors.length]}/status/18${9000000000 + index}56789`,
    created: new Date(baseTime).toISOString(),
    author: authors[index % authors.length]
  };
}

async function uploadTenDocuments() {
  try {
    console.log('🧪 Generating 10 static Twitter documents...');
    
    // Create mutations for 10 documents with static IDs
    const mutations = Array.from({ length: 10 }, (_, index) => {
      const tweet = generateDummyTweet(index);
      
      return {
        createOrReplace: {
          _id: tweet.id,
          _type: 'reaction',
          source: 'twitter',
          text: tweet.text,
          likes: tweet.likes,
          url: tweet.url,
          created: tweet.created,
          approved: true
        }
      };
    });
    
    console.log('📤 Uploading/Updating 10 documents to Sanity...');
    console.log('Document IDs:');
    mutations.forEach((mutation, i) => {
      console.log(`  ${i + 1}. ${mutation.createOrReplace._id}`);
    });
    
    const res = await axios.post(SANITY_URL, { mutations }, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ SUCCESS! 10 documents uploaded/updated:');
    console.log('Status:', res.status);
    console.log('Transaction ID:', res.data.transactionId);
    console.log('Results:', res.data.results.map(r => r.id).join(', '));
    
    console.log('\n🎉 These same 10 documents will be updated each time you run this script.');
    console.log('Next: Replace dummy data with real Twitter API data!');
    
    return true;
    
  } catch (error) {
    console.log('❌ Sanity upload FAILED:');
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

uploadTenDocuments().catch(console.error);