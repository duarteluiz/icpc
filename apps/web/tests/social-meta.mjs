import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
function findMeta(kind, name) {
  const matcher = new RegExp('<meta\\s+' + kind + '="' + name.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&') + '"\\s+content="([^"]+)"', 'i');
  const match = html.match(matcher);
  assert.ok(match, 'Missing static sharing metadata: ' + name);
  return match[1];
}
assert.match(html, /<title>ICPC \| Igreja Cristã Presbiteriana da Covilhã/);
assert.match(findMeta('property','og:title'), /ICPC/);
assert.match(findMeta('property','og:description'), /Covilhã/);
assert.equal(findMeta('property','og:type'), 'website');
assert.equal(findMeta('property','og:url'), 'https://www.luizduarte.pt/icpc/');
const image = findMeta('property','og:image');
assert.equal(image, 'https://www.presbiterianos-covilha.pt/assets/logo_grande.png');
assert.equal(findMeta('property','og:image:type'), 'image/png');
assert.equal(findMeta('property','og:image:width'), '1000');
assert.equal(findMeta('property','og:image:height'), '562');
assert.equal(findMeta('name','twitter:card'), 'summary_large_image');
assert.ok(!image.startsWith('/'), 'WhatsApp needs an absolute image URL');
console.log('OK: static Open Graph and WhatsApp preview metadata verified in built HTML');
