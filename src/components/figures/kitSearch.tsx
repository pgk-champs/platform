import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Поиск»: запрос на каждый символ против паузы,
 * четыре состояния выдачи и гонка ответов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitSearchSchemes: Schemes = {
  'kse-debounce': (aria) => (
    <Panel id="fig-kse-deb" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕЛОВЕК НАБРАЛ «НОУТБУК» — СКОЛЬКО ЗАПРОСОВ УШЛО</text>

      <rect x={30} y={64} width={370} height={140} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">На каждый символ</text>
      {['н', 'но', 'ноу', 'ноут', 'ноутб', 'ноутбу', 'ноутбук'].map((t, i) => (
        <text key={t} x={50 + (i % 4) * 84} y={120 + Math.floor(i / 4) * 22} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{t}</text>
      ))}
      <text x={50} y={186} fontSize={12} fontWeight={700} fill={RED_TEXT}>7 запросов на одно слово</text>

      <Arrow x1={414} y1={134} x2={466} y2={134} color={ACCENT} w={2.4} />

      <rect x={480} y={64} width={310} height={140} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={500} y={92} fontSize={12} fontWeight={700} fill="#fff">После паузы в наборе</text>
      <text x={500} y={122} fontSize={10.5} fontFamily={MONO} fill={FADE}>н, но, ноу… — тихо</text>
      <text x={500} y={146} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>пауза 400 мс → «ноутбук»</text>
      <text x={500} y={186} fontSize={12} fontWeight={700} fill={ACCENT}>1 запрос</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">каждая лишняя отправка — это и трафик, и нагрузка, и мигающая выдача под пальцами</text>
      <text x={30} y={270} fontSize={12.5} fill={FADE}>плюс порог длины: по одной букве искать нечего, запрос всё равно вернёт полкаталога</text>
    </Panel>
  ),

  'kse-four-states': (aria) => (
    <Panel id="fig-kse-st" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОД ПОЛЕМ ПОИСКА НЕ ОДИН СПИСОК, А ПЯТЬ СОСТОЯНИЙ</text>

      {[
        { y: 62, n: 'Idle', t: 'Начните вводить название', d: 'ещё ничего не набрали', c: FADE },
        { y: 108, n: 'Loading', t: 'Ищем…', d: 'запрос ушёл, ответа нет', c: FADE },
        { y: 154, n: 'Found', t: 'список товаров', d: 'нашлось', c: ACCENT },
        { y: 200, n: 'Empty', t: 'Ничего не нашлось. Попробуйте другое слово', d: 'ответ пришёл, он пуст', c: ACCENT },
        { y: 246, n: 'Failed', t: 'Нет сети. Повторить', d: 'ответа не будет', c: RED },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={116} height={34} rx={8} fill="rgba(0,0,0,0.28)" stroke={r.c} strokeWidth={1.7} />
          <text x={88} y={r.y + 22} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={r.c}>{r.n}</text>
          <text x={166} y={r.y + 22} fontSize={12} fill="#fff">{r.t}</text>
          <text x={560} y={r.y + 22} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={296} fontSize={12.5} fill={ACCENT}>«нашлось пусто» и «не смогли спросить» — разные вещи, и человеку нужны разные слова</text>
    </Panel>
  ),

  'kse-race': (aria) => (
    <Panel id="fig-kse-race" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТВЕТЫ ПРИХОДЯТ НЕ В ТОМ ПОРЯДКЕ, В КАКОМ СПРАШИВАЛИ</text>

      <text x={30} y={72} fontSize={11} fontFamily={MONO} fill={FADE}>запрос «ноут»</text>
      <rect x={150} y={60} width={420} height={16} rx={8} fill="rgba(255,140,140,0.25)" />
      <text x={584} y={72} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>ответ пришёл вторым</text>

      <text x={30} y={110} fontSize={11} fontFamily={MONO} fill={FADE}>запрос «ноутбук»</text>
      <rect x={150} y={98} width={180} height={16} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.5} />
      <text x={344} y={110} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>ответ пришёл первым</text>

      <rect x={30} y={140} width={760} height={44} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.8} />
      <text x={50} y={168} fontSize={12} fill={RED_TEXT}>в поле «ноутбук», а на экране выдача по «ноут» — она приехала позже и всё затёрла</text>

      <text x={30} y={218} fontSize={12.5} fill="#fff">лечение встроено: LaunchedEffect с ключом отменяет прошлую работу при смене запроса</text>
      <text x={30} y={244} fontSize={12.5} fill={FADE}>отменённая корутина до onSearch уже не дойдёт — устаревшему ответу неоткуда взяться</text>
      <text x={30} y={266} fontSize={12.5} fill={ACCENT}>именно поэтому ключ обязателен, и без него функция помечена устаревшей</text>
    </Panel>
  ),
};
