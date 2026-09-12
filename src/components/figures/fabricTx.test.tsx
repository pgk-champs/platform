import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricTxSchemes } from './fabricTx';

describe('схемы главы «Путь транзакции в Fabric»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricTxSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricTxSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
