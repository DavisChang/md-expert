/**
 * 測試用靜態檔案伺服器。
 * 重點：.md 以 text/plain 提供，重現瀏覽器直接開啟原始 Markdown 的情境。
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');
const PORT = Number(process.env.PORT ?? 5180);

const TYPES = {
  '.md': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const rel = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const file = join(publicDir, rel === '/' ? 'blog.html' : rel);
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, () => console.log(`e2e server on http://localhost:${PORT}`));
