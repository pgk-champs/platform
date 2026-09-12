import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { sprintFlowSchemes } from './sprintFlow';

describe('схемы главы «Формат чемпионата»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(sprintFlowSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{sprintFlowSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
