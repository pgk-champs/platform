import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Данные из сети»: три состояния вместо одного, ловушка
 * успешного ответа с кодом 404 и гонка опоздавших ответов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webFetchSchemes: Schemes = {
  'wf-three-states': (aria) => (
    <Panel id="fig-wf-states" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>У ДАННЫХ ИЗ СЕТИ НЕ ОДНО СОСТОЯНИЕ, А ЧЕТЫРЕ</text>

      {[
        { x: 30, t: 'покой', d: 'ещё не спрашивали', c: INK, f: 'rgba(0,0,0,0.28)' },
        { x: 224, t: 'загружаем', d: 'запрос в пути', c: ACCENT, f: SOFT },
        { x: 418, t: 'готово', d: 'значение пришло', c: ACCENT, f: SOFT },
        { x: 612, t: 'отказ', d: 'причина известна', c: RED, f: 'rgba(255,140,140,0.14)' },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={70} width={178} height={72} rx={11} fill={b.f} stroke={b.c} strokeWidth={2.2} />
          <text x={b.x + 18} y={98} fontSize={12} fill="#fff">{b.t}</text>
          <text x={b.x + 18} y={122} fontSize={10.5} fill={FADE}>{b.d}</text>
        </g>
      ))}
      <Arrow x1={210} y1={106} x2={218} y2={106} color={ACCENT} w={2} />
      <Arrow x1={404} y1={106} x2={412} y2={106} color={ACCENT} w={2} />
      <Arrow x1={598} y1={106} x2={606} y2={106} color={RED} w={2} />

      <text x={30} y={180} fontSize={11.5} fontFamily={MONO} fill={FADE}>прогон одного компонента:</text>
      <text x={30} y={204} fontSize={11} fontFamily={MONO} fill={ACCENT}>загружаем… → 1000.0 ETH → загружаем… → ошибка: -32000 unknown account</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">интерфейс, у которого есть только «данные», при отказе показывает пустоту и молчит</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>поэтому состояние хранят одним объектом: тогда «загружаем и одновременно ошибка» невозможно</text>
    </Panel>
  ),

  'wf-ok-trap': (aria) => (
    <Panel id="fig-wf-ok" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАПРОС «УСПЕШЕН», ДАЖЕ КОГДА СТРАНИЦЫ НЕТ</text>

      <rect x={30} y={66} width={370} height={124} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fill="#fff">страница есть</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>status 200, ok true</text>
      <text x={50} y={146} fontSize={11} fill={FADE}>разбираем ответ — всё верно</text>

      <rect x={420} y={66} width={370} height={124} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fill="#fff">страницы нет</text>
      <text x={440} y={120} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>status 404, ok false</text>
      <text x={440} y={146} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>исключения не было: false</text>
      <text x={440} y={170} fontSize={11} fill={RED_TEXT}>перехват не сработает — проверять руками</text>

      <text x={30} y={230} fontSize={12.5} fill="#fff">запрос считается успешным, если ответ вообще пришёл: каким он был — отдельный вопрос</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>то же самое мы видели у узла: там отказ лежал внутри тела при коде 200</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>правило одно: после каждого запроса проверяют признак успеха, и только потом разбирают</text>
    </Panel>
  ),

  'wf-race': (aria) => (
    <Panel id="fig-wf-race" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛЬЗОВАТЕЛЬ ПЕРЕКЛЮЧИЛ АДРЕС, ПОКА ОТВЕТ БЫЛ В ПУТИ</text>

      {[
        { y: 64, n: '1', t: 'спросили баланс A', r: 'загружаем…', ok: null },
        { y: 106, n: '2', t: 'переключились на B', r: 'загружаем…', ok: null },
        { y: 148, n: '3', t: 'пришёл ответ по B', r: '500.0 ETH — адрес B', ok: true },
        { y: 190, n: '4', t: 'пришёл опоздавший ответ по A', r: '1000.0 ETH — адрес A', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={11.5} fontFamily={MONO} fill={FADE}>{r.n}</text>
          <text x={54} y={r.y + 20} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={430} y={r.y} width={300} height={30} rx={8}
            fill={r.ok === false ? 'rgba(255,140,140,0.16)' : r.ok ? SOFT : 'rgba(0,0,0,0.26)'}
            stroke={r.ok === false ? RED : r.ok ? ACCENT : INK} strokeWidth={1.8} />
          <text x={446} y={r.y + 20} fontSize={11} fontFamily={MONO}
            fill={r.ok === false ? RED_TEXT : r.ok ? ACCENT : FADE}>{r.r}</text>
        </g>
      ))}

      <rect x={30} y={232} width={760} height={38} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={48} y={256} fontSize={11.5} fill={ACCENT}>с флагом отмены в уборке эффекта четвёртая строка остаётся «500.0 ETH — адрес B»</text>

      <text x={30} y={294} fontSize={12.5} fill="#fff">ответы приходят не в том порядке, в каком спрашивали: это не редкость, а обычное дело</text>
    </Panel>
  ),
};
