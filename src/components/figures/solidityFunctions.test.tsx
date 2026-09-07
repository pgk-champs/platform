import { render, screen } from '@testing-library/react';
import { solidityFunctionsSchemes } from './solidityFunctions';

test('every solidityFunctions scheme renders an accessible svg', () => {
  expect(Object.keys(solidityFunctionsSchemes)).toEqual([
    'sfn-visibility',
    'sfn-view-vs-write',
    'sfn-modifier-order',
    'sfn-transfer-vs-call',
  ]);
  for (const id of Object.keys(solidityFunctionsSchemes)) {
    const { unmount } = render(<>{solidityFunctionsSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'sfn-visibility': ['private не значит «секретно»: байткод публичен, скрыт только вход', 'c.onlyHere() → c.onlyHere is not a function'],
    'sfn-view-vs-write': ['разница 17 100 — цена заполнения нуля', 'view — обещание компилятору: запись внутри такой функции не соберётся'],
    'sfn-modifier-order': ['код после «_;» действительно выполняется — модификатор оборачивает функцию, а не только предваряет её', 'require упал ДО «_;»'],
    'sfn-transfer-vs-call': ['получателю отдаётся ровно 2300 газа', 'по тексту двух функций разницы не видно — видно только по результату'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{solidityFunctionsSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
