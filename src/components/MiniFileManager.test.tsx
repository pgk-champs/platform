import { render, screen, fireEvent, within } from '@testing-library/react';
import { store } from '../lib/store';
import MiniFileManager from './MiniFileManager';

beforeEach(() => {
  store.__resetForTests();
});

// jsdom не реализует DataTransfer/DragEvent (jsdom#1568) — Testing Library
// сама подставляет объект инициализации как есть, если window.DataTransfer
// не функция-конструктор, так что простой mock отражает реальный протокол.
function makeDataTransfer() {
  const data: Record<string, string> = {};
  return {
    setData: (type: string, val: string) => {
      data[type] = val;
    },
    getData: (type: string) => data[type] ?? '',
    effectAllowed: 'all',
  };
}

// fireEvent.drop с ctrlKey/shiftKey не работает в jsdom: 'drop' маппится на
// EventType 'DragEvent', которого в jsdom нет, поэтому Testing Library падает
// назад на голый window.Event — а его конструктор молча игнорирует ctrlKey/
// shiftKey (они не часть EventInit). MouseEvent их читает по спецификации,
// а React у 'drop' смотрит именно на DragEventInterface (ctrlKey/shiftKey/
// dataTransfer) независимо от реального класса нативного события — собираем
// событие вручную и дописываем dataTransfer как в самой Testing Library.
function dispatchDrop(target: Element, dataTransfer: unknown, init: { ctrlKey?: boolean; shiftKey?: boolean } = {}) {
  const event = new MouseEvent('drop', { bubbles: true, cancelable: true, ...init });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  fireEvent(target, event);
}

test('пять файлов на старте, все в исходной панели', () => {
  render(<MiniFileManager />);
  expect(screen.getByText(/report.txt/)).toBeTruthy();
  expect(screen.getByText(/photo.jpg/)).toBeTruthy();
  expect(screen.getByText(/todo.txt/)).toBeTruthy();
});

test('Ctrl+клик добавляет к выбору, обычный клик сбрасывает выбор до одного файла', () => {
  render(<MiniFileManager />);
  const report = screen.getByText(/report.txt/);
  const notes = screen.getByText(/notes.txt/);
  fireEvent.click(report);
  fireEvent.click(notes, { ctrlKey: true });
  expect(report.className).toContain('mfm-file-selected');
  expect(notes.className).toContain('mfm-file-selected');

  fireEvent.click(report);
  expect(report.className).toContain('mfm-file-selected');
  expect(notes.className).not.toContain('mfm-file-selected');
});

test('Shift+клик выбирает диапазон', () => {
  render(<MiniFileManager />);
  const report = screen.getByText(/report.txt/); // индекс 0
  const archive = screen.getByText(/archive_old.zip/); // индекс 3
  fireEvent.click(report);
  fireEvent.click(archive, { shiftKey: true });
  ['report.txt', 'photo.jpg', 'notes.txt', 'archive_old.zip'].forEach((name) => {
    expect(screen.getByText(new RegExp(name)).className).toContain('mfm-file-selected');
  });
  expect(screen.getByText(/todo.txt/).className).not.toContain('mfm-file-selected');
});

test('переименование через F2: инпут, Enter подтверждает, журнал получает mv', () => {
  const { container } = render(<MiniFileManager />);
  fireEvent.click(screen.getByText(/report.txt/));
  fireEvent.keyDown(container.querySelector('.mfm-list')!, { key: 'F2' });
  const input = container.querySelector('.mfm-rename-input') as HTMLInputElement;
  expect(input.value).toBe('report.txt');
  fireEvent.change(input, { target: { value: 'summary.txt' } });
  fireEvent.keyDown(input, { key: 'Enter' });

  expect(within(container.querySelector('.mfm-list')!).getByText(/summary.txt/)).toBeTruthy();
  expect(screen.getByText('$ mv report.txt summary.txt')).toBeTruthy();
});

