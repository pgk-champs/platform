import { render, screen } from '@testing-library/react';
import { foundationSchemes } from './foundation';

const SCHEME_IDS = Object.keys(foundationSchemes);

test('foundation.tsx содержит ровно ожидаемые схемы глав 00–03', () => {
  expect(SCHEME_IDS).toEqual([
    'gh-signup-flow',
    'gh-invite-paths',
    'gh-check-states',
    'ty-keyboard-rows',
    'ty-layout-mismatch',
    'ty-wrong-layout-typo',
    'en-error-levels',
    'en-search-query-anatomy',
    'en-participle-forms',
    'en2-bracket-names',
    'en2-word-vs-phrase',
    'en2-spelling-vs-sound',
    'en2-term-vs-dictionary',
    'lx-abs-rel-path',
    'lx-rm-no-trash',
    'lx-ctrlc-sigint',
  ]);
});

test('каждая схема рендерит svg с подписью как accessible name', () => {
  for (const id of SCHEME_IDS) {
    const { unmount } = render(<>{foundationSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'gh-signup-flow': ['Email', 'Пароль', 'Username', 'готово'],
    'gh-invite-paths': ['Организация pgk-champs', 'Один репозиторий'],
    'gh-check-states': ['зелёная галочка', 'красный крестик', 'жёлтая точка'],
    'ty-keyboard-rows': ['домашний ряд', 'ряд цифр', 'модификаторы'],
    'ty-layout-mismatch': ['Shift + 4', 'латинская', 'русская'],
    'ty-wrong-layout-typo': ['ды', 'command not found'],
    'en-error-levels': ['warning:', 'error:', 'fatal:'],
    'en-search-query-anatomy': ['not a git repository', 'site:stackoverflow.com'],
    'en-participle-forms': ['to deny', 'denied', 'to find', 'found'],
    'en2-bracket-names': ['parentheses', 'curly braces', 'square brackets'],
    'en2-word-vs-phrase': ['журнал', 'server error log'],
    'en2-spelling-vs-sound': ['height', 'хайт', 'queue', 'кью'],
    'en2-term-vs-dictionary': ['bough', 'branch'],
    'lx-abs-rel-path': ['student', 'project/docs'],
    'lx-rm-no-trash': ['Корзина', 'не вернуть'],
    'lx-ctrlc-sigint': ['Ctrl+C', 'SIGINT'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{foundationSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});

test('id каждой схемы совпадает с трек-префиксом главы (gh-/ty-/en-/en2-/lx-)', () => {
  const prefixes = ['gh-', 'ty-', 'en2-', 'en-', 'lx-'];
  for (const id of SCHEME_IDS) {
    expect(prefixes.some((p) => id.startsWith(p))).toBe(true);
  }
});
