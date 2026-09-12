import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitBarsSchemes } from './kitBars';

describe('схемы главы «Хэдер и TabBar»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitBarsSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitBarsSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
