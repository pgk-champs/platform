import { render, screen, fireEvent, act } from '@testing-library/react';
import { store } from '../lib/store';
import ChapterTour from './ChapterTour';

beforeEach(() => {
  store.__resetForTests();
});

function renderChapterPage() {
  return render(
    <div>
      <div className="cp">прогресс</div>
      <div className="block">
        блок
        <button type="button" className="block-fav">
          ☆
        </button>
      </div>
    </div>,
  );
}

// Driver.js помечает шаг активным (нужно для onDestroyed) только на первом
// animation frame после drive() — в реальности пользователь не успевает
// кликнуть быстрее, но тест должен явно дождаться этого тика.
async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

test('starts the tour on first visit and marks it seen once closed', async () => {
  expect(store.tour.isSeen('chapter-basics')).toBe(false);
  renderChapterPage();
  render(<ChapterTour />);
  await nextFrame();

  expect(screen.getByText('Прогресс главы')).toBeTruthy();

  // Крестик — один из нескольких равнозначных способов закрыть тур
  // (Escape/клик снаружи/крестик/«Понятно» на последнем шаге), все они
  // доходят до единого хука onDestroyed.
  fireEvent.click(document.querySelector('.driver-popover-close-btn')!);

  expect(store.tour.isSeen('chapter-basics')).toBe(true);
  expect(screen.queryByText('Прогресс главы')).toBeNull();
});

test('does not start again once already seen', async () => {
  store.tour.markSeen('chapter-basics');
  renderChapterPage();
  render(<ChapterTour />);
  await nextFrame();
  expect(screen.queryByText('Прогресс главы')).toBeNull();
});

test('does nothing when the page has no progress bar', async () => {
  render(<ChapterTour />);
  await nextFrame();
  expect(document.querySelector('.driver-popover')).toBeNull();
  expect(store.tour.isSeen('chapter-basics')).toBe(false);
});
