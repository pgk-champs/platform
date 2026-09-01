import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import GitSim from './GitSim';

beforeEach(() => {
  store.__resetForTests();
});

function run(cmd: string) {
  const input = screen.getByLabelText('Командная строка git');
  fireEvent.change(input, { target: { value: cmd } });
  fireEvent.submit(input.closest('form')!);
}

test('базовый поток: init → add → commit с выводом как у настоящего git', () => {
  const { container } = render(<GitSim />);
  const text = () => container.textContent ?? '';

  run('git status');
  expect(text()).toContain('fatal: not a git repository (or any of the parent directories): .git');

  run('git init');
  expect(text()).toContain('Initialized empty Git repository');

  run('edit README.md Привет, мир');
  run('git status');
  expect(text()).toContain('No commits yet');
  expect(text()).toContain('Untracked files:');

  run('git add README.md');
  run('git status');
  expect(text()).toContain('Changes to be committed:');
  expect(text()).toContain('new file:   README.md');

  run('git commit -m "первый коммит"');
  expect(text()).toMatch(/\[main \(root-commit\) [0-9a-f]{7}\] первый коммит/);

  run('git status');
  expect(text()).toContain('nothing to commit, working tree clean');

  run('git log --oneline');
  expect(text()).toMatch(/[0-9a-f]{7} \(HEAD -> main\) первый коммит/);
});

test('квест commits>=3: плашка, запись в store и XP после трёх коммитов', () => {
  const { container } = render(
    <GitSim
      scenario="branches"
      quest={{ title: 'Три коммита', goal: 'commits>=3' }}
      chapterId="git"
      trainerId="sim-commits"
    />,
  );
  expect(screen.queryByText(/Квест выполнен/)).toBeNull();

  for (let i = 1; i <= 3; i += 1) {
    run(`edit file${i}.txt содержимое ${i}`);
    run('git add .');
    run(`git commit -m "коммит ${i}"`);
  }

  expect(container.textContent).toContain('Квест выполнен');
  expect(store.getProgress().trainers.git?.['sim-commits']).toBeTruthy();
  expect(
    (store.getProgress().trainers.git?.['sim-commits']?.result as { goal: string }).goal,
  ).toBe('commits>=3');
  expect(store.getXp()).toBeGreaterThan(0);
});

test('merge без расхождения — fast-forward, квест merged выполняется', () => {
  const { container } = render(<GitSim scenario="branches" quest={{ title: 'Слияние', goal: 'merged' }} />);
  const text = () => container.textContent ?? '';

  run('git switch -c feature');
  expect(text()).toContain("Switched to a new branch 'feature'");
  run('edit feature.txt новая фича');
  run('git add .');
  run('git commit -m "фича"');
  run('git switch main');
  run('git merge feature');

  expect(text()).toContain('Fast-forward');
  expect(text()).toContain('Квест выполнен');
});

test('конфликт: маркеры в файле, edit + add + commit завершают слияние', () => {
  const { container } = render(
    <GitSim scenario="branches" quest={{ title: 'Разреши конфликт', goal: 'conflict-resolved' }} />,
  );
  const text = () => container.textContent ?? '';

  run('git switch -c topic');
  run('edit README.md вариант из topic');
  run('git add .');
  run('git commit -m "правка в topic"');
  run('git switch main');
  run('edit README.md вариант из main');
  run('git add .');
  run('git commit -m "правка в main"');
  run('git merge topic');

  expect(text()).toContain('CONFLICT (content): Merge conflict in README.md');
  expect(text()).toContain('Automatic merge failed; fix conflicts and then commit the result.');
  expect(text()).toContain('<<<<<<< HEAD'); // маркеры видны в панели файлов

  run('git commit -m "рано"');
  expect(text()).toContain('error: Committing is not possible because you have unmerged files.');

  run('edit README.md общий вариант');
  run('git add README.md');
  run('git commit -m "слияние веток"');

  expect(text()).toMatch(/\[main [0-9a-f]{7}\] слияние веток/);
  expect(text()).toContain('Квест выполнен');
});

test('квест ff-and-merge: две галочки — сначала fast-forward, затем merge-коммит', () => {
  const { container } = render(
    <GitSim
      scenario="branches"
      quest={{ title: 'Два вида слияния', goal: 'ff-and-merge' }}
      chapterId="git-branches"
      trainerId="sim-ff-and-merge"
    />,
  );
  const text = () => container.textContent ?? '';

  // трекер двух шагов виден, оба пустые
  expect(text()).toContain('шаг 1 — fast-forward');
  expect(text()).toContain('шаг 2 — merge-коммит');
  expect(text()).not.toContain('✓ шаг 1');
  expect(text()).not.toContain('✓ шаг 2');

  // шаг 1: fast-forward — main не двигался
  run('git switch -c quick');
  run('edit quick.txt быстрая правка');
  run('git add .');
  run('git commit -m "правка в quick"');
  run('git switch main');
  run('git merge quick');
  expect(text()).toContain('Fast-forward');
  expect(text()).toContain('✓ шаг 1');
  expect(screen.queryByText(/Квест выполнен/)).toBeNull();

  // шаг 2: расхождение без конфликта (разные файлы) — merge-коммит
  run('git switch -c slow');
  run('edit slow.txt правка в ветке');
  run('git add .');
  run('git commit -m "правка в slow"');
  run('git switch main');
  run('edit other.txt правка в main');
  run('git add .');
  run('git commit -m "правка в main"');
  run('git merge slow');

  expect(text()).toContain("Merge made by the 'ort' strategy.");
  expect(text()).toContain('Квест выполнен');
  expect(store.getProgress().trainers['git-branches']?.['sim-ff-and-merge']).toBeTruthy();
  expect(store.getXp()).toBeGreaterThan(0);
});

test('ff-and-merge: один fast-forward квест не закрывает, merge-коммит обязателен', () => {
  const { container } = render(<GitSim scenario="branches" quest={{ title: 'Оба слияния', goal: 'ff-and-merge' }} />);

  run('git switch -c f1');
  run('edit a.txt раз');
  run('git add .');
  run('git commit -m "раз"');
  run('git switch main');
  run('git merge f1');

  expect(container.textContent).toContain('Fast-forward');
  expect(screen.queryByText(/Квест выполнен/)).toBeNull();
});

test('remote-demo: push после коммита коллеги отклоняется, после pull проходит', () => {
  const { container } = render(<GitSim scenario="remote-demo" />);
  const text = () => container.textContent ?? '';

  fireEvent.click(screen.getByText('Коммит коллеги на origin'));
  run('edit work.txt моя работа');
  run('git add .');
  run('git commit -m "моя правка"');
  run('git push');

  expect(text()).toContain('! [rejected]        main -> main (fetch first)');
  expect(text()).toContain("error: failed to push some refs to 'origin'");

  run('git pull');
  expect(text()).toContain("Merge made by the 'ort' strategy.");

  run('git push');
  expect(text()).toMatch(/[0-9a-f]{7}\.\.[0-9a-f]{7} {2}main -> main/);
});

test('дружелюбные ошибки: неизвестная команда и несуществующая ветка', () => {
  const { container } = render(<GitSim scenario="branches" />);
  const text = () => container.textContent ?? '';

  run('git blame');
  expect(text()).toContain("git: 'blame' is not a git command. See 'git --help'.");

  run('git switch nope');
  expect(text()).toContain('fatal: invalid reference: nope');
  expect(text()).toContain('список веток покажет git branch');
});
