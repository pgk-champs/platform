import { render } from '@testing-library/react';
import ChapterCover, { CHAPTER_IDS, TrackBanner, coverFontSize } from './ChapterCover';

test('покрыты все 43 главы', () => {
  expect(CHAPTER_IDS).toHaveLength(55);
});

test('заголовок обложки умещается в ширину 800', () => {
  for (const id of CHAPTER_IDS) {
    const { container, unmount } = render(<ChapterCover chapterId={id} />);
    const found = container.querySelectorAll('text[x="36"][y="204"]');
    expect(found).toHaveLength(1);
    const title = found[0].textContent ?? '';
    expect(Number(found[0].getAttribute('font-size'))).toBe(coverFontSize(title));
    // при кегле 21 в оставшиеся 744 px влезает около 60 знаков — дальше строка обрежется
    expect(title.length).toBeLessThanOrEqual(60);
    unmount();
  }
});

test('новые главы стоят в своих треках', () => {
  const cases = [
    ['foundation-final', 'ФУНДАМЕНТ', '08'],
    ['code-editor', 'БЛОКЧЕЙН', '02'],
    ['android-studio', 'МОБИЛКА', '00'],
    ['kotlin-flow', 'МОБИЛКА', '03'],
    ['kotlin-oop', 'МОБИЛКА', '06'],
    ['kotlin-vs-java', 'МОБИЛКА', '26'],
    ['kotlin-history', 'МОБИЛКА', '27'],
    ['kotlin-coroutines', 'МОБИЛКА', '14'],
    ['kotlin-null', 'МОБИЛКА', '02'],
    ['first-compose-screen', 'МОБИЛКА', '07'],
    ['ui-kit', 'МОБИЛКА', '10'],
    ['ts-vs-js', 'БЛОКЧЕЙН', '14'],
    ['ts-values', 'БЛОКЧЕЙН', '15'],
    ['ts-flow', 'БЛОКЧЕЙН', '16'],
    ['ts-functions', 'БЛОКЧЕЙН', '17'],
    ['ts-collections', 'БЛОКЧЕЙН', '18'],
    ['ts-oop', 'БЛОКЧЕЙН', '19'],
    ['ts-history', 'БЛОКЧЕЙН', '21'],
    ['ts-async', 'БЛОКЧЕЙН', '20'],
  ] as const;
  for (const [id, track, num] of cases) {
    const { container, unmount } = render(<ChapterCover chapterId={id} />);
    expect(container.textContent).toContain(track);
    expect(container.textContent).toContain(num);
    unmount();
  }
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
