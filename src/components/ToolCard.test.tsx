/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolCard from './ToolCard';

describe('ToolCard', () => {
  it('без embeddable — вся карточка ссылка, открывается в новой вкладке', () => {
    render(<ToolCard name="RegexOne" url="https://regexone.com/" desc="Пошаговый курс regex" />);
    const link = screen.getByText('RegexOne').closest('a');
    expect(link).toHaveAttribute('href', 'https://regexone.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('embeddable — без iframe до клика, кнопка «Открыть здесь» монтирует его', () => {
    render(<ToolCard name="explainshell" url="https://explainshell.com" desc="Разбор команды" embeddable />);
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Открыть здесь' }));
    const frame = document.querySelector('iframe');
    expect(frame).toHaveAttribute('src', 'https://explainshell.com');
    expect(frame).toHaveAttribute('loading', 'lazy');
    // кнопка открытия в новой вкладке остаётся доступной параллельно
    const external = screen.getByText('Открыть в новой вкладке').closest('a');
    expect(external).toHaveAttribute('href', 'https://explainshell.com');
    expect(external).toHaveAttribute('target', '_blank');
  });

  it('embeddable — повторный клик скрывает iframe', () => {
    render(<ToolCard name="cmdchallenge" url="https://cmdchallenge.com/" desc="Задачки в браузере" embeddable />);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть здесь' }));
    expect(document.querySelector('iframe')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }));
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });
});
