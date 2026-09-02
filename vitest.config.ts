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
      '@docusaurus/useBaseUrl': path.resolve(__dirname, './src/test/UseBaseUrlStub.ts'),
      '@theme/TOCInline': path.resolve(__dirname, './src/test/TOCInlineStub.tsx'),
      '@docusaurus/router': path.resolve(__dirname, './src/test/DocusaurusRouterStub.tsx'),
      '@theme-original/DocItem/Footer': path.resolve(
        __dirname,
        './src/test/ThemeOriginalDocItemFooterStub.tsx',
      ),
      '@docusaurus/plugin-content-docs/client': path.resolve(
        __dirname,
        './src/test/DocsClientStub.tsx',
      ),
      '@docusaurus/useBrokenLinks': path.resolve(
        __dirname,
        './src/test/UseBrokenLinksStub.ts',
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
});
