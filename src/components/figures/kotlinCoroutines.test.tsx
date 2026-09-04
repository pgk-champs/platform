import { render, screen } from '@testing-library/react';
import { kotlinCoroutinesSchemes } from './kotlinCoroutines';

test('every kotlinCoroutines scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinCoroutinesSchemes)).toEqual([
    'kc-thread-blocked',
    'kc-launch-async',
    'kc-scope-tree',
    'kc-dispatchers',
  ]);
  for (const id of Object.keys(kotlinCoroutinesSchemes)) {
    const { unmount } = render(<>{kotlinCoroutinesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kc-thread-blocked': ['ожидание — кадры не рисуются', 'та же корутина ждёт, а поток всё это время рисует кадры', 'приостановить корутину — запомнить место и отпустить поток другим'],
    'kc-launch-async': ['ждут через join(), результата нет', 'ждут через await(), значение есть', 'работа стартует в момент async, а не на await'],
    'kc-scope-tree': ['падение поднялось вверх и снесло всю ветку', 'падение осталось в своей ветке', 'try/catch вокруг await ловит только путь к await'],
    'kc-dispatchers': ['только интерфейс', 'потоков по числу ядер', 'выполнит блок там и вернётся обратно само', 'Main существует только на Android'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinCoroutinesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
