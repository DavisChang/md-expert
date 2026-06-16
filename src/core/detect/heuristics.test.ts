import { describe, expect, it } from 'vitest';
import { looksLikeMarkdown, scoreMarkdown } from './heuristics';

describe('scoreMarkdown', () => {
  it('給典型 markdown 高信心', () => {
    const md = `# 標題

這是一段文字，含 **粗體** 與 [連結](https://example.com)。

- 項目一
- 項目二

\`\`\`js
const x = 1;
\`\`\`
`;
    expect(scoreMarkdown(md).confidence).toBeGreaterThan(0.6);
    expect(looksLikeMarkdown(md)).toBe(true);
  });

  it('給純文字低信心', () => {
    const text = '這只是一段普通的文字，沒有任何標記。再加一句話讓它長一點。';
    expect(scoreMarkdown(text).confidence).toBeLessThan(0.5);
    expect(looksLikeMarkdown(text)).toBe(false);
  });

  it('對 HTML 文件回傳 0 信心', () => {
    const html = '<!doctype html><html><body><h1>Hi</h1></body></html>';
    expect(scoreMarkdown(html).confidence).toBe(0);
  });

  it('對過短內容回傳 0', () => {
    expect(scoreMarkdown('# ').confidence).toBe(0);
    expect(scoreMarkdown('').confidence).toBe(0);
  });

  it('表格與任務清單也算訊號', () => {
    const md = `| a | b |
| - | - |
| 1 | 2 |

- [x] 完成
- [ ] 待辦`;
    expect(scoreMarkdown(md).signals).toBeGreaterThanOrEqual(2);
  });
});
