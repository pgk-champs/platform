import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricVsEthSchemes } from './fabricVsEth';

describe('схемы главы «Fabric и Ethereum»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricVsEthSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricVsEthSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
