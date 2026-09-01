/* Стаб @docusaurus/useBaseUrl для vitest: настоящий хук требует
 * DocusaurusContext, которого нет в jsdom. Возвращает путь как есть. */
export default function useBaseUrl(path: string): string {
  return path;
}
