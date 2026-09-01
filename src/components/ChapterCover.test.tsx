import { render } from '@testing-library/react';
import ChapterCover, { CHAPTER_IDS, TrackBanner } from './ChapterCover';

test('покрыты все 18 глав', () => {
  expect(CHAPTER_IDS).toHaveLength(18);
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

test('баннеры трёх треков различаются, mini добавляет модификатор', () => {
  const markups = new Set<string>();
  for (const track of ['foundation', 'mobile', 'blockchain'] as const) {
    const { container, unmount } = render(<TrackBanner track={track} />);
    expect(container.querySelector('svg')).toBeTruthy();
    markups.add(container.innerHTML);
    unmount();
  }
  expect(markups.size).toBe(3);

  const { container } = render(<TrackBanner track="mobile" mini />);
  expect(container.querySelector('.track-banner--mini')).toBeTruthy();
});
