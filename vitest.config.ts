import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Real Link needs Docusaurus router context, unavailable in vitest's
      // jsdom render. Stub renders the same <a href> markup.
      '@docusaurus/Link': path.resolve(__dirname, './src/test/DocusaurusLinkStub.tsx'),
      '@theme/TOCInline': path.resolve(__dirname, './src/test/TOCInlineStub.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
});
