import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { layoutCardSchemes } from './layoutCard';

describe('схемы главы «Карточка по макету»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(layoutCardSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{layoutCardSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
