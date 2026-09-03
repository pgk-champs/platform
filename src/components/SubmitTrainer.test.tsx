/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubmitTrainer, { validateSubmission } from './SubmitTrainer';
import { SUBMIT_URL } from './CommunityCatalog';

const draft = (over: Partial<Parameters<typeof validateSubmission>[0]> = {}) => ({
  type: 'preset' as const,
  title: 'Словарь недели',
  chapter: '',
  dataRaw: '{"engine": "wordorder", "phrase": "please review my pull request"}',
  ...over,
});

describe('validateSubmission — те же правила, что у бота', () => {
  it('валидный wordorder-пресет проходит без замечаний', () => {
    expect(validateSubmission(draft())).toEqual([]);
  });

  it('битый JSON и пустой заголовок дают по причине на каждую ошибку', () => {
    const reasons = validateSubmission(draft({ title: '  ', dataRaw: '{oops' }));
    expect(reasons).toContain('Заголовок не может быть пустым.');
    expect(reasons).toContain('Данные пресета — не валидный JSON.');
  });

  it('wordorder из одного слова отклоняется', () => {
    expect(validateSubmission(draft({ dataRaw: '{"engine": "wordorder", "phrase": "hello"}' }))).toContain(
      'wordorder: phrase должна содержать минимум два слова.',
    );
  });

  it('неизвестный engine отклоняется', () => {
    expect(validateSubmission(draft({ dataRaw: '{"engine": "tetris"}' }))).toContain(
      'engine должен быть одним из: flashcards, wordorder, codetyping, predict.',
    );
  });

  it('flashcards без карточек отклоняется, с карточками — проходит', () => {
    expect(validateSubmission(draft({ dataRaw: '{"engine": "flashcards", "cards": []}' }))).toContain(
      'flashcards: нужен непустой массив cards из объектов {term, translation}.',
    );
    expect(
      validateSubmission(
        draft({ dataRaw: '{"engine": "flashcards", "cards": [{"term": "branch", "translation": "ветка"}]}' }),
      ),
    ).toEqual([]);
  });

  it('repo, link, video и source принимают только один https-адрес', () => {
    expect(validateSubmission(draft({ type: 'link', dataRaw: 'http://example.com' }))).toContain(
      'Для repo, link, video и source данные — это один https-адрес.',
    );
    expect(validateSubmission(draft({ type: 'link', dataRaw: 'просто текст' }))).toContain(
      'Для repo, link, video и source данные — это один https-адрес.',
    );
    expect(validateSubmission(draft({ type: 'repo', dataRaw: 'https://github.com/petya/app' }))).toEqual([]);
    expect(validateSubmission(draft({ type: 'source', dataRaw: 'https://kotlinlang.org/docs/home.html' }))).toEqual(
      [],
    );
  });

  it('video принимает только YouTube — как и бот на настоящей форме', () => {
    expect(validateSubmission(draft({ type: 'video', dataRaw: 'https://youtu.be/dQw4w9WgXcQ' }))).toEqual([]);
    expect(
      validateSubmission(draft({ type: 'video', dataRaw: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })),
    ).toEqual([]);
    expect(validateSubmission(draft({ type: 'video', dataRaw: 'https://rutube.ru/video/123/' }))).toContain(
      'video: ссылка должна вести на YouTube (youtube.com или youtu.be).',
    );
    // не YouTube, но и не video — источник такую ссылку принимает
    expect(validateSubmission(draft({ type: 'source', dataRaw: 'https://rutube.ru/video/123/' }))).toEqual([]);
  });

  it('неизвестный тип отклоняется сообщением бота со всеми пятью типами', () => {
    expect(
      validateSubmission(draft({ type: 'книга' as never, dataRaw: 'https://example.com/book' })),
    ).toContain('Тип должен быть preset, repo, link, video или source.');
  });

  it('слишком длинный заголовок отклоняется', () => {
    expect(validateSubmission(draft({ title: 'а'.repeat(121) }))).toContain('Заголовок длиннее 120 символов.');
  });

  it('глава: короткий id проходит, полный путь и заглавные буквы отклоняются', () => {
    expect(validateSubmission(draft({ chapter: 'git-first-commit' }))).toEqual([]);
    expect(validateSubmission(draft({ chapter: '' }))).toEqual([]);
    expect(validateSubmission(draft({ chapter: 'foundation/05-git-first-commit' }))).toContain(
      'Глава должна быть коротким id главы: строчные латинские буквы, цифры и дефис (например git-first-commit), без раздела и номера.',
    );
    expect(validateSubmission(draft({ chapter: 'Kotlin-Vars' }))).toContain(
      'Глава должна быть коротким id главы: строчные латинские буквы, цифры и дефис (например git-first-commit), без раздела и номера.',
    );
  });
});

describe('SubmitTrainer — форма', () => {
  it('успешная проверка показывает «прошло бы» и ссылку на настоящую форму, ничего не отправляя', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<SubmitTrainer />);

    fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Мой набор' } });
    fireEvent.change(screen.getByLabelText(/Данные/), {
      target: { value: '{"engine": "wordorder", "phrase": "git push origin main"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));

    expect(screen.getByText(/Прошло бы проверку/)).toBeInTheDocument();
    const real = screen.getByRole('link', { name: /по-настоящему/ });
    expect(real).toHaveAttribute('href', SUBMIT_URL);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('ошибки показываются списком с текстами бота', () => {
    render(<SubmitTrainer />);
    fireEvent.change(screen.getByLabelText(/Данные/), { target: { value: '{"engine": "wordorder"}' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));

    expect(screen.getByText(/вот что бот бы ответил/i)).toBeInTheDocument();
    expect(screen.getByText('Заголовок не может быть пустым.')).toBeInTheDocument();
    expect(screen.getByText('wordorder: phrase должна содержать минимум два слова.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /по-настоящему/ })).not.toBeInTheDocument();
  });

  it('плейсхолдер поля «Глава» сам проходит проверку — учит правильному формату, а не бага i3', () => {
    render(<SubmitTrainer />);
    const chapterInput = screen.getByLabelText(/Глава/) as HTMLInputElement;
    expect(chapterInput.placeholder).toMatch(/^[a-z0-9-]+$/);
  });
});

describe('SubmitTrainer — паритет с настоящей формой', () => {
  it('в списке типов есть все пять вариантов issue-формы', () => {
    render(<SubmitTrainer />);
    const select = screen.getByLabelText(/Тип/) as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(['preset', 'repo', 'link', 'video', 'source']);
  });

  it('video с не-YouTube ссылкой показывает сообщение бота про YouTube', () => {
    render(<SubmitTrainer />);
    fireEvent.change(screen.getByLabelText(/Тип/), { target: { value: 'video' } });
    fireEvent.change(screen.getByLabelText(/Заголовок/), { target: { value: 'Курс по Kotlin' } });
    fireEvent.change(screen.getByLabelText(/Данные/), { target: { value: 'https://vimeo.com/12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));

    expect(
      screen.getByText('video: ссылка должна вести на YouTube (youtube.com или youtu.be).'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Данные/), {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(screen.getByText(/Прошло бы проверку/)).toBeInTheDocument();
  });
});
