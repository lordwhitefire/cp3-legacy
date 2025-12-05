#!/usr/bin/env node
/* Dry run: show exactly what we would send to Sanity */
const axios = require('axios');
const cheerio = require('cheerio');

async function dry() {
  const { data } = await axios.get('https://www.basketball-reference.com/players/p/paulch01.html');
  const $ = cheerio.load(data);

  // same selectors as the real script
  const row = $('table.stats tbody tr').last();
  const raw = {
    gp:  row.find('td[data-stat="g"]').text().trim(),
    pts: row.find('td[data-stat="pts"]').text().trim(),
    ast: row.find('td[data-stat="ast"]').text().trim(),
    reb: row.find('td[data-stat="trb"]').text().trim(),
    stl: row.find('td[data-stat="stl"]').text().trim(),
  };

  const parsed = {
    gp:  parseInt(raw.gp, 10),
    pts: parseFloat(raw.pts, 10),
    ast: parseFloat(raw.ast, 10),
    reb: parseFloat(raw.reb, 10),
    stl: parseFloat(raw.stl, 10),
  };

  console.table(raw);   // what Cheerio found
  console.table(parsed); // what Sanity would receive
}

dry().catch(console.error);