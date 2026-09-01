// Стаб @docusaurus/plugin-content-docs/client для vitest: реальный модуль
// тянет useGlobalData и контексты Docusaurus, недоступные в jsdom-рендере.
export function useDoc() {
  return { metadata: { id: 'foundation/05-git-first-commit' } };
}