test('ПКМ открывает меню «Переименовать», клик по нему включает переименование', () => {
  const { container } = render(<MiniFileManager />);
  const notes = screen.getByText(/notes.txt/);
  fireEvent.contextMenu(notes);
  const menu = container.querySelector('.mfm-menu');
  expect(menu).toBeTruthy();
  fireEvent.click(within(menu as HTMLElement).getByText('Переименовать (F2)'));
  expect(container.querySelector('.mfm-rename-input')).toBeTruthy();
});

test('перетаскивание в Архив без модификатора — перемещение (mv), файл исчезает из источника', () => {
  const { container } = render(<MiniFileManager />);
  const dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/photo.jpg/), { dataTransfer: dt });
  const archiveZone = container.querySelectorAll('.mfm-zone')[0];
  fireEvent.drop(archiveZone, { dataTransfer: dt });

  expect(screen.getByText('$ mv photo.jpg Архив/')).toBeTruthy();
  expect(within(archiveZone as HTMLElement).getByText(/photo.jpg/)).toBeTruthy();
  expect(container.querySelector('.mfm-pane')!.textContent).not.toContain('photo.jpg');
});

test('перетаскивание на Диск D: без модификатора — копирование (cp), оригинал остаётся', () => {
  const { container } = render(<MiniFileManager />);
  const dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/todo.txt/), { dataTransfer: dt });
  const diskZone = container.querySelectorAll('.mfm-zone')[1];
  fireEvent.drop(diskZone, { dataTransfer: dt });

  expect(screen.getByText('$ cp todo.txt D:/')).toBeTruthy();
  expect(within(diskZone as HTMLElement).getByText(/todo.txt/)).toBeTruthy();
  expect(container.querySelector('.mfm-pane')!.textContent).toContain('todo.txt'); // оригинал никуда не делся
});

test('Ctrl+перетаскивание в Архив переворачивает поведение на копирование', () => {
  const { container } = render(<MiniFileManager />);
  const dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/report.txt/), { dataTransfer: dt });
  const archiveZone = container.querySelectorAll('.mfm-zone')[0];
  dispatchDrop(archiveZone, dt, { ctrlKey: true });

  expect(screen.getByText('$ cp report.txt Архив/')).toBeTruthy();
  expect(container.querySelector('.mfm-pane')!.textContent).toContain('report.txt');
});

test('Shift+перетаскивание на Диск D: переворачивает поведение на перемещение', () => {
  const { container } = render(<MiniFileManager />);
  const dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/notes.txt/), { dataTransfer: dt });
  const diskZone = container.querySelectorAll('.mfm-zone')[1];
  dispatchDrop(diskZone, dt, { shiftKey: true });

  expect(screen.getByText('$ mv notes.txt D:/')).toBeTruthy();
  expect(container.querySelector('.mfm-pane')!.textContent).not.toContain('notes.txt');
});

test('после переименования, перемещения и копирования — «Готово», запись в store и XP', () => {
  const { container } = render(<MiniFileManager chapterId="linux-terminal" trainerId="trainer-file-manager" />);

  fireEvent.click(screen.getByText(/report.txt/));
  fireEvent.keyDown(container.querySelector('.mfm-list')!, { key: 'F2' });
  fireEvent.change(container.querySelector('.mfm-rename-input') as HTMLInputElement, {
    target: { value: 'summary.txt' },
  });
  fireEvent.keyDown(container.querySelector('.mfm-rename-input') as HTMLInputElement, { key: 'Enter' });

  let dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/photo.jpg/), { dataTransfer: dt });
  fireEvent.drop(container.querySelectorAll('.mfm-zone')[0], { dataTransfer: dt });

  dt = makeDataTransfer();
  fireEvent.dragStart(screen.getByText(/todo.txt/), { dataTransfer: dt });
  fireEvent.drop(container.querySelectorAll('.mfm-zone')[1], { dataTransfer: dt });

  expect(screen.getByText(/Готово! Переименование, перемещение и копирование опробованы/)).toBeTruthy();
  expect(store.getProgress().trainers['linux-terminal']?.['trainer-file-manager']).toMatchObject({
    result: { rename: true, move: true, copy: true },
  });
  expect(store.getXp()).toBe(20);
});
