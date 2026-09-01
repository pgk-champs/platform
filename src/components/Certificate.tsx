import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import { certShareText } from '../lib/integrations';
import ShareResult from './ShareResult';
import './trainers.css';

// Сертификат трека. Пока не все главы пройдены — прогресс до сертификата.
// Когда все — кнопка открывает модал с canvas-сертификатом (1200x850):
// имя запоминается в store.prefs.name, PNG скачивается через toDataURL.

const W = 1200;
const H = 850;

// Палитра сертификата фиксированная (это самостоятельный PNG «под печать»,
// тема сайта на него не влияет): пергамент, тёмно-синий, золото.
const BG = '#fbf7ee';
const INK = '#1c3d5a';
const GOLD = '#b8860b';

function drawCertificate(
  canvas: HTMLCanvasElement,
  opts: { name: string; track: string; chapters: number; xp: number; date: string },
): void {
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return; // jsdom / очень старый браузер
  }
  if (!ctx) return;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Рамка: толстая синяя + тонкая золотая
  ctx.strokeStyle = INK;
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('PGK Champs', W / 2, 160);

  ctx.fillStyle = GOLD;
  ctx.font = '600 34px Georgia, serif';
  ctx.fillText('СЕРТИФИКАТ', W / 2, 230);

  ctx.fillStyle = INK;
  ctx.font = '26px Georgia, serif';
  ctx.fillText('подтверждает, что', W / 2, 310);

  ctx.font = 'italic bold 56px Georgia, serif';
  ctx.fillText(opts.name || '________________', W / 2, 400);

  ctx.font = '28px Georgia, serif';
  ctx.fillText(`прошёл(ла) трек «${opts.track}»`, W / 2, 480);
  ctx.fillText(`${opts.chapters} глав, ${opts.xp} XP`, W / 2, 530);

  // Разделительная линия
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 570);
  ctx.lineTo(W / 2 + 200, 570);
  ctx.stroke();

  // Дата слева
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = '24px Georgia, serif';
  ctx.fillText(`Дата: ${opts.date}`, 110, H - 130);

  // Эмблема справа: золотой круг с кубком и подписью
  const ex = W - 200;
  const ey = H - 190;
  ctx.beginPath();
  ctx.arc(ex, ey, 78, 0, Math.PI * 2);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = '64px serif';
  ctx.fillText('🏆', ex, ey + 14);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('PGK', ex, ey + 52);
}

export default function Certificate({
  track,
  total,
  passed,
}: {
  track: string;
  total: number;
  passed: number;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const done = total > 0 && passed >= total;

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    drawCertificate(canvasRef.current, {
      name,
      track,
      chapters: total,
      xp: store.getXp(),
      date: new Date().toLocaleDateString('ru-RU'),
    });
  }, [open, name, track, total]);

  if (!done) {
    return (
      <div className="cert-progress">
        Пройдено {passed} из {total} глав до сертификата трека
      </div>
    );
  }

  const openModal = () => {
    setName(store.prefs.getName() ?? '');
    setOpen(true);
  };

  const onNameChange = (v: string) => {
    setName(v);
    store.prefs.setName(v);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `pgk-champs-certificate-${track}.png`;
    a.click();
  };

  return (
    <div className="cert">
      <button type="button" className="button button--primary" onClick={openModal}>
        Получить сертификат
      </button>
      {open ? (
        <div
          className="cert-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Сертификат трека"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="cert-modal">
            <div className="cert-modal-head">
              <label className="cert-name-label">
                Имя на сертификате{' '}
                <input
                  type="text"
                  value={name}
                  placeholder="Иван Иванов"
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="cert-close"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <canvas ref={canvasRef} width={W} height={H} className="cert-canvas" />
            <div className="cert-actions">
              <button type="button" className="button button--primary" onClick={download}>
                Скачать PNG
              </button>
              <ShareResult text={certShareText(track, total)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
