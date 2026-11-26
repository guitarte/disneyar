// Appends the current Queue-Times feed to a rolling wait history.
// Usage: node scripts/history.mjs <feed.json> <previous-history.json> <out.json>
// The previous history comes from the live site, so nothing is committed to the repository.
import fs from 'node:fs';

const [, , feedPath, prevPath, outPath] = process.argv;
const KEEP = 96; // 48 hours at one sample every 30 minutes
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]/g, '');
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

const feed = readJson(feedPath);
const prev = readJson(prevPath);
const samples = Array.isArray(prev?.samples) ? prev.samples.filter((s) => s && s.t && s.w) : [];

if (feed) {
  const rides = [...(feed.lands ?? []).flatMap((l) => l.rides ?? []), ...(feed.rides ?? [])];
  const stamps = rides.map((r) => Date.parse(r.last_updated)).filter(Number.isFinite);
  if (rides.length && stamps.length) {
    const t = new Date(Math.max(...stamps)).toISOString();
    if (!samples.some((s) => s.t === t)) {
      // -1 marks a closed ride, so the chart can leave a gap
      samples.push({ t, w: Object.fromEntries(rides.map((r) => [norm(r.name), r.is_open ? Math.round(r.wait_time) : -1])) });
    }
  }
}

samples.sort((a, b) => a.t.localeCompare(b.t));
fs.writeFileSync(outPath, JSON.stringify({ samples: samples.slice(-KEEP) }));
console.log(`history: ${Math.min(samples.length, KEEP)} samples`);
