/* Стаб @docusaurus/useBrokenLinks для vitest: настоящий хук требует
 * BrokenLinksProvider (доступен только в реальной SSR/CSR-сборке
 * Docusaurus). collectAnchor в тестах ни на что не влияет — важно только,
 * что компонент его вызывает и не падает без провайдера. */
export default function useBrokenLinks() {
  return {
    collectAnchor: () => {},
    collectLink: () => {},
  };
}
