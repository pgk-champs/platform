import React, { useEffect, useState } from 'react';
import { fetchMyMaterials, isLoggedIn, type MyMaterial } from '../lib/account';
import { chapterTitle } from './chapterLabels';
import './trainers.css';

// Что я прислал в каталог и чем это кончилось.
//
// До этого автор отправлял материал и больше не узнавал ничего: ни «принято»,
// ни «отклонено» не показывалось нигде, и человек либо считал, что его
// проигнорировали, либо присылал то же самое второй раз.

const STATUS: Record<string, string> = {
  pending: 'на проверке',
  approved: 'принято',
  rejected: 'отклонено',
};

export default function MyMaterials(): React.ReactElement | null {
  const [items, setItems] = useState<MyMaterial[] | null>(null);
  useEffect(() => {
    if (isLoggedIn()) fetchMyMaterials().then(setItems);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="cc-mine">
      <h3>Моё</h3>
      <ul className="cc-mine-list">
        {items.map((i) => (
          <li key={i.id} className={`cc-mine-row cc-mine-${i.status}`}>
            <span className="cc-mine-status">{STATUS[i.status] ?? i.status}</span>
            <span className="cc-mine-title">{i.title}</span>
            {i.chapterId ? <span className="cc-tag">{chapterTitle(i.chapterId)}</span> : null}
            <span className="ac-muted">{i.addedAt}</span>
          </li>
        ))}
      </ul>
      {items.some((i) => i.status === 'rejected') ? (
        <p className="ac-muted">
          Отклонённое не пропало зря: чаще всего дело в мёртвой ссылке или в том, что такой материал уже есть.
          Можно прислать другой.
        </p>
      ) : null}
    </section>
  );
}
