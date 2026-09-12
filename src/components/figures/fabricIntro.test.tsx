import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { fabricIntroSchemes } from './fabricIntro';

describe('схемы главы «Приватный блокчейн»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(fabricIntroSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{fabricIntroSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
