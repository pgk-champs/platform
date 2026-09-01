// Стаб @docusaurus/router для vitest: useLocation требует Router-контекст,
// которого нет в jsdom-рендере. Возвращаем фиксированный pathname главы.
export function useLocation() {
  return { pathname: '/platform/docs/foundation/05-git-first-commit', search: '', hash: '' };
}
