import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricNetworkSchemes } from './fabricNetwork';

describe('схемы главы «Устройство сети Fabric»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricNetworkSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricNetworkSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
