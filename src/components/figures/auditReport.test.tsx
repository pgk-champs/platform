import { render, screen } from '@testing-library/react';
import { auditReportSchemes } from './auditReport';

test('every auditReport scheme renders an accessible svg', () => {
  expect(Object.keys(auditReportSchemes)).toEqual(['ar-triage', 'ar-severity', 'ar-finding']);
  for (const id of Object.keys(auditReportSchemes)) {
    const { unmount } = render(<>{auditReportSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'ar-triage': ['разбор — не «исправить всё»: у части находок правильный ответ «так задумано, и вот почему»'],
    'ar-severity': ['«теоретически возможно, но только если владелец сам себе навредит» — это не критично'],
    'ar-finding': ['находка без «чем грозит» и «как чинить» — это не находка, а строчка из вывода инструмента'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{auditReportSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
