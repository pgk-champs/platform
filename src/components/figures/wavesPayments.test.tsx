import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { wavesPaymentsSchemes } from './wavesPayments';

describe('схемы главы «Платежи в dApp»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(wavesPaymentsSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{wavesPaymentsSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
