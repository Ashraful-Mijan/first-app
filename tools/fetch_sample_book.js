/* One-off helper: fetches Project Gutenberg's plain-text "Alice's Adventures
 * in Wonderland" (#11) and extracts Chapter I into assets/books/alice_ch1.md.
 * Public domain (1865, Lewis Carroll).
 *
 * Usage: node tools/fetch_sample_book.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.gutenberg.org/files/11/11-0.txt';
const OUT = path.join(__dirname, '..', 'assets', 'books', 'alice_ch1.md');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'book-reader/1.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

(async () => {
  const text = await get(URL);
  const startMarker = 'Alice was beginning to get very tired';
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error('Could not locate Chapter I start marker');
  const end = text.indexOf('CHAPTER II.', start);
  if (end < 0) throw new Error('Could not locate Chapter I end marker');
  let chapter = text.slice(start, end).trim();

  // Normalize: collapse single newlines within a paragraph into spaces so
  // the markdown parser can re-wrap based on blank-line paragraph breaks.
  const paragraphs = chapter
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => {
      if (!p) return false;
      // Drop Gutenberg decorative "* * *" rules / chapter heading repeats.
      if (/^[*.\s-]+$/.test(p) && p.replace(/[*\s]/g, '').length === 0) return false;
      if (/^CHAPTER\s+[IVXLCDM]+\b/.test(p)) return false;
      return true;
    });

  let md = '';
  md += '# Alice\'s Adventures in Wonderland\n\n';
  md += '## Chapter I — Down the Rabbit-Hole\n\n';
  md += paragraphs.map((p) => p.replace(/\*/g, () => '')).join('\n\n') + '\n';

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md, 'utf8');
  console.log('Wrote', OUT, 'paragraphs:', paragraphs.length, 'bytes:', md.length);
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
