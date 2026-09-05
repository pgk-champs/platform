import { render, screen } from '@testing-library/react';
import { deviceFeaturesSchemes } from './deviceFeatures';

test('every deviceFeatures scheme renders an accessible svg', () => {
  expect(Object.keys(deviceFeaturesSchemes)).toEqual(['df-permission', 'df-notify-minute', 'df-widget-process']);
  for (const id of Object.keys(deviceFeaturesSchemes)) {
    const { unmount } = render(<>{deviceFeaturesSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'df-permission': ['первое и третье состояние для системы одинаковы', 'приложение обязано работать при любом отказе — это отдельный критерий'],
    'df-notify-minute': ['WorkManager молча поднял период до 15 минут', 'три ухода в фон, один короче минуты — правильный ответ два; первые два варианта его не дают'],
    'df-widget-process': ['виджету это всё недоступно', 'DataStore / Room — единственный мост'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{deviceFeaturesSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
