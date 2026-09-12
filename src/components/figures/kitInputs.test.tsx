import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { kitInputsSchemes } from './kitInputs';

describe('схемы главы «Поля ввода»', () => {
  it('рисуют три схемы с доступным описанием', () => {
    const ids = Object.keys(kitInputsSchemes);
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const { container, unmount } = render(<svg>{kitInputsSchemes[id]('описание ' + id)}</svg>);
      expect(container.querySelector('[aria-label]')).not.toBeNull();
      unmount();
    }
  });
});
