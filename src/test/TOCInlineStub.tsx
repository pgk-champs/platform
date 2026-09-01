import React from 'react';

// Test-only stub for '@theme/TOCInline', aliased in vitest.config.ts. The
// real component needs Docusaurus theme context unavailable in vitest's
// jsdom render; this renders a flat list from the same {value, id} shape so
// CollapsibleToc tests can verify it actually forwards `toc` through.
export default function TOCInlineStub({ toc }: { toc: ReadonlyArray<{ value: string; id: string }> }) {
  return (
    <ul className="table-of-contents">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.value}</a>
        </li>
      ))}
    </ul>
  );
}
