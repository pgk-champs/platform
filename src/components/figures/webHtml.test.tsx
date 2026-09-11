import { render, screen } from '@testing-library/react';
import { webHtmlSchemes } from './webHtml';

test('every webHtml scheme renders an accessible svg', () => {
  expect(Object.keys(webHtmlSchemes)).toEqual(['wh-three-languages', 'wh-parser-fixes', 'wh-defaults']);
  for (const id of Object.keys(webHtmlSchemes)) {
    const { unmount } = render(<>{webHtmlSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'wh-three-languages': ['страница живёт и без второго, и без третьего: без оформления — некрасиво, без поведения — статично', 'без первого не живёт вовсе: оформлять и оживлять нечего'],
    'wh-parser-fixes': ['блочный элемент внутри абзаца закрывает абзац: так устроены правила разбора, и ошибки не будет', 'поэтому разметку проверяют инструментом, а не глазами: глазами она выглядит правильной'],
    'wh-defaults': ['блочный занимает всю ширину и начинается с новой строки; строчный — только своё место в строке', 'отступы у заголовков и абзацев не ваши — их даёт браузер; поэтому оформление часто начинают со сброса'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{webHtmlSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
