import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Путь транзакции»: четыре стадии, набор чтения-записи
 * и две причины, по которым сделка лежит в блоке недействительной. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const fabricTxSchemes: Schemes = {
  'ftx-four-stages': (aria) => (
    <Panel id="fig-ftx-4" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ СТАДИИ: ИСПОЛНЕНИЕ ИДЁТ ДО ОЧЕРЕДИ, А НЕ ПОСЛЕ</text>

      {[
        { y: 62, n: '1', t: 'Предложение', w: 'клиент → пиры', d: 'вызов уходит каждому пиру, чья подпись нужна' },
        { y: 124, n: '2', t: 'Подтверждение', w: 'пиры исполняют', d: 'каждый считает у себя и подписывает набор изменений' },
        { y: 186, n: '3', t: 'Упорядочивание', w: 'служба очереди', d: 'сделки строятся в ряд и режутся на блоки' },
        { y: 248, n: '4', t: 'Проверка и запись', w: 'каждый пир', d: 'политика и конфликты; негодное помечается недействительным' },
      ].map((r) => (
        <g key={r.y}>
          <circle cx={50} cy={r.y + 20} r={16} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={50} y={r.y + 26} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">{r.n}</text>
          <text x={84} y={r.y + 16} fontSize={13} fontWeight={700} fill="#fff">{r.t}</text>
          <text x={84} y={r.y + 34} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.w}</text>
          <text x={330} y={r.y + 26} fontSize={12} fill={FADE}>{r.d}</text>
        </g>
      ))}
    </Panel>
  ),

  'ftx-rwset': (aria) => (
    <Panel id="fig-ftx-rw" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПИР ПОДПИСЫВАЕТ НЕ РЕЗУЛЬТАТ, А НАБОР ИЗМЕНЕНИЙ</text>

      <rect x={30} y={64} width={370} height={120} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Прочитано</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>key: z-1</text>
      <text x={50} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>version: блок 14, сделка 0</text>
      <text x={50} y={168} fontSize={11} fill={FADE}>не значение, а его номер версии</text>

      <rect x={420} y={64} width={370} height={120} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Записано</text>
      <text x={440} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>key: z-1</text>
      <text x={440} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>value: {'{'}...три оценки...{'}'}</text>
      <text x={440} y={168} fontSize={11} fill={FADE}>готовое новое значение</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">на четвёртой стадии пир сверяет: версия прочитанного ключа всё ещё та же?</text>
      <text x={30} y={248} fontSize={12.5} fill={FADE}>совпала — запись применяется; не совпала — сделка помечается недействительной</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>поэтому вызовы можно исполнять заранее и параллельно: порядок проверяется потом</text>
    </Panel>
  ),

  'ftx-invalid': (aria) => (
    <Panel id="fig-ftx-inv" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СДЕЛКА В БЛОКЕ ЕСТЬ, А ИЗМЕНЕНИЯ НЕТ</text>

      <rect x={30} y={62} width={760} height={96} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={88} fontSize={12} fontWeight={700} fill={RED_TEXT}>ENDORSEMENT_POLICY_FAILURE</text>
      <text x={50} y={112} fontSize={11.5} fill="#fff">подписей меньше, чем требует политика</text>
      <text x={50} y={134} fontSize={11} fontFamily={MONO} fill={FADE}>клиент при этом получил status:200 — ему ответил единственный опрошенный пир</text>

      <rect x={30} y={172} width={760} height={96} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={198} fontSize={12} fontWeight={700} fill={RED_TEXT}>MVCC_READ_CONFLICT</text>
      <text x={50} y={222} fontSize={11.5} fill="#fff">ключ успели изменить между исполнением и записью</text>
      <text x={50} y={244} fontSize={11} fontFamily={MONO} fill={FADE}>две одновременные правки одного ключа: первая по порядку побеждает, вторая отпадает</text>

      <text x={30} y={296} fontSize={12.5} fill={ACCENT}>«успешный» ответ клиенту не значит «записано»: проверять надо состояние, а не код ответа</text>
    </Panel>
  ),
};
