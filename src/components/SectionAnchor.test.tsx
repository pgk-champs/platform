import { render } from '@testing-library/react';
import { store } from '../lib/store';
import SectionAnchor from './SectionAnchor';

type FakeEntry = {
  isIntersecting: boolean;
  boundingClientRect: { bottom: number };
  rootBounds: { top: number } | null;
};
type IOCallback = (entries: FakeEntry[]) => void;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IOCallback;
  observed = 0;
  disconnected = false;

  constructor(callback: IOCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe() {
    this.observed += 1;
  }

  unobserve() {
    // not used by SectionAnchor, kept for interface completeness
  }

  disconnect() {
    this.disconnected = true;
  }

  /** bottom — где нижний край метки относительно окна: <0 значит «уехала вверх». */
  trigger(isIntersecting: boolean, bottom = isIntersecting ? 300 : 900) {
    this.callback([{ isIntersecting, boundingClientRect: { bottom }, rootBounds: { top: 0 } }]);
  }
}

beforeEach(() => {
  store.__resetForTests();
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as unknown as typeof IntersectionObserver);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('marks the section read after 2s of continuous visibility', () => {
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  const io = FakeIntersectionObserver.instances[0];
  expect(io.observed).toBe(1);

  io.trigger(true);
  expect(store.isSectionRead('typing', 'intro')).toBe(false);

  vi.advanceTimersByTime(1999);
  expect(store.isSectionRead('typing', 'intro')).toBe(false);

  vi.advanceTimersByTime(1);
  expect(store.isSectionRead('typing', 'intro')).toBe(true);
});

test('leaving the viewport before 2s cancels the dwell timer', () => {
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  const io = FakeIntersectionObserver.instances[0];

  io.trigger(true);
  vi.advanceTimersByTime(1000);
  io.trigger(false);
  vi.advanceTimersByTime(2000);

  expect(store.isSectionRead('typing', 'intro')).toBe(false);
});

test('a section already marked read does not observe again', () => {
  store.setSectionRead('typing', 'intro');
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  expect(FakeIntersectionObserver.instances).toHaveLength(0);
});

test('renders nothing but an invisible marker (SSR/no-op safe without IntersectionObserver)', () => {
  vi.unstubAllGlobals();
  vi.stubGlobal('IntersectionObserver', undefined);
  expect(() => render(<SectionAnchor chapterId="typing" sectionId="outro" />)).not.toThrow();
  expect(store.isSectionRead('typing', 'outro')).toBe(false);
});

test('пролистал секцию до конца — засчитывается сразу, без ожидания', () => {
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  const io = FakeIntersectionObserver.instances[0];

  io.trigger(true); // метка показалась на экране
  io.trigger(false, -20); // и уехала вверх — секция прочитана целиком

  expect(store.isSectionRead('typing', 'intro')).toBe(true);
});

test('метка ещё ниже экрана — секция не засчитывается', () => {
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  const io = FakeIntersectionObserver.instances[0];

  io.trigger(false, 1200); // конец секции далеко внизу
  io.trigger(false, 800);
  vi.advanceTimersByTime(5000);

  expect(store.isSectionRead('typing', 'intro')).toBe(false);
});

test('заход по ссылке в середину главы не засчитывает секции выше', () => {
  render(<SectionAnchor chapterId="typing" sectionId="intro" />);
  const io = FakeIntersectionObserver.instances[0];

  // Первая же доставка от наблюдателя: метка уже за верхним краем экрана.
  io.trigger(false, -400);
  vi.advanceTimersByTime(5000);

  expect(store.isSectionRead('typing', 'intro')).toBe(false);
});
