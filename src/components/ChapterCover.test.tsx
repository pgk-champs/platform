import { render } from '@testing-library/react';
import ChapterCover, { CHAPTER_IDS, TrackBanner } from './ChapterCover';

test('покрыты все 25 глав', () => {
  expect(CHAPTER_IDS).toHaveLength(25);
});

test('каждая глава рендерит свою уникальную обложку с названием', () => {
  const markups = new Set<string>();
  for (const id of CHAPTER_IDS) {
    const { container, unmount } = render(<ChapterCover chapterId={id} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-label')).toContain('Обложка главы');
    markups.add(container.innerHTML);
    unmount();
  }
  expect(markups.size).toBe(CHAPTER_IDS.length);
});

test('неизвестный chapterId не рендерит ничего', () => {
  const { container } = render(<ChapterCover chapterId="no-such-chapter" />);
  expect(container.innerHTML).toBe('');
});

test('баннеры четырёх треков различаются, mini добавляет модификатор', () => {
  const markups = new Set<string>();
  for (const track of ['foundation', 'mobile', 'blockchain', 'advanced'] as const) {
    const { container, unmount } = render(<TrackBanner track={track} />);
    expect(container.querySelector('svg')).toBeTruthy();
    markups.add(container.innerHTML);
    unmount();
  }
  expect(markups.size).toBe(4);

  const { container } = render(<TrackBanner track="mobile" mini />);
  expect(container.querySelector('.track-banner--mini')).toBeTruthy();
});

test('обложки advanced-глав показывают трек «Отдельные темы» и верный номер/название', () => {
  const cases = [
    ['git-rebase', '03', 'Rebase мастерски'],
    ['grep-regex', '01', 'Регулярные выражения для grep'],
    ['ssh-keys-deep', '02', 'SSH-ключи глубоко'],
    ['repo-anatomy', '04', 'Анатомия взрослого репозитория'],
    ['github-actions', '05', 'CI: робот проверяет за тебя'],
    ['code-review-release', '06', 'Ревью, коммиты, релизы'],
  ] as const;
  for (const [id, num, title] of cases) {
    const { container, unmount } = render(<ChapterCover chapterId={id} />);
    expect(container.textContent).toContain('ОТДЕЛЬНЫЕ ТЕМЫ');
    expect(container.textContent).toContain(num);
    expect(container.textContent).toContain(title);
    unmount();
  }
});
