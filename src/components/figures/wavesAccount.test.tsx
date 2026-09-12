import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesAccountSchemes } from './wavesAccount';

describe('схемы главы «Аккаунт в Waves»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesAccountSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesAccountSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
