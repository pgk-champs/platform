import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitIconFontSchemes } from './kitIconFont';

describe('схемы главы «Иконочный шрифт»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitIconFontSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitIconFontSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
