import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { sdachaRepoSchemes } from './sdachaRepo';

describe('схемы главы «Сдача работы»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(sdachaRepoSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{sdachaRepoSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
