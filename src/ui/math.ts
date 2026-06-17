let katex: typeof import('katex') | null = null;

export async function renderMath(container: ParentNode): Promise<void> {
  const blocks = [...container.querySelectorAll<HTMLElement>('.mdx-math:not([data-rendered])')];
  if (blocks.length === 0) return;

  katex ??= await import('katex');
  for (const block of blocks) {
    block.dataset.rendered = 'true';
    katex.render(block.textContent ?? '', block, {
      displayMode: block.dataset.display === 'true',
      output: 'html',
      throwOnError: false,
      trust: false,
    });
  }
}
