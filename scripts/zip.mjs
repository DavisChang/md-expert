/**
 * 把 dist/ 打包成可上傳 Chrome Web Store 的 zip。
 * 使用系統 zip 指令，避免額外相依。輸出檔名含版本號。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

if (!existsSync(dist)) {
  console.error('找不到 dist/，請先執行 pnpm build');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const out = resolve(root, `markdown-expert-v${pkg.version}.zip`);
if (existsSync(out)) rmSync(out);

execFileSync('zip', ['-r', '-q', out, '.'], { cwd: dist, stdio: 'inherit' });
console.log(`已建立 ${out}`);
