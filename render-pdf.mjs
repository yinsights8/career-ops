import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

function parseArg(key) {
  const a = args.find(x => x.startsWith(`${key}=`));
  if (!a) return null;
  return a.split('=').slice(1).join('=');
}

const htmlFile = args.find(a => !a.startsWith('--'));
const outputPdf = args.find(a => a.startsWith('--out='))?.split('=')[1] || resolve(__dirname, 'output', '034-ey-2026-06-11.pdf');
 const copyToPath = parseArg('--copy-to');
 const copyFilename = parseArg('--copy-filename');

if (!htmlFile) {
  console.error('Usage: node render-pdf.mjs <input.html> [--out=<output.pdf>] [--copy-to=<dir>] [--copy-filename=<path>]');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1800 } });
  await page.goto(`file:${resolve(htmlFile)}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputPdf,
    printBackground: true,
    format: 'A4',
    margin: { top: '14mm', right: '16mm', bottom: '14mm', left: '16mm' }
  });
  await browser.close();

  if (copyFilename) {
    await import('fs').then(({ copyFileSync, mkdirSync }) => {
      mkdirSync(dirname(copyFilename), { recursive: true });
      copyFileSync(outputPdf, copyFilename);
    });
    console.log(`PDF written to ${outputPdf}`);
    console.log(`PDF copied to ${copyFilename}`);
  } else if (copyToPath) {
    await import('fs').then(({ copyFileSync, mkdirSync, basename }) => {
      mkdirSync(copyToPath, { recursive: true });
      copyFileSync(outputPdf, `${copyToPath}/${basename(outputPdf)}`);
    });
    console.log(`PDF written to ${outputPdf}`);
    console.log(`PDF copied to ${copyToPath}`);
  } else {
    console.log(`PDF written to ${outputPdf}`);
  }
})();
