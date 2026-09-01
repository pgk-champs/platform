import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import FsTreeViz, { relPath } from './FsTreeViz';

beforeEach(() => {
  store.__resetForTests();
});

test('relPath: вверх, вниз, смешанно, на месте', () => {
  expect(relPath(['a', 'b'], ['a', 'b', 'c'])).toBe('c');
  expect(relPath(['a', 'b', 'c'], ['a', 'b'])).toBe('..');
  expect(relPath(['a', 'b', 'src'], ['a', 'b', 'docs'])).toBe('../docs');
  expect(relPath(['a', 'b'], ['a', 'b'])).toBe('.');
});

test('рисует дерево практикума и отметку текущего каталога в project', () => {
  render(<FsTreeViz />);
  expect(screen.getByText('/home/student')).toBeTruthy();
  expect(screen.getByText(/^project\//)).toBeTruthy();
  expect(screen.getByText('docs/')).toBeTruthy();
  expect(screen.getByText('src/')).toBeTruthy();
  expect(screen.getAllByText('README.md')).toHaveLength(2);
  expect(screen.getByText('main.py')).toBeTruthy();
  expect(screen.getByText('← ты здесь')).toBeTruthy();
});

test('клик по каталогу: pwd, относительный и абсолютный cd, подсветка пути', () => {
  render(<FsTreeViz />);
  fireEvent.click(screen.getByText('docs/'));
  expect(screen.getByText('/home/student/project/docs')).toBeTruthy();
  expect(screen.getByText('cd docs')).toBeTruthy();
  expect(screen.getByText('cd /home/student/project/docs')).toBeTruthy();
  // подсветка: docs выбран, project — на пути к нему
  expect(screen.getByText('docs/').className).toContain('ftv-sel');
  expect(screen.getByText(/^project\//).className).toContain('ftv-onpath');
});

test('следующий клик считает cd уже от нового текущего каталога', () => {
  render(<FsTreeViz />);
  fireEvent.click(screen.getByText('docs/'));
  fireEvent.click(screen.getByText('src/'));
  expect(screen.getByText('cd ../src')).toBeTruthy();
});

test('клик по файлу: путь и объяснение, что cd работает только с каталогами', () => {
  render(<FsTreeViz />);
  fireEvent.click(screen.getByText('main.py'));
  expect(screen.getByText('/home/student/project/src/main.py')).toBeTruthy();
  expect(screen.getByText(/cd работает только с каталогами/)).toBeTruthy();
  // текущий каталог не сменился
  fireEvent.click(screen.getByText('docs/'));
  expect(screen.getByText('cd docs')).toBeTruthy();
});

test('клик по текущему каталогу: «ты уже здесь»', () => {
  render(<FsTreeViz />);
  fireEvent.click(screen.getByText(/^project\//));
  expect(screen.getByText(/Ты уже здесь/)).toBeTruthy();
});

const answerQuest = (cmd: string) => {
  fireEvent.change(screen.getByLabelText('Команда для квеста'), { target: { value: cmd } });
  fireEvent.click(screen.getByText('Проверить'));
};

test('квест: неверная команда и подсказки для cd .. и абсолютного пути', () => {
  render(<FsTreeViz />);
  answerQuest('cd docs');
  expect(screen.getByText(/Не то/)).toBeTruthy();
  answerQuest('cd ..');
  expect(screen.getByText(/только поднимет тебя в project/)).toBeTruthy();
  answerQuest('cd /home/student/project/docs');
  expect(screen.getByText(/Сработает, но это длинный абсолютный путь/)).toBeTruthy();
});

test('квест: cd ../docs — «Выполнено!», запись в store и XP', () => {
  render(<FsTreeViz chapterId="linux-terminal" trainerId="trainer-fstree" />);
  answerQuest('  cd   ../docs/ ');
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getProgress().trainers['linux-terminal']?.['trainer-fstree']).toMatchObject({
    result: { solved: true },
  });
  expect(store.getXp()).toBe(20);
});

test('квест: повторное решение не даёт XP дважды', () => {
  store.markTrainerDone('linux-terminal', 'trainer-fstree', { solved: true });
  render(<FsTreeViz chapterId="linux-terminal" trainerId="trainer-fstree" />);
  answerQuest('cd ../docs');
  expect(screen.getByText(/Выполнено!/)).toBeTruthy();
  expect(store.getXp()).toBe(0);
});
