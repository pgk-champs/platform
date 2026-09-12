import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitCardSchemes } from './kitCard';

describe('схемы главы «Карточка и адаптивность»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitCardSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitCardSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
