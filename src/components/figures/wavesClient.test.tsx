import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesClientSchemes } from './wavesClient';

describe('схемы главы «Клиент к Waves»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesClientSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesClientSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
