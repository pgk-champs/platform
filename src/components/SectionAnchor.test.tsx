import { render } from '@testing-library/react';
import { store } from '../lib/store';
import SectionAnchor from './SectionAnchor';

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;

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

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
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
