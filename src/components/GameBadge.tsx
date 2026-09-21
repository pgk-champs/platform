import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from '@docusaurus/Link';
import { store } from '../lib/store';
import { badgeState, badgeLabel } from '../lib/gameBadge';
import './accountNav.css';

// Постоянный след игрового слоя в шапке. До него игровой слой жил на трёх
// страницах из шестнадцати, а к 43 достижениям вела ровно одна ссылка — в
// меню аватара и только вошедшему. Прогресс при этом копится ЛОКАЛЬНО с
// первого клика, то есть у гостя он уже есть, просто был не показан.
//
// Показываем «k/43» всегда: у новичка это 0/43 — не похвала, а приглашение.
// Серию — только когда она есть: погасший огонёк это шум, а не мотивация.

export default function GameBadge({
  mobile,
  onClick,
}: {
  /** Docusaurus рендерит пункты навбара ДВАЖДЫ: в шапке и внутри бургера
   *  (Navbar/MobileSidebar/PrimaryMenu отдаёт им mobile и onClick). В бургере
   *  плашка неуместна — там список, поэтому рисуем обычный пункт меню. */
  mobile?: boolean;
  onClick?: () => void;
}): React.ReactElement | null {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // store поднимает localStorage ещё при импорте модуля, поэтому до монтирования
  // ничего не рисуем: первый клиентский рендер обязан совпасть с серверным.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const s = badgeState();
  const label = badgeLabel(s);

  if (mobile)
    return (
      <li className="menu__list-item">
        <Link className="menu__link" to="/achievements" onClick={onClick}>
          Достижения {s.unlocked}/{s.total}
          {s.streak > 0 ? ` · серия ${s.streak}` : ''}
        </Link>
      </li>
    );

  return (
    <Link className="xpb" to="/achievements" title={label} aria-label={label}>
      {s.streak > 0 && (
        <span className="xpb-streak">
          <span className="xpb-flame" aria-hidden="true" />
          {s.streak}
        </span>
      )}
      <span className="xpb-ach">
        {s.unlocked}
        <span className="xpb-slash" aria-hidden="true">
          /
        </span>
        {s.total}
      </span>
    </Link>
  );
}
