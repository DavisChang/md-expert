let configured = false;
let seq = 0;
let mermaid: typeof import('mermaid').default | null = null;

export async function renderMermaid(container: ParentNode): Promise<void> {
  const blocks = [...container.querySelectorAll<HTMLElement>('pre.mdx-mermaid:not([data-rendered])')];
  if (blocks.length === 0) return;

  mermaid ??= (await import('mermaid')).default;
  if (!configured) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
    configured = true;
  }

  for (const block of blocks) {
    block.dataset.rendered = 'true';
    try {
      const { svg, bindFunctions } = await mermaid.render(`mdx-mermaid-${seq++}`, block.textContent ?? '');
      const rendered = document.createElement('div');
      rendered.className = 'mdx-mermaid';
      rendered.innerHTML = svg;
      block.replaceWith(rendered);
      bindFunctions?.(rendered);
    } catch {
      block.classList.add('mdx-mermaid-error');
    }
  }
}
