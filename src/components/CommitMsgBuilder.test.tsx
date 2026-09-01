import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import CommitMsgBuilder, { checkMessage } from './CommitMsgBuilder';

beforeEach(() => {
  store.__resetForTests();
});

const allOk = (m: string) => checkMessage(m).every((r) => r.ok);

test('checkMessage enforces the four rules from the chapter', () => {
  expect(allOk('add name question')).toBe(true);
  expect(allOk('fix greeting text')).toBe(true);
  expect(allOk('fix')).toBe(false); // нет «что сделано»
  expect(allOk('фикс баги')).toBe(false); // не английский глагол-действие
  expect(allOk('123 456')).toBe(false); // вообще не глагол
  expect(allOk('add name question.')).toBe(false); // точка в конце
  expect(allOk('add ' + 'x'.repeat(60))).toBe(false); // длиннее 50
  expect(allOk('')).toBe(false);
});

test('renders first task with unchecked rules, counter and disabled button', () => {
  render(<CommitMsgBuilder />);
  expect(screen.getByText('Задание 1 из 3')).toBeTruthy();
  expect(screen.getByText(/спрашивает имя пользователя/)).toBeTruthy();
  expect(screen.getByText('0/50')).toBeTruthy();
  expect(screen.getByText('Зачесть коммит →')).toBeDisabled();
  expect(screen.getByText(/начинается с глагола-действия/).className).not.toContain('cmb-rule-ok');
});

test('rules light up live while typing and enable the button', () => {
  render(<CommitMsgBuilder />);
  const input = screen.getByPlaceholderText('сообщение коммита');

  fireEvent.change(input, { target: { value: 'add' } });
  expect(screen.getByText(/начинается с глагола-действия/).className).toContain('cmb-rule-ok');
  expect(screen.getByText(/что именно сделано/).className).not.toContain('cmb-rule-ok');
  expect(screen.getByText('Зачесть коммит →')).toBeDisabled();

  fireEvent.change(input, { target: { value: 'add name question.' } });
  expect(screen.getByText(/без точки в конце/).className).not.toContain('cmb-rule-ok');
  expect(screen.getByText('18/50')).toBeTruthy();

  fireEvent.change(input, { target: { value: 'add name question' } });
  expect(screen.getByText(/без точки в конце/).className).toContain('cmb-rule-ok');
  expect(screen.getByText('Зачесть коммит →')).not.toBeDisabled();
});

test('over-limit counter gets the warning class', () => {
  render(<CommitMsgBuilder />);
  const input = screen.getByPlaceholderText('сообщение коммита');
  fireEvent.change(input, { target: { value: 'add ' + 'x'.repeat(60) } });
  expect(screen.getByText('64/50').className).toContain('cmb-count-over');
});

test('three valid messages finish the trainer, mark it done and award xp', () => {
  render(<CommitMsgBuilder chapterId="git-first-commit" trainerId="msg-builder" />);
  const input = screen.getByPlaceholderText('сообщение коммита');

  fireEvent.change(input, { target: { value: 'add name question' } });
  fireEvent.click(screen.getByText('Зачесть коммит →'));
  expect(screen.getByText('Задание 2 из 3')).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe(''); // поле очищено под новое задание

  fireEvent.change(input, { target: { value: 'ignore notes file' } });
  fireEvent.click(screen.getByText('Зачесть коммит →'));
  expect(screen.getByText('Задание 3 из 3')).toBeTruthy();

  fireEvent.change(input, { target: { value: 'fix greeting text' } });
  fireEvent.click(screen.getByText('Зачесть последний коммит'));

  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['git-first-commit']?.['msg-builder']).toMatchObject({
    result: { done: 3, total: 3 },
  });
  expect(store.getXp()).toBe(25);
});

test('Enter submits a valid message', () => {
  render(<CommitMsgBuilder />);
  const input = screen.getByPlaceholderText('сообщение коммита');
  fireEvent.change(input, { target: { value: 'update readme' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.getByText('Задание 2 из 3')).toBeTruthy();
});
