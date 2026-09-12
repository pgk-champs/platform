import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Состояние аккаунта»: хранилище ключ-значение,
 * четыре типа значений и правило «писать можно только к себе». */

export const wavesDataSchemes: Schemes = {
  'wd-storage': (aria) => (
    <Panel id="fig-wd-store" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>У КАЖДОГО АККАУНТА СВОЙ СЛОВАРЬ</text>

      <rect x={30} y={64} width={360} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">3M5HPFG1r9q79uxff6rm1Z…</text>
      {[
        { y: 122, k: 'gruppa', v: '"IS-21"' },
        { y: 148, k: 'ball', v: '5' },
        { y: 174, k: 'dopusk', v: 'true' },
      ].map((r) => (
        <g key={r.y}>
          <text x={50} y={r.y} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.k}</text>
          <text x={200} y={r.y} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.v}</text>
        </g>
      ))}
      <text x={50} y={200} fontSize={10.5} fill={FADE}>ключи отсортированы по алфавиту</text>

      <rect x={420} y={64} width={370} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">3MPLLnbwVqT74cC4K9XK85…</text>
      <text x={440} y={132} fontSize={12} fontFamily={MONO} fill={FADE}>[]</text>
      <text x={440} y={162} fontSize={11} fill={FADE}>пусто — но аккаунт существует</text>
      <text x={440} y={186} fontSize={11} fill={FADE}>чужой словарь трогать нельзя</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">запись всегда идёт в свой аккаунт: адрес получателя в транзакции данных не указывают</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>читать при этом может кто угодно — состояние публично внутри сети</text>
    </Panel>
  ),

  'wd-value-types': (aria) => (
    <Panel id="fig-wd-types" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ ТИПА ЗНАЧЕНИЙ И ПЯТЫЙ СЛУЧАЙ</text>

      {[
        { y: 66, t: 'integer', v: '5', d: 'целое со знаком, 8 байт' },
        { y: 108, t: 'boolean', v: 'true', d: 'да или нет' },
        { y: 150, t: 'string', v: '"IS-21"', d: 'текст в UTF-8' },
        { y: 192, t: 'binary', v: 'base64:AbCd…', d: 'произвольные байты' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={150} height={32} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={48} y={r.y + 21} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.t}</text>
          <text x={200} y={r.y + 21} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.v}</text>
          <text x={390} y={r.y + 21} fontSize={11.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <rect x={30} y={234} width={760} height={36} rx={8} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={1.8} />
      <text x={48} y={257} fontSize={11.5} fontFamily={MONO} fill="#fff">{'{ key: "ball", value: null }'}</text>
      <text x={390} y={257} fontSize={11.5} fill={FADE}>без типа и со значением null — ключ удаляется</text>

      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>дробных чисел нет: цену хранят целым и договариваются, где запятая</text>
    </Panel>
  ),

  'wd-limits': (aria) => (
    <Panel id="fig-wd-lim" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ОГРАНИЧЕНО И ПОЧЕМУ ЭТО ВАЖНО</text>

      {[
        { y: 66, k: 'длина ключа', v: 'до 400 знаков', d: '401-й даёт «Too big sequence requested»' },
        { y: 106, k: 'размер значения', v: 'до 32 767 байт', d: '32 768 уже отвергается' },
        { y: 146, k: 'ключей в одной записи', v: 'сколько влезет', d: '100 штук прошли одной транзакцией' },
        { y: 186, k: 'цена', v: '0,001 WAVES за начатый КБ', d: '1000 байт — 0,001, 1100 байт — уже 0,002' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fill={FADE}>{r.k}</text>
          <text x={230} y={r.y} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
          <text x={430} y={r.y} fontSize={11.5} fill="#fff">{r.d}</text>
        </g>
      ))}

      <text x={30} y={228} fontSize={12.5} fill="#fff">составной ключ вместо вложенности: «vklad_3M57BFmz…» вместо словаря внутри словаря</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>перебрать ключи по началу строки узел умеет — это и заменяет вложенные структуры</text>
    </Panel>
  ),
};
