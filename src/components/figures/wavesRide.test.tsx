import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesRideSchemes } from './wavesRide';

describe('схемы главы «Язык RIDE»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesRideSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesRideSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
