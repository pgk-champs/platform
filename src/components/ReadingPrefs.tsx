import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Настройки чтения — в самой главе, а не в кабинете: они нужны ровно тогда,
// когда читаешь, и уходить за ними на другую страницу никто не станет. Живут
// рядом с «Содержанием главы», которое стоит в 137 главах из 137.
//
// Что здесь есть и почему именно это:
// — кегль: растёт ТЕКСТ, а не макет. Браузерный зум масштабирует и сайдбар, и
//   колонку, и двухколоночная страница ломается; читают часто с чужих
//   колледжных машин, где системные настройки не поменять;
// — спокойный режим: то же, что системное «уменьшить движение», но по своему
//   решению. В Windows системная настройка спрятана глубоко, а появление
//   лесенкой играет на КАЖДОМ переходе между главами.

const SIZES: { id: string; label: string; title: string }[] = [
  { id: 'm', label: 'A', title: 'Обычный' },
  { id: 'l', label: 'A', title: 'Крупнее' },
  { id: 'xl', label: 'A', title: 'Ещё крупнее' },
];

export default function ReadingPrefs(): React.ReactElement | null {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  const [open, setOpen] = useState(false);
  // store читает localStorage при импорте — до монтирования не спрашиваем,
  // иначе первый клиентский рендер разойдётся с серверным.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const size = store.prefs.getRead();
  const calm = store.prefs.getMotion() === 'calm';

  return (
    <div className="rp">
      <button
        type="button"
        className="rp-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        title="Как читать: размер текста и движение"
      >
        Aa
      </button>
      {open ? (
        <div className="rp-panel" role="group" aria-label="Настройки чтения">
          <div className="rp-row">
            <span className="rp-label">Размер текста</span>
            <span className="rp-sizes">
              {SIZES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`rp-size ${size === s.id ? 'rp-on' : ''}`.trim()}
                  style={{ fontSize: `${0.85 + i * 0.2}rem` }}
                  aria-pressed={size === s.id}
                  title={s.title}
                  onClick={() => store.prefs.setRead(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </span>
          </div>
          <label className="rp-row rp-calm">
            <input
              type="checkbox"
              checked={store.prefs.getTocDefault() === 'closed'}
              onChange={(e) => store.prefs.setTocDefault(e.target.checked ? 'closed' : 'open')}
            />
            <span>
              Оглавление свёрнуто
              <span className="rp-hint">по умолчанию во всех главах</span>
            </span>
          </label>
          <label className="rp-row rp-calm">
            <input
              type="checkbox"
              checked={calm}
              onChange={(e) => store.prefs.setMotion(e.target.checked ? 'calm' : 'full')}
            />
            <span>
              Спокойный режим
              <span className="rp-hint">без появлений и плавной прокрутки</span>
            </span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
