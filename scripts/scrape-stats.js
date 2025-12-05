#!/usr/bin/env node
/* Scrape Chris Paul career totals and upsert a single "statLine" doc */
const axios = require('axios');
const cheerio = require('cheerio');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const WEBHOOK = process.env.VERCEL_WEBHOOK;

const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

async function go() {
  const {data} = await axios.get('https://www.basketball-reference.com/players/p/paulch01.html');
  const $ = cheerio.load(data);

  // grab the small summary table (above the big season table)
  const row = $('table.stats tbody tr').last();   // last row == Career
  const gp  = parseInt(row.find('td[data-stat="g"]').text(), 10);
  const pts = parseFloat(row.find('td[data-stat="pts"]').text(), 10);
  const ast = parseFloat(row.find('td[data-stat="ast"]').text(), 10);
  const reb = parseFloat(row.find('td[data-stat="trb"]').text(), 10);
  const stl = parseFloat(row.find('td[data-stat="stl"]').text(), 10);

  
const mutations = [
  {
    patch: {
      id: 'career-totals',
      set: {
        season: 'Career',
        gp, pts, ast, reb, stl,
        updated: new Date().toISOString()
      },
      insert: {
        ifNotExists: { _id: 'career-totals', _type: 'statLine' }
      }
    }
  }
];

  await axios.post(SANITY_URL, {mutations}, {
    headers: {Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json'}
  });

  // trigger ISR
  await axios.post(`${WEBHOOK}?secret=${process.env.REVALIDATE_SECRET}&tag=stats`);
  console.log('Stats updated & revalidated');
}

go().catch(console.error);