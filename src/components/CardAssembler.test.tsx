import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CardAssembler from './CardAssembler';

beforeEach(() => {
  store.__resetForTests();
});

const CORRECT = [
  'Column(Modifier.padding(12.dp)) {',
  'Image(...) // изображение товара',
  'Text(text = title, fontSize = 16.sp)',
  'Row(horizontalArrangement = Arrangement.SpaceBetween) {',
  'Text(text = price, fontSize = 18.sp)',
  '} // конец Row',
  '} // конец Column',
];

test('все семь строк доступны в перемешанном черновике', () => {
  render(<CardAssembler />);
  CORRECT.forEach((text) => expect(screen.getByText(text)).toBeTruthy());
});

test('правильная сборка: «Выполнено!», запись в store и XP', () => {
  const { container } = render(
    <CardAssembler chapterId="layout-by-mockup" trainerId="trainer-card-assembler" />,
  );
  CORRECT.forEach((text) => fireEvent.click(screen.getByText(text)));
  fireEvent.click(screen.getByText('Проверить'));

  expect(container.textContent).toContain('Выполнено! Структура карточки собрана верно.');
  expect(
    store.getProgress().trainers['layout-by-mockup']?.['trainer-card-assembler'],
  ).toMatchObject({ result: { attempts: 1 } });
  expect(store.getXp()).toBe(25);
});

test('неправильный порядок: подсветка ошибочных позиций, без плашки', () => {
  const { container } = render(<CardAssembler />);
  const swapped = [...CORRECT];
  [swapped[1], swapped[2]] = [swapped[2], swapped[1]]; // Image и Text(название) местами
  swapped.forEach((text) => fireEvent.click(screen.getByText(text)));
  fireEvent.click(screen.getByText('Проверить'));

  expect(container.textContent).not.toContain('Выполнено!');
  expect(container.textContent).toContain('Подсвеченные строки стоят не на своих местах');
  expect(screen.getByText('Image(...) // изображение товара').className).toContain('casm-bad');
  expect(screen.getByText('Text(text = title, fontSize = 16.sp)').className).toContain('casm-bad');
  expect(screen.getByText('Column(Modifier.padding(12.dp)) {').className).not.toContain('casm-bad');
});

test('клик по собранной строке возвращает её в черновик, «Сбросить» очищает всё', () => {
  const { container } = render(<CardAssembler />);
  fireEvent.click(screen.getByText(CORRECT[0]));
  expect(screen.getByText(CORRECT[0]).className).toContain('casm-placed');

  fireEvent.click(screen.getByText(CORRECT[0]));
  expect(screen.getByText(CORRECT[0]).className).not.toContain('casm-placed');

  fireEvent.click(screen.getByText(CORRECT[0]));
  fireEvent.click(screen.getByText(CORRECT[1]));
  fireEvent.click(screen.getByText('Сбросить'));
  expect(container.textContent).toContain('Карточка пока пустая');
});

test('«Проверить» неактивна, пока собраны не все строки', () => {
  render(<CardAssembler />);
  fireEvent.click(screen.getByText(CORRECT[0]));
  expect(screen.getByText('Проверить')).toBeDisabled();
});
