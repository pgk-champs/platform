import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesDataSchemes } from './wavesData';

describe('схемы главы «Состояние аккаунта»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesDataSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesDataSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
