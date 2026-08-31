import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

mkdirSync('/workspace/site/public/images/fragrantica-shots', { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const frag = [
  ['fleur-narcotique', 'https://www.fragrantica.com/perfume/Ex-Nihilo/Fleur-Narcotique-27571.html'],
  ['la-panthere', 'https://www.fragrantica.com/perfume/Cartier/La-Panthere-23295.html'],
  ['alien', 'https://www.fragrantica.com/perfume/Mugler/Alien-1013.html'],
  ['chance-eau-tendre', 'https://www.fragrantica.com/perfume/Chanel/Chance-Eau-Tendre-8069.html'],
  ['paradoxe', 'https://www.fragrantica.com/perfume/Prada/Paradoxe-74780.html'],
];

for (const [id, url] of frag) {
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    const title = await page.title();
    console.log(id, 'status', res?.status(), 'title', title.slice(0, 70));
    if (/just a moment|attention required|cloudflare|Access denied/i.test(title)) {
      console.log(id, 'CF blocked');
      continue;
    }
    const out = `/workspace/site/public/images/fragrantica-shots/${id}.png`;
    // full upper content
    await page.screenshot({ path: out, clip: { x: 40, y: 80, width: 1100, height: 620 } });
    console.log('saved', out);
  } catch (e) {
    console.log(id, 'ERR', e.message);
  }
}

const all = [
  'fleur-narcotique','aventus-for-her','alien','secrete-euphorie','la-panthere',
  'pure-musc','for-her-edp','gorgeous-gardenia','gorgeous-magnolia','chance-eau-tendre',
  'chance-eau-fraiche','idole','paradoxe','libre-berry-crush','signature','rosendo-5','pure-poison'
];
for (const id of all) {
  try {
    await page.goto(`http://127.0.0.1:43127/${id}.html`, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(400);
    const el = await page.$('.frag-panel');
    if (el) {
      await el.screenshot({ path: `/workspace/site/public/images/fragrantica-shots/panel-${id}.png` });
      console.log('panel ok', id);
    }
  } catch (e) {
    console.log('panel fail', id, e.message);
  }
}
await browser.close();
