import { render, screen, fireEvent } from '@testing-library/react';
import { store } from '../lib/store';
import TerminalSim from './TerminalSim';

// Квесты трёх глав про взрослый репозиторий заданы прямо в mdx: набор файлов
// плюс requiredPaths/forbiddenPaths. Проверяем не сам симулятор (он покрыт
// TerminalSim.test.tsx), а решаемость условий — что задание закрывается теми
// командами, которые описаны в подсказке рядом с тренажёром.

beforeEach(() => {
  store.__resetForTests();
});

function input(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement;
}

function run(cmd: string) {
  fireEvent.change(input(), { target: { value: cmd } });
  fireEvent.keyDown(input(), { key: 'Enter' });
}

test('repo-anatomy: корень собирается echo/cp/rm', () => {
  render(
    <TerminalSim
      initialFs={{
        '.env': 'API_TOKEN=sk_live_9f3ac41b7d\nDB_PASSWORD=hunter2',
        'readme.txt': 'todo: написать нормально',
        'main.py': "print('hello')",
        node_modules: { 'placeholder.txt': 'сюда npm складывает зависимости' },
      }}
      quest={{
        title: 'корень репозитория',
        requiredPaths: ['README.md', '.gitignore', '.env.example'],
        forbiddenPaths: ['.env', 'readme.txt'],
      }}
      chapterId="repo-anatomy"
      trainerId="trainer-repo-root"
    />,
  );
  run('echo "# Проект" > README.md');
  run('cp .env .env.example');
  run('echo .env > .gitignore');
  expect(screen.queryByText('Выполнено!')).toBeNull(); // .env ещё на месте
  run('rm .env readme.txt');
  expect(screen.getByText('Выполнено!')).toBeTruthy();
  expect(store.getProgress().trainers['repo-anatomy']['trainer-repo-root']).toBeTruthy();
});

test('github-actions: workflow кладётся mkdir -p и touch', () => {
  render(
    <TerminalSim
      initialFs={{ 'package.json': '{}', 'README.md': '# Мой сайт', src: { 'index.js': '' } }}
      quest={{ title: 'workflow', requiredPaths: ['.github/workflows/deploy.yml'] }}
      chapterId="github-actions"
      trainerId="trainer-ci-place"
    />,
  );
  run('mkdir -p .github/workflows');
  expect(screen.queryByText('Выполнено!')).toBeNull();
  run('touch .github/workflows/deploy.yml');
  expect(screen.getByText('Выполнено!')).toBeTruthy();
});

test('code-review-release: заметки релиза создаются, временный файл удаляется', () => {
  render(
    <TerminalSim
      initialFs={{
        'CHANGELOG.md': '# Изменения\n\n## [Unreleased]\n### Added\n- вход по одноразовому коду',
        VERSION: '1.4.3',
        'notes.tmp': 'напомнить себе',
        'README.md': '# Сервис расписания',
      }}
      quest={{
        title: 'релиз',
        requiredPaths: ['release/v1.5.0.md'],
        forbiddenPaths: ['notes.tmp'],
      }}
      chapterId="code-review-release"
      trainerId="trainer-release-prep"
    />,
  );
  run('mkdir release');
  run('echo "- вход по одноразовому коду" >> release/v1.5.0.md');
  expect(screen.queryByText('Выполнено!')).toBeNull(); // notes.tmp ещё лежит
  run('rm notes.tmp');
  expect(screen.getByText('Выполнено!')).toBeTruthy();
});
