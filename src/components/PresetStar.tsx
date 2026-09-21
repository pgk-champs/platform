import React, { useEffect, useState } from 'react';
import { store, type CustomPresetData } from '../lib/store';
import { GYM_CHAPTER_ID } from './chapterLabels';

// Звёздочка для НАБОРА упражнений — в конструкторе и на карточке каталога.
// До этого избранное умело только блок главы и слово: набор, собранный
// наставником или присланный ссылкой, положить туда было нельзя, и вернуться
// к нему можно было только закладкой браузера.
//
// В отличие от блока, здесь в избранное уезжает САМО упражнение (payload с
// данными движка), а не ссылка на место в главе: набор из каталога могут снять
// с публикации, а у студента он останется.

export type StarPreset = { name: string } & CustomPresetData;

export default function PresetStar({ id, preset }: { id: string; preset: StarPreset }) {
  // store читает localStorage ещё при импорте, поэтому до монтирования
  // состояние не спрашиваем — иначе первый клиентский рендер разойдётся с
  // серверным и React ругнётся на гидрацию.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFav = mounted && store.favorites.isFavorite(id);

  const toggle = () => {
    if (isFav) {
      store.favorites.remove(id);
      return;
    }
    store.favorites.add({
      id,
      type: 'preset',
      chapterId: GYM_CHAPTER_ID,
      title: preset.name,
      data: { kind: 'preset', ...preset },
    });
  };

  return (
    <button
      type="button"
      className={`block-fav ${isFav ? 'block-fav-on' : ''}`.trim()}
      onClick={toggle}
      aria-label={isFav ? `Убрать набор ${preset.name} из избранного` : `Набор ${preset.name} в избранное`}
      aria-pressed={isFav}
    >
      {isFav ? '★' : '☆'}
    </button>
  );
}
