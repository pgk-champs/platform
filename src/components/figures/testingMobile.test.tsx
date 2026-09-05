import { render, screen } from '@testing-library/react';
import { testingMobileSchemes } from './testingMobile';

test('every testingMobile scheme renders an accessible svg', () => {
  expect(Object.keys(testingMobileSchemes)).toEqual(['tm-coverage', 'tm-fake-vs-real', 'tm-mockwebserver']);
  for (const id of Object.keys(testingMobileSchemes)) {
    const { unmount } = render(<>{testingMobileSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'tm-coverage': ['руками все три неразличимы — разницу показал только набор кейсов', 'руками проверено 3 из 14 = 21% покрытия'],
    'tm-fake-vs-real': ['упало 2 из 20 — код не менялся, моргнула сеть', 'в приложении Repository(), в тесте Repository(FakeApi())'],
    'tm-mockwebserver': ['ЗЕЛЁНЫЙ — а на живом сервере это 400', 'проверять надо и ответ, и то, что ушло'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{testingMobileSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
