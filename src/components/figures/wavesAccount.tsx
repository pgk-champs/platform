import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Аккаунт в Waves»: цепочка сид → ключи → адрес,
 * зависимость адреса от сети и два вида баланса. */

export const wavesAccountSchemes: Schemes = {
  'wa-seed-to-address': (aria) => (
    <Panel id="fig-wa-seed" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЦЕПОЧКА В ОДНУ СТОРОНУ: ИЗ АДРЕСА СИД НЕ ДОСТАТЬ</text>

      {[
        { x: 30, t: 'Сид-фраза', s: 'olegs test seed…', d: 'то, что запоминают' },
        { x: 230, t: 'Закрытый ключ', s: '32 байта', d: 'им подписывают' },
        { x: 430, t: 'Публичный ключ', s: 'BHXwGxyKaih2…', d: 'им проверяют' },
        { x: 630, t: 'Адрес', s: '3MDKRTnd5H6z…', d: 'его показывают' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={96} rx={11}
            fill={i === 0 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 0 ? ACCENT : INK} strokeWidth={2} />
          <text x={c.x + 16} y={92} fontSize={12} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 16} y={116} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>{c.s}</text>
          <text x={c.x + 16} y={142} fontSize={10.5} fill={FADE}>{c.d}</text>
          {i < 3 && <Arrow x1={c.x + 168} y1={114} x2={c.x + 222} y2={114} color={ACCENT} w={2.2} />}
        </g>
      ))}

      <text x={30} y={206} fontSize={12.5} fill="#fff">каждый шаг — обычная математика: один и тот же сид всегда даёт один и тот же адрес</text>
      <text x={30} y={230} fontSize={12.5} fill={FADE}>сервер аккаунты не заводит: адрес существует ещё до первой транзакции, просто с нулём на счету</text>
      <text x={30} y={258} fontSize={12.5} fill={ACCENT}>потерять сид — потерять доступ навсегда: восстановить его не может никто, включая разработчиков сети</text>
      <text x={30} y={282} fontSize={12.5} fill={FADE}>показать сид кому-то — отдать деньги: он и есть единственный пароль</text>
    </Panel>
  ),

  'wa-chain-id': (aria) => (
    <Panel id="fig-wa-chain" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН СИД, РАЗНЫЕ СЕТИ — РАЗНЫЕ АДРЕСА</text>

      {[
        { y: 66, c: "'W'", n: 'основная сеть', a: '3PE1SPL7Wq1KBxnC73XrK1dJLiu4em1e7BM', p: '3P' },
        { y: 122, c: "'T'", n: 'тестовая сеть', a: '3N…', p: '3N' },
        { y: 178, c: "'R'", n: 'локальный узел', a: '3MDKRTnd5H6zoscVfvSBiazwQaNmwDouJDx', p: '3M' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={90} height={42} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={75} y={r.y + 27} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>{r.c}</text>
          <text x={136} y={r.y + 27} fontSize={11.5} fill={FADE}>{r.n}</text>
          <text x={280} y={r.y + 27} fontSize={11} fontFamily={MONO} fill="#fff">{r.a}</text>
        </g>
      ))}

      <text x={30} y={248} fontSize={12.5} fill="#fff">буква сети вшита в адрес: по первым двум знакам видно, куда он годится</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>отправить в основную сеть на тестовый адрес не выйдет — узел откажет ещё на проверке</text>
    </Panel>
  ),

  'wa-balances': (aria) => (
    <Panel id="fig-wa-bal" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЧЁТ В WAVES И СЧЁТ В ТОКЕНЕ — ЭТО РАЗНЫЕ СЧЕТА</text>

      <rect x={30} y={64} width={370} height={112} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">WAVES</text>
      <text x={50} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>/addresses/balance/3MDK…</text>
      <text x={50} y={142} fontSize={11} fontFamily={MONO} fill="#fff">{'{'}"balance": 500000000{'}'}</text>
      <text x={50} y={164} fontSize={11} fill={FADE}>это 5 WAVES: восемь знаков после запятой</text>

      <rect x={420} y={64} width={370} height={112} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Свой токен</text>
      <text x={440} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>/assets/balance/3M5H…/3fyD…</text>
      <text x={440} y={142} fontSize={11} fontFamily={MONO} fill="#fff">{'{'}"balance": 25000{'}'}</text>
      <text x={440} y={164} fontSize={11} fill={FADE}>это 250,00: у токена два знака</text>

      <text x={30} y={218} fontSize={12.5} fill="#fff">целые числа везде: дробей в блокчейне нет, есть договорённость, где стоит запятая</text>
      <text x={30} y={244} fontSize={12.5} fill={FADE}>комиссия всегда списывается в WAVES — даже когда переводят токен</text>
    </Panel>
  ),
};
