import { render } from 'preact';
import { h } from 'preact';
import type { ComponentChild } from 'preact';
import tokensCss from '@/ui/theme/tokens.css?inline';
import readerCss from '@/ui/theme/reader.css?inline';
import markdownCss from '@/ui/theme/markdown.css?inline';

const HOST_ID = 'markdown-expert-root';

interface MountHandle {
  /** 在 Shadow DOM 內重新渲染指定的 Preact 節點。 */
  update: (node: ComponentChild) => void;
  /** 卸載並移除宿主元素。 */
  destroy: () => void;
  /** Shadow host 元素（供設定 data-theme）。 */
  host: HTMLElement;
}

/**
 * 建立一個與宿主頁面雙向隔離的 Shadow DOM 掛載點，並把 reader 樣式注入其中。
 * 重複呼叫會重用既有 host。
 */
export function mountShadow(): MountHandle {
  let host = document.getElementById(HOST_ID) as HTMLElement | null;
  let shadow: ShadowRoot;
  let container: HTMLElement;

  if (host && host.shadowRoot) {
    shadow = host.shadowRoot;
    container = shadow.querySelector('.mdx-mount') as HTMLElement;
  } else {
    host = document.createElement('div');
    host.id = HOST_ID;
    // 不佔版面、不影響宿主排版。
    host.style.cssText = 'all: initial;';
    shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    // tokens（色票）→ markdown（共用內文）→ reader（外框），與側欄載入順序一致。
    style.textContent = `${tokensCss}\n${markdownCss}\n${readerCss}`;
    shadow.appendChild(style);

    container = document.createElement('div');
    container.className = 'mdx-mount';
    shadow.appendChild(container);

    document.documentElement.appendChild(host);
  }

  return {
    host: host!,
    update(node: ComponentChild) {
      render(node, container);
    },
    destroy() {
      render(null, container);
      host?.remove();
    },
  };
}

export { h };
