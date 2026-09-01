import React, { useSyncExternalStore } from 'react';
import TOCInline from '@theme/TOCInline';
import type { TOCItem } from '@docusaurus/mdx-loader';
import { store } from '../lib/store';
import './trainers.css';

export default function CollapsibleToc({
  toc,
  chapterId,
  minHeadingLevel,
  maxHeadingLevel,
}: {
  toc: readonly TOCItem[];
  chapterId: string;
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
}) {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const collapsed = store.toc.isCollapsed(chapterId);

  return (
    <div className="ctoc">
      <button
        type="button"
        className="ctoc-toggle"
        aria-expanded={!collapsed}
        onClick={() => store.toc.setCollapsed(chapterId, !collapsed)}
      >
        <span className={`ctoc-arrow ${collapsed ? '' : 'ctoc-arrow-open'}`.trim()} aria-hidden="true">
          ▶
        </span>
        Содержание главы
      </button>
      {!collapsed ? (
        <div className="ctoc-body">
          <TOCInline toc={toc} minHeadingLevel={minHeadingLevel} maxHeadingLevel={maxHeadingLevel} />
        </div>
      ) : null}
    </div>
  );
}
