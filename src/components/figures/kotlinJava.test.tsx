import { render, screen } from '@testing-library/react';
import { kotlinJavaSchemes } from './kotlinJava';

test('every kotlinJava scheme renders an accessible svg', () => {
  expect(Object.keys(kotlinJavaSchemes)).toEqual([
    'kj-same-program',
    'kj-jvm-bytecode',
    'kj-null-safety',
    'kj-interop',
  ]);
  for (const id of Object.keys(kotlinJavaSchemes)) {
    const { unmount } = render(<>{kotlinJavaSchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'kj-same-program': ['public class User {', 'data class User(val name: String)', 'одна строка вместо девяти'],
    'kj-jvm-bytecode': ['User.java', 'User.kt', 'байткод .class', 'JVM'],
    'kj-null-safety': ['NullPointerException', 'val n = name?.length ?: 0', 'код просто не собирается'],
    'kj-interop': ['LegacyParser.java', 'ProfileScreen.kt', 'Kotlin вызывает Java', 'Java вызывает Kotlin'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{kotlinJavaSchemes[id](`схема ${id}`)}</>);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});
