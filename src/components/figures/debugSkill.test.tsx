import { render, screen } from '@testing-library/react';
import { debugSkillSchemes } from './debugSkill';

test('every debugSkill scheme renders an accessible svg', () => {
  expect(Object.keys(debugSkillSchemes)).toEqual(['dbg-trace', 'dbg-caused-by', 'dbg-narrow']);
  for (const id of Object.keys(debugSkillSchemes)) {
    const { unmount } = render(<>{debugSkillSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'dbg-trace': ['искать нужно первую строку со своим пакетом и номером строки своего файла', 'верхняя строка почти всегда чужая: падает библиотека, а виноват тот, кто её так позвал'],
    'dbg-caused-by': ['читать надо до самого нижнего «Caused by» — там настоящая ошибка, «… 4 more» лишь прячет повтор'],
    'dbg-narrow': ['шаг 3 пропускают чаще всего — и чинят симптом, оставив причину на месте', 'невоспроизводимую ошибку нельзя ни починить, ни проверить — поэтому шаг 1 первый'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{debugSkillSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
