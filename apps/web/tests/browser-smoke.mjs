import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const origin = process.env.MOCK_BASE_URL || 'http://127.0.0.1:18089';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const failures = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', error => failures.push(`Vue runtime exception: ${error.message}`));
page.on('console', msg => {
  if (msg.type() === 'error') failures.push(`Console: ${msg.text()}`);
});
page.on('response', response => {
  const url = response.url();
  if (url.includes('/icpc/assets/') && response.status() >= 400) {
    failures.push(`Static resource error: ${response.status()} ${url}`);
  }
});

try {
  await page.goto(origin + '/icpc/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('.site-shell').waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await page.locator('body').innerText(), /Uma igreja para/);
  await page.locator('select[aria-label*="Idioma"]').selectOption('en');
  await page.getByRole('button', { name: 'The Church' }).first().click();
  await page.getByRole('heading', { name: 'Doctrine', exact: true }).waitFor();
  assert.match(await page.locator('body').innerText(), /November 2020/);
  await page.locator('select[aria-label*="Idioma"]').selectOption('es');
  await page.getByRole('heading', { name: 'Doctrina', exact: true }).waitFor();
  await page.locator('select[aria-label*="Idioma"]').selectOption('pt-PT');
  await page.getByRole('heading', { name: 'Doutrina', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('select[aria-label*="Idioma"]').isVisible(), true);
  console.log('OK: Vue rendered, switch pt-PT/en/es, doctrine/history visible and mobile selector visible');
  if (failures.length) throw Error(failures.join('\n'));
} catch (error) {
  console.error('BROWSER SMOKE FAILURE', error.message);
  console.error('URL:', page.url());
  console.error('Errors:', failures.join('\n') || 'none captured');
  await page.screenshot({ path: '/tmp/icpc-browser-error.png', fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
