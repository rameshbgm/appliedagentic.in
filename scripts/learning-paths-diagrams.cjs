// Accessible, original technical figures; SVG source is versioned with the lessons.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { root, loadCurriculum, allArticles } = require('./learning-paths-plan.cjs');
const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

function wrap(text, width = 37) {
  const lines = []; let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > width && line) { lines.push(line); line = ''; }
    line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}
function textLines(text, x, y, size, color, width, weight = 400) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="Arial, sans-serif">${wrap(text, width).map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.3 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>`;
}
function renderDiagram(article) {
  const palette = { 'agentic-ai-engineering': '#53d8ed', 'ai-evals': '#b3a0ff', 'agent-harness-engineering': '#f2bd69' };
  const accent = palette[article.track.slug];
  const n = article.diagram.nodes.length;
  const coords = Array.from({ length: n }, (_, i) => [100 + i * (1000 / (n - 1)), 515 + (i % 2 ? -80 : 0)]);
  const edges = article.diagram.edges.map(([from, to]) => {
    const [x1, y1] = coords[from]; const [x2, y2] = coords[to];
    const sign = x2 >= x1 ? 1 : -1;
    return `<path d="M ${x1 + 80 * sign} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2 - 87 * sign} ${y2}" fill="none" stroke="${accent}" stroke-width="3" marker-end="url(#arrow)" opacity="0.85"/>`;
  }).join('');
  const nodes = article.diagram.nodes.map((label, i) => {
    const [x, y] = coords[i];
    return `<rect x="${x - 80}" y="${y - 48}" width="160" height="96" rx="16" fill="#15263d" stroke="${accent}" stroke-width="2"/><circle cx="${x}" cy="${y - 48}" r="15" fill="${accent}"/>${textLines(String(i + 1), x - 5, y - 43, 15, '#09111e', 2, 700)}${textLines(label, x - 68, y - 10, 17, '#f2f5fa', 16, 600)}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="title description"><title id="title">${escapeXml(article.title)}</title><desc id="description">${escapeXml(article.coverAlt + ' ' + article.diagram.caption)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${accent}"/></marker></defs><rect width="1200" height="800" fill="#09111e"/><path d="M 60 110 H 1140" stroke="#29405a"/>${textLines(article.track.title.toUpperCase(), 60, 75, 20, accent, 80, 700)}${textLines(article.title, 60, 183, 39, '#f2f5fa', 49, 700)}${textLines(article.module.title, 60, 325, 20, '#a1b3cb', 90)}${edges}${nodes}${textLines(article.diagram.caption, 60, 665, 21, '#c6d2e3', 91)}${textLines('APPLIED AGENTIC  /  PRACTICAL LEARNING', 60, 765, 15, '#8ca2bf', 90)}</svg>\n`;
}
async function generateDiagrams(tracks) {
  const directory = path.join(root, 'logs/learning-paths/covers');
  fs.mkdirSync(directory, { recursive: true });
  for (const article of allArticles(tracks)) {
    const svg = renderDiagram(article);
    const source = path.join(root, 'content/learning-paths', article.track.slug, article.file.replace(/\.md$/, '.svg'));
    fs.writeFileSync(source, svg);
    await sharp(Buffer.from(svg)).png().toFile(path.join(directory, `${article.slug}.png`));
  }
}
module.exports = { escapeXml, renderDiagram, generateDiagrams };
if (require.main === module) generateDiagrams(loadCurriculum()).then(() => console.log('Rendered 72 original SVG diagrams and PNG covers.')).catch(e => { console.error(e.message); process.exitCode = 1; });
