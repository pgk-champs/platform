import { render, screen } from '@testing-library/react';
import { kotlinHistorySchemes } from './kotlinHistory';

test('every kotlinHistory scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinHistorySchemes)).toEqual([
    'kh-timeline',
    'kh-jvm-stack',
    'kh-two-languages',
    'kh-kotlin-today',
  ]);
  for (const id of Object.keys(kotlinHistorySchemes)) {
    const { unmount } = render(<>{kotlinHistorySchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kh-timeline': ['«пиши раз — запускай везде»', 'официальный язык Android', '2019: Kotlin-first, новые проекты только на нём'],
    'kh-jvm-stack': ['общий для обоих языков', 'оба языка сходятся в одной точке — в байт-коде', 'Dalvik работал до 2014 года, потом его заменил ART'],
    'kh-two-languages': ['вызывают друг друга напрямую, без обёрток и мостов', 'перевод проекта идёт по одному файлу за раз', 'встроенный конвертер Java → Kotlin'],
    'kh-kotlin-today': ['iOS без виртуальной машины', 'бизнес-логику пишут один раз, экраны — на каждой платформе свои'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinHistorySchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
