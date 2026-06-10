import { chromium } from 'playwright';

const url = 'https://www.hirecrap.com/job-description-ina/15820_4423877004?src=LinkedIn';
const out = process.argv[2] || 'tmp/jd.txt';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const requests = [];
page.on('request', r => requests.push(r.url()));

try {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('STATUS:', resp?.status(), 'URL:', page.url());

  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const text = await page.evaluate(() => document.body.innerText);
  const title = await page.title();
  const html = await page.content();

  await import('node:fs').then(fs => fs.writeFileSync(out, `TITLE: ${title}\nURL: ${page.url()}\n\n===TEXT===\n${text}\n\n===HTML SNIPPET===\n${html.slice(0, 5000)}`));

  console.log('---TEXT START---');
  console.log(text);
  console.log('---TEXT END---');
  console.log('\n---XHR/FETCH CALLS---');
  requests.filter(r => r.includes('/api/') || r.includes('json')).forEach(r => console.log(r));
} catch (e) {
  console.error('ERR:', e.message);
} finally {
  await browser.close();
}
