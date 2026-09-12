import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricChaincodeSchemes } from './fabricChaincode';

describe('схемы главы «Смарт-контракт для Fabric»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricChaincodeSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricChaincodeSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
