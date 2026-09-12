import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { demoShowSchemes } from './demoShow';

describe('схемы главы «Демонстрация решения»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(demoShowSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{demoShowSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
