import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import ComposePreview, { ComposeNode } from './ComposePreview';

const tree: ComposeNode = {
  type: 'Column',
  fillMaxSize: true,
  padding: 16,
  arrangement: 'start',
  alignment: 'center',
  children: [
    { type: 'Text', text: 'Привет, Compose!', fontSize: 24, color: '#6200EE' },
    { type: 'Spacer', height: 8 },
    { type: 'Button', text: 'Нажми меня' },
  ],
};

beforeEach(() => {
  store.__resetForTests();
});

test('mockup and generated code come from the same tree', () => {
  const { container } = render(<ComposePreview tree={tree} />);
  expect(screen.getByText('Привет, Compose!')).toBeTruthy();
  expect(screen.getByText('Нажми меня')).toBeTruthy();

  const code = container.querySelector('.cpv-code')!.textContent!;
  expect(code).toContain('Column(modifier = Modifier.fillMaxSize().padding(16.dp)');
  expect(code).toContain('verticalArrangement = Arrangement.Top');
  expect(code).toContain('horizontalAlignment = Alignment.CenterHorizontally');
  expect(code).toContain('Text("Привет, Compose!", fontSize = 24.sp, color = Color(0xFF6200EE))');
  expect(code).toContain('Spacer(modifier = Modifier.height(8.dp))');
  expect(code).toContain('Button(onClick = { }) { Text("Нажми меня") }');
});

test('without editable there is no controls panel', () => {
  render(<ComposePreview tree={tree} />);
  expect(screen.queryByRole('slider')).toBeNull();
  expect(screen.queryByText('Сбросить')).toBeNull();
});

test('arrangement control updates both the mockup flexbox and the code', () => {
  const { container } = render(<ComposePreview tree={tree} editable />);
  fireEvent.click(screen.getByRole('button', { name: 'spaceBetween' }));

  const root = container.querySelector('.cpv-screen > *') as HTMLElement;
  expect(root.style.justifyContent).toBe('space-between');
  expect(container.querySelector('.cpv-code')!.textContent).toContain('Arrangement.SpaceBetween');
});

test('fontSize slider updates both the text style and the code', () => {
  const { container } = render(<ComposePreview tree={tree} editable />);
  const slider = screen.getByRole('slider', { name: /fontSize/ });
  fireEvent.change(slider, { target: { value: '30' } });

  expect((screen.getByText('Привет, Compose!') as HTMLElement).style.fontSize).toBe('30px');
  expect(container.querySelector('.cpv-code')!.textContent).toContain('fontSize = 30.sp');
});

test('3 changes complete the goal: markTrainerDone + XP + done badge', () => {
  render(<ComposePreview tree={tree} editable chapterId="compose" trainerId="preview" />);
  expect(screen.getByText(/0 из 3/)).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'spaceBetween' }));
  fireEvent.click(screen.getByRole('button', { name: 'end' }));
  expect(store.getProgress().trainers).toEqual({});

  fireEvent.change(screen.getByRole('slider', { name: /fontSize/ }), { target: { value: '32' } });
  expect(store.getProgress().trainers.compose?.preview?.result).toEqual({ changes: 3 });
  expect(store.getXp()).toBe(10);
  expect(screen.getByText(/Цель выполнена/)).toBeTruthy();
});

test('without chapterId/trainerId changes never touch the store', () => {
  render(<ComposePreview tree={tree} editable />);
  fireEvent.click(screen.getByRole('button', { name: 'spaceBetween' }));
  fireEvent.click(screen.getByRole('button', { name: 'center' }));
  fireEvent.click(screen.getByRole('button', { name: 'end' }));
  expect(store.getProgress().trainers).toEqual({});
  expect(store.getXp()).toBe(0);
});

test('already completed trainer shows done state and does not re-award XP', () => {
  store.markTrainerDone('compose', 'preview', { changes: 3 });
  render(<ComposePreview tree={tree} editable chapterId="compose" trainerId="preview" />);
  expect(screen.getByText(/Цель выполнена/)).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'spaceBetween' }));
  fireEvent.click(screen.getByRole('button', { name: 'end' }));
  fireEvent.click(screen.getByRole('button', { name: 'center' }));
  expect(store.getXp()).toBe(0);
});
