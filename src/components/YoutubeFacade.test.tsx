/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YoutubeFacade, { extractYoutubeVideoId } from './YoutubeFacade';

describe('extractYoutubeVideoId', () => {
  it('парсит watch?v=, youtu.be, embed и shorts', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=I1M5aSadK_I')).toBe(
      'I1M5aSadK_I',
    );
    expect(extractYoutubeVideoId('https://youtu.be/da3Kpc0UNjU')).toBe('da3Kpc0UNjU');
    expect(extractYoutubeVideoId('https://www.youtube.com/embed/m-GIJOEh798')).toBe(
      'm-GIJOEh798',
    );
    expect(extractYoutubeVideoId('https://www.youtube.com/shorts/d5rvy5XPyzk')).toBe(
      'd5rvy5XPyzk',
    );
  });

  it('игнорирует лишние параметры после id', () => {
    expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=Y1fjIG7S_F0&t=42s')).toBe(
      'Y1fjIG7S_F0',
    );
  });

  it('не находит id у плейлиста и у произвольной ссылки', () => {
    expect(
      extractYoutubeVideoId('https://www.youtube.com/playlist?list=PLgPRahgE-Gcu4s-I9mrHUrKUp9dY6QcJC'),
    ).toBeNull();
    expect(extractYoutubeVideoId('https://kotlinlang.org/docs/basic-syntax.html')).toBeNull();
  });
});

describe('YoutubeFacade', () => {
  it('на первом рендере — только превью-картинка и настоящая кнопка, без iframe', () => {
    render(<YoutubeFacade videoId="I1M5aSadK_I" title="GitHub регистрация" />);
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /GitHub регистрация/ });
    expect(btn).toBeInTheDocument();
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://i.ytimg.com/vi/I1M5aSadK_I/hqdefault.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('клик по кнопке монтирует iframe на youtube-nocookie.com', () => {
    render(<YoutubeFacade videoId="I1M5aSadK_I" title="GitHub регистрация" />);
    fireEvent.click(screen.getByRole('button', { name: /GitHub регистрация/ }));
    const frame = document.querySelector('iframe');
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/I1M5aSadK_I?autoplay=1',
    );
    expect(frame).toHaveAttribute('title', 'GitHub регистрация');
    expect(frame).toHaveAttribute('allowfullscreen');
  });
});
