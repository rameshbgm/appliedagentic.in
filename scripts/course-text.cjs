// Keep original source files intact; normalise punctuation in imported output.
function normalizeText(value) {
  return value.replace(/[ \t]*\u2014[ \t]*/g, ' - ');
}
function normalizeObject(value) {
  if (typeof value === 'string') return normalizeText(value);
  if (Array.isArray(value)) return value.map(normalizeObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeObject(v)]));
  return value;
}
function prepareNarration(markdown) {
  // Fenced ASCII diagrams are lesson content, not executable code examples.
  // Expose their labels/checklists as ordinary Markdown so the narrator keeps them.
  return markdown.replace(/```[ \t]*\n([\s\S]*?)\n```/g, (block, body) => {
    if (!/[├└│─→]/u.test(body)) return block;
    return body.split('\n').map(line => line
      .replace(/^[ \t│]*[├└]─+[ \t]*/u, '- ')
      .replace(/^STAGE\s+(\d+):[ \t]*/i, '## Stage $1: ')
      .replace(/[ \t]*→[ \t]*/g, '; then ')).join('\n');
  });
}
module.exports = { normalizeText, normalizeObject, prepareNarration };
