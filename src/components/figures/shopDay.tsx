import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Конкурсный день»: порядок работ, вертикальный срез
 * против горизонтального, приёмочный прогон. */

export const shopDaySchemes: Schemes = {
  'sday-order': (aria) => (
    <Panel id="fig-sday-ord" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОРЯДОК, КОТОРЫЙ ОКУПАЕТСЯ</text>

      {[
        { x: 30, n: '1', t: 'каркас сети', d: 'клиент, DTO, один запрос', m: '20 мин' },
        { x: 226, n: '2', t: 'вход', d: 'токен, хранилище, интерцептор', m: '40 мин' },
        { x: 422, n: '3', t: 'каталог', d: 'список и карточка', m: '60 мин' },
        { x: 618, n: '4', t: 'корзина', d: 'и заказ', m: '60 мин' },
      ].map((s) => (
        <g key={s.x}>
          <rect x={s.x} y={72} width={172} height={96} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
          <circle cx={s.x + 24} cy={96} r={13} fill={ACCENT} />
          <text x={s.x + 24} y={101} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ifm-color-primary-darkest)">{s.n}</text>
          <text x={s.x + 46} y={101} fontSize={12.5} fill="#fff">{s.t}</text>
          <text x={s.x + 16} y={130} fontSize={11} fill={FADE}>{s.d}</text>
          <text x={s.x + 16} y={152} fontSize={11} fontFamily={MONO} fill={ACCENT}>{s.m}</text>
        </g>
      ))}
      <Arrow x1={206} y1={120} x2={222} y2={120} color={INK} w={3} />
      <Arrow x1={402} y1={120} x2={418} y2={120} color={INK} w={3} />
      <Arrow x1={598} y1={120} x2={614} y2={120} color={INK} w={3} />

      <rect x={30} y={196} width={760} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={224} fontSize={12} fill={ACCENT}>дальше по остатку времени: акции · профиль · проекты · отказы · офлайн</text>

      <text x={30} y={270} fontSize={12.5} fill="#fff">вход раньше каталога — потому что без токена половина запросов вернёт 404</text>
      <text x={30} y={298} fontSize={12.5} fill={FADE}>красивый экран без данных не стоит ничего: критерии смотрят на работу, а не на вёрстку</text>
    </Panel>
  ),

  'sday-slice': (aria) => (
    <Panel id="fig-sday-slice" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА СПОСОБА ПОТРАТИТЬ ДЕНЬ</text>

      <text x={30} y={72} fontSize={12.5} fill="#fff">по слоям: к обеду ничего не работает</text>
      {[
        { x: 30, t: 'все DTO', done: true },
        { x: 216, t: 'все запросы', done: true },
        { x: 402, t: 'все экраны', done: false },
        { x: 588, t: 'связать', done: false },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={84} width={172} height={44} rx={10}
            fill={b.done ? 'rgba(255,255,255,0.12)' : 'transparent'}
            stroke={b.done ? INK : SOFT} strokeWidth={2} strokeDasharray={b.done ? undefined : '5 4'} />
          <text x={b.x + 86} y={111} textAnchor="middle" fontSize={12} fill={b.done ? '#fff' : FADE}>{b.t}</text>
        </g>
      ))}

      <text x={30} y={172} fontSize={12.5} fill={ACCENT}>по срезам: после каждого шага что-то работает целиком</text>
      {[
        { x: 30, t: 'каталог' },
        { x: 216, t: '+ вход' },
        { x: 402, t: '+ корзина' },
        { x: 588, t: '+ заказ' },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={184} width={172} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={b.x + 86} y={211} textAnchor="middle" fontSize={12} fill={ACCENT}>{b.t}</text>
        </g>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">если день кончится раньше плана, во втором случае есть что показать, а в первом нет</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>эксперт оценивает работающее поведение, а не количество написанных классов</text>
    </Panel>
  ),

  'sday-checklist': (aria) => (
    <Panel id="fig-sday-chk" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПРИЁМОЧНЫЙ ПРОГОН ПЕРЕД СДАЧЕЙ</text>

      {[
        { y: 64, n: '1—4', t: 'регистрация · вход · профиль · изменение', c: 'users' },
        { y: 108, n: '5—8', t: 'акции · каталог · поиск · карточка', c: 'news, products' },
        { y: 152, n: '9—11', t: 'корзина · количество · заказ', c: 'cart, orders' },
        { y: 196, n: '12—14', t: 'проект с файлом · список · сессии', c: 'project, _authOrigins' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={34} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={48} y={r.y + 22} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.n}</text>
          <text x={112} y={r.y + 22} fontSize={12} fill="#fff">{r.t}</text>
          <text x={600} y={r.y + 22} fontSize={11} fontFamily={MONO} fill={FADE}>{r.c}</text>
        </g>
      ))}

      <rect x={30} y={244} width={760} height={36} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={48} y={267} fontSize={12} fontFamily={MONO} fill="#fff">Пройдено: 15 из 15</text>

      <text x={30} y={302} fontSize={12.5} fill={ACCENT}>прогон занимает секунды и ловит то, что глазами по экранам не поймать</text>
    </Panel>
  ),
};
