import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricLifecycleSchemes } from './fabricLifecycle';

describe('схемы главы «Жизненный цикл чейнкода»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricLifecycleSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricLifecycleSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
