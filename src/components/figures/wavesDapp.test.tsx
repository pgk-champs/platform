import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesDappSchemes } from './wavesDapp';

describe('схемы главы «dApp на RIDE»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesDappSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesDappSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
