import React from 'react';

// Test-only stub for '@docusaurus/Link', aliased in vitest.config.ts.
// RouteList.test.tsx renders outside a Docusaurus site context, so the real
// Link (which needs router/context) can't run there. This renders the same
// markup (<a href>) so tests still verify the actual output.
export default function LinkStub({
  to,
  children,
  ...rest
}: {
  to: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
