import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesSmartAccountSchemes } from './wavesSmartAccount';

describe('схемы главы «Смарт-аккаунт»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesSmartAccountSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesSmartAccountSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
