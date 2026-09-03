import { render, screen } from '@testing-library/react';
import { foundationBSchemes } from './foundationB';

/* Схемы глав 04-08 (файлы/пакеты/SSH, три git-главы, Android Studio).
 * Тест не трогает Figure.test.tsx (общий SCHEME_IDS там растёт по мере
 * того, как остальные треки заполняют свои файлы) — проверяет только то,
 * что реально лежит в этом модуле. */

const EXPECTED_IDS = [
  'sudo-elevation',
  'apt-repo-flow',
  'ssh-keypair',
  'git-head-pointer',
  'commit-anatomy',
  'gitignore-filter',
  'branch-pointer-move',
  'fast-forward-vs-merge',
  'merge-conflict',
  'clone-vs-fork',
  'fetch-then-merge',
  'project-tree-structure',
  'gradle-build-pipeline',
  'avd-wizard-flow',
].sort();

const EXPECTED_LABELS: Record<string, string[]> = {
  'sudo-elevation': ['student', 'root', 'sudo + пароль'],
  'apt-repo-flow': ['apt update', 'apt install tree', 'репозиторий'],
  'ssh-keypair': ['id_ed25519', 'id_ed25519.pub', '600', '644'],
  'git-head-pointer': ['HEAD', 'refs/heads/master'],
  'commit-anatomy': ['hash', 'author', 'date', 'message', 'add main screen'],
  'gitignore-filter': ['.gitignore', 'draft.txt', 'git status'],
  'branch-pointer-move': ['master', 'feature-scoreboard'],
  'fast-forward-vs-merge': ['fast-forward', 'three-way merge', 'merge-коммит'],
  'merge-conflict': ['<<<<<<< HEAD', '=======', 'feature-name-fix'],
  'clone-vs-fork': ['git clone', 'Fork', 'твой форк на GitHub'],
  'fetch-then-merge': ['git fetch', 'git merge', 'origin/main обновилась'],
  'project-tree-structure': ['manifests', 'kotlin+java', 'res', 'Gradle Scripts'],
  'gradle-build-pipeline': ['Gradle', 'APK', 'build.gradle.kts'],
  'avd-wizard-flow': ['Select Hardware', 'System Image', 'Verify Configuration', 'Finish'],
};

test('foundationBSchemes содержит ровно схемы глав 04-08, без опечаток в id', () => {
  expect(Object.keys(foundationBSchemes).sort()).toEqual(EXPECTED_IDS);
});

test('каждая схема рисует svg с подписью в качестве доступного имени', () => {
  for (const id of Object.keys(foundationBSchemes)) {
    const { unmount } = render(foundationBSchemes[id](`схема ${id}`));
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('каждая схема несёт осмысленный текст, а не только рамку', () => {
  expect(Object.keys(EXPECTED_LABELS).sort()).toEqual(EXPECTED_IDS);
  for (const [id, labels] of Object.entries(EXPECTED_LABELS)) {
    const { container, unmount } = render(foundationBSchemes[id]('подпись'));
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
