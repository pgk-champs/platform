import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitSelectSchemes } from './kitSelect';

describe('схемы главы «Селект и шторка»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitSelectSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitSelectSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
