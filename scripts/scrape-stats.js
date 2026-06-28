#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const cheerio = require('cheerio');

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_TOKEN;
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/production`;

function parseFloatSafe(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function parseIntSafe(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

async function go() {
  console.log('Fetching Basketball-Reference...');
  const {data} = await axios.get('https://www.basketball-reference.com/players/p/paulch01.html', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(data);

  const rows = $('#per_game_stats > tbody > tr');
  console.log(`Found ${rows.length} rows`);

  const mutations = [];
  const career = { gp: 0, pts: 0, ast: 0, trb: 0, stl: 0, blk: 0, fg_pct_sum: 0, fg3_pct_sum: 0, ft_pct_sum: 0, mp_sum: 0, tov: 0, pf: 0, fg: 0, fga: 0, fg3: 0, fg3a: 0, ft: 0, fta: 0, orb: 0, drb: 0, seasonCount: 0 };

  rows.each((i, row) => {
    const season = $(row).find('th').text().trim();
    if (!season) return;

    const d = {};
    $(row).find('td').each((j, td) => {
      const stat = $(td).attr('data-stat');
      if (stat) d[stat] = $(td).text().trim();
    });

    const gp = parseIntSafe(d.games);
    const pts = parseFloatSafe(d.pts_per_g);
    const ast = parseFloatSafe(d.ast_per_g);
    const trb = parseFloatSafe(d.trb_per_g);
    const stl = parseFloatSafe(d.stl_per_g);
    const blk = parseFloatSafe(d.blk_per_g);
    const fg_pct = d.fg_pct ? parseFloatSafe(d.fg_pct) : 0;
    const fg3_pct = d.fg3_pct ? parseFloatSafe(d.fg3_pct) : 0;
    const ft_pct = d.ft_pct ? parseFloatSafe(d.ft_pct) : 0;
    const mp = parseFloatSafe(d.mp_per_g);
    const tov = parseFloatSafe(d.tov_per_g);
    const pf = parseFloatSafe(d.pf_per_g);
    const orb = parseFloatSafe(d.orb_per_g);
    const drb = parseFloatSafe(d.drb_per_g);

    career.gp += gp;
    career.pts += pts * gp;
    career.ast += ast * gp;
    career.trb += trb * gp;
    career.stl += stl * gp;
    career.blk += blk * gp;
    career.fg_pct_sum += fg_pct * gp;
    career.fg3_pct_sum += fg3_pct * gp;
    career.ft_pct_sum += ft_pct * gp;
    career.mp_sum += mp * gp;
    career.tov += tov * gp;
    career.pf += pf * gp;
    career.fg += (parseFloatSafe(d.fg_per_g) * gp);
    career.fga += (parseFloatSafe(d.fga_per_g) * gp);
    career.fg3 += (parseFloatSafe(d.fg3_per_g) * gp);
    career.fg3a += (parseFloatSafe(d.fg3a_per_g) * gp);
    career.ft += (parseFloatSafe(d.ft_per_g) * gp);
    career.fta += (parseFloatSafe(d.fta_per_g) * gp);
    career.orb += orb * gp;
    career.drb += drb * gp;
    career.seasonCount++;

    const seasonId = `season-${season}`;

    mutations.push({
      createOrReplace: {
        _id: seasonId,
        _type: 'statLine',
        season,
        team: d.team_name_abbr || '',
        gp,
        pts,
        ast,
        reb: trb,
        stl,
        blk,
        fg_pct: parseFloat((fg_pct * 100).toFixed(1)),
        fg3_pct: parseFloat((fg3_pct * 100).toFixed(1)),
        ft_pct: parseFloat((ft_pct * 100).toFixed(1)),
        mp,
        tov,
        pf,
        orb,
        drb,
        fg: parseFloatSafe(d.fg_per_g),
        fga: parseFloatSafe(d.fga_per_g),
        fg3: parseFloatSafe(d.fg3_per_g),
        fg3a: parseFloatSafe(d.fg3a_per_g),
        ft: parseFloatSafe(d.ft_per_g),
        fta: parseFloatSafe(d.fta_per_g),
        efg_pct: d.efg_pct ? parseFloat((parseFloatSafe(d.efg_pct) * 100).toFixed(1)) : 0
      }
    });
  });

  if (career.gp > 0) {
    const careerPts = parseFloat((career.pts / career.gp).toFixed(1));
    const careerAst = parseFloat((career.ast / career.gp).toFixed(1));
    const careerTrb = parseFloat((career.trb / career.gp).toFixed(1));
    const careerStl = parseFloat((career.stl / career.gp).toFixed(1));
    const careerBlk = parseFloat((career.blk / career.gp).toFixed(1));
    const careerMp = parseFloat((career.mp_sum / career.gp).toFixed(1));
    const careerTov = parseFloat((career.tov / career.gp).toFixed(1));
    const careerPf = parseFloat((career.pf / career.gp).toFixed(1));
    const careerFgPct = parseFloat((career.fg / career.fga * 100).toFixed(1));
    const careerFg3Pct = parseFloat((career.fg3 / career.fg3a * 100).toFixed(1));
    const careerFtPct = parseFloat((career.ft / career.fta * 100).toFixed(1));
    const careerOrb = parseFloat((career.orb / career.gp).toFixed(1));
    const careerDrb = parseFloat((career.drb / career.gp).toFixed(1));

    mutations.push({
      createOrReplace: {
        _id: 'career-totals',
        _type: 'statLine',
        season: 'Career',
        team: '',
        gp: career.gp,
        pts: careerPts,
        ast: careerAst,
        reb: careerTrb,
        stl: careerStl,
        blk: careerBlk,
        fg_pct: careerFgPct,
        fg3_pct: careerFg3Pct,
        ft_pct: careerFtPct,
        mp: careerMp,
        tov: careerTov,
        pf: careerPf,
        orb: careerOrb,
        drb: careerDrb,
        fg: parseFloat((career.fg / career.gp).toFixed(1)),
        fga: parseFloat((career.fga / career.gp).toFixed(1)),
        fg3: parseFloat((career.fg3 / career.gp).toFixed(1)),
        fg3a: parseFloat((career.fg3a / career.gp).toFixed(1)),
        ft: parseFloat((career.ft / career.gp).toFixed(1)),
        fta: parseFloat((career.fta / career.gp).toFixed(1)),
        efg_pct: parseFloat((((career.fg + 0.5 * career.fg3) / career.fga) * 100).toFixed(1))
      }
    });
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
