/**
 * Bundle size 守門：確保打包後的 JS 不會無聲膨脹，維持「輕量、易用」。
 * 對 dist/ 內所有 .js 計算 gzip 後總和與最大單檔，超過上限即失敗。
 */
import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '../dist');

// 上限（gzip bytes）。Mermaid/KaTeX 是按需載入，但仍會打進 extension package。
const MAX_TOTAL = 1100 * 1024;
const MAX_SINGLE = 250 * 1024;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}

let total = 0;
let maxSingle = 0;
let maxFile = '';
for (const file of walk(dist)) {
  const gz = gzipSync(readFileSync(file)).length;
  total += gz;
  if (gz > maxSingle) {
    maxSingle = gz;
    maxFile = file;
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
console.log(`gzip 總和：${kb(total)}（上限 ${kb(MAX_TOTAL)}）`);
console.log(`最大單檔：${kb(maxSingle)} ${maxFile}（上限 ${kb(MAX_SINGLE)}）`);

if (total > MAX_TOTAL || maxSingle > MAX_SINGLE) {
  console.error('❌ Bundle 超過大小上限');
  process.exit(1);
}
console.log('✅ Bundle 大小通過');
