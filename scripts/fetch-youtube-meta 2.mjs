/**
 * Fetches YouTube oEmbed title per video ID (no API key).
 */
async function oembedTitle(id) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  const r = await fetch(url);
  if (!r.ok) return { id, error: `${r.status}` };
  const j = await r.json();
  return { id, title: j.title, author: j.author_name };
}

const ids = process.argv.slice(2);
const results = [];
for (const id of ids) {
  try {
    results.push(await oembedTitle(id));
  } catch (e) {
    results.push({ id, error: String(e.message) });
  }
  await new Promise((r) => setTimeout(r, 120));
}
console.log(JSON.stringify(results, null, 2));
