import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitSearchSchemes } from './kitSearch';

describe('схемы главы «Поиск»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitSearchSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitSearchSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
