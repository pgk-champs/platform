import { render, screen } from '@testing-library/react';
import { mobileSchemes } from './mobile';

const IDS = [
  'kotlin-five-types',
  'chain-pipeline',
  'string-template-fill',
  'function-signature-anatomy',
  'trailing-lambda-shift',
  'higher-order-plug',
  'class-blueprint-instances',
  'data-class-codegen',
  'nullable-box',
  'composable-tree',
  'modifier-order-matters',
  'state-hoisting-updown',
  'remember-lifetime',
  'delegate-getset-flow',
  'argb-hex-channels',
  'arrangement-compare',
  'box-alignment-grid',
  'api-vs-implementation-visibility',
  'app-vs-library-plugin',
];

test('mobileSchemes содержит ровно те 19 схем, что добавлены для трека «Мобилка»', () => {
  expect(Object.keys(mobileSchemes).sort()).toEqual([...IDS].sort());
});

test('каждая схема рисует svg с подписью как доступным именем', () => {
  for (const id of IDS) {
    const { unmount } = render(<>{mobileSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('каждая схема несёт осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kotlin-five-types': ['Int', 'Double', 'Char', 'Boolean', 'String'],
    'chain-pipeline': ['[1, 2]', '[2, 4]', '6'],
    'string-template-fill': ['$name', 'Олег', '17'],
    'function-signature-anatomy': ['square', 'x: Int', 'Int'],
    'trailing-lambda-shift': ['calculate(6, 3, ', 'calculate(6, 3)'],
    'higher-order-plug': ['9', '3', '18'],
    'class-blueprint-instances': ['alice', 'bogdan', 'Алиса', 'Богдан'],
    'data-class-codegen': ['toString()', 'equals()', 'copy()', 'componentN()'],
    'nullable-box': ['Int', 'Int?', 'null'],
    'composable-tree': ['WelcomeScreen', 'Column', 'Button'],
    'modifier-order-matters': ['.clickable().padding(16.dp)', '.padding(16.dp).clickable()'],
    'state-hoisting-updown': ['TrainingScreen', 'CounterDisplay', 'count: Int', 'onIncrement()'],
    'remember-lifetime': ['1, 1, 1', '1, 2, 3'],
    'delegate-getset-flow': ['getValue()', 'setValue(1)'],
    'argb-hex-channels': ['alpha', 'red', 'green', 'blue'],
    'arrangement-compare': ['SpaceBetween', 'SpaceAround', 'SpaceEvenly'],
    'box-alignment-grid': ['TopEnd', 'Center', 'BottomStart'],
    'api-vs-implementation-visibility': ['видит ApiResponse', 'не виден'],
    'app-vs-library-plugin': ['.apk / .aab', '.aar'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{mobileSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});

test('у каждой схемы свой уникальный id градиента вида fig-m-*, коллизий с другими треками нет', () => {
  const seen = new Set<string>();
  for (const id of IDS) {
    const { container, unmount } = render(<>{mobileSchemes[id](`схема ${id}`)}</>);
    const gradient = container.querySelector('linearGradient');
    expect(gradient).toBeTruthy();
    const gradientId = gradient!.getAttribute('id')!;
    expect(gradientId.startsWith('fig-m-')).toBe(true);
    expect(seen.has(gradientId)).toBe(false);
    seen.add(gradientId);
    unmount();
  }
});
