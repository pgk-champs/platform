import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitButtonsSchemes } from './kitButtons';

describe('схемы главы «Компонент библиотеки»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitButtonsSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitButtonsSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
