import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Запросы к узлу»: две породы ошибок, подряд против вместе,
 * таймаут и повтор. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsAsyncNetSchemes: Schemes = {
  'tan-two-errors': (aria) => (
    <Panel id="fig-tan-err" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВЕ ПОРОДЫ ОТКАЗОВ, И ПУТАТЬ ИХ НЕЛЬЗЯ</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">сеть молчит</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>узел не отвечает, порт закрыт</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>запрос отклонён с ошибкой</text>
      <text x={50} y={168} fontSize={11} fill={RED_TEXT}>настоящая причина спрятана в поле «причина»</text>
      <text x={50} y={192} fontSize={11} fill={FADE}>ловится обычным перехватом</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">узел ответил и сказал «нет»</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>HTTP 200, признак успеха: true</text>
      <text x={440} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>отказ лежит ВНУТРИ тела: код −32601</text>
      <text x={440} y={168} fontSize={11} fill={RED_TEXT}>перехват не сработает — исключения нет</text>
      <text x={440} y={192} fontSize={11} fill={FADE}>проверяют поле ответа руками</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">опечатка в имени метода — не сетевая ошибка: сеть сработала идеально, отказал узел</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>поэтому после каждого запроса проверяют и статус ответа, и поле ошибки в теле</text>
    </Panel>
  ),

  'tan-serial-vs-parallel': (aria) => (
    <Panel id="fig-tan-par" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДЕСЯТЬ ЗАПРОСОВ ПОДРЯД ИЛИ ВМЕСТЕ</text>

      <text x={30} y={72} fontSize={12} fill="#fff">по очереди, каждый ждёт предыдущего</text>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={30 + i * 74} y={84} width={66} height={22} rx={5} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={1.6} />
      ))}
      <text x={30} y={126} fontSize={11.5} fontFamily={MONO} fill={FADE}>1000 мс · одновременных запросов на сервере: 1</text>

      <text x={30} y={166} fontSize={12} fill="#fff">все сразу</text>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={30} y={178 + i * 3} width={66} height={20} rx={5} fill={SOFT} stroke={ACCENT} strokeWidth={1.4} />
      ))}
      <text x={120} y={200} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>100 мс · одновременных запросов на сервере: 10</text>
      <text x={120} y={222} fontSize={11.5} fill={ACCENT}>выигрыш ровно в десять раз</text>

      <text x={30} y={258} fontSize={12.5} fill="#fff">клиент не стал быстрее — он перестал ждать: работу параллелит сервер</text>
      <text x={30} y={282} fontSize={12.5} fill={FADE}>порядок результатов сохраняется — они идут как в списке, а не как пришли</text>
    </Panel>
  ),

  'tan-timeout-retry': (aria) => (
    <Panel id="fig-tan-timeout" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАВИСШИЙ УЗЕЛ ПОД ТРЕМЯ КЛИЕНТАМИ</text>

      {[
        { y: 66, t: 'без таймаута', b: '3000 мс ожидания', c: 'ответ пришёл — но мог не прийти никогда', ok: false, w: 600 },
        { y: 130, t: 'с таймаутом 500 мс', b: 'отказ на 500-й мс', c: 'ошибка по таймауту, ждать перестали', ok: true, w: 120 },
        { y: 194, t: 'с повтором до трёх раз', b: '1600 мс, ответ на 3-й попытке', c: 'две первые — таймаут, третья успешна', ok: true, w: 330 },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 18} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={30} y={r.y + 26} width={r.w} height={20} rx={5}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.8} />
          <text x={r.w + 42} y={r.y + 42} fontSize={11} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.b}</text>
          <text x={30} y={r.y + 62} fontSize={11} fill={FADE}>{r.c}</text>
        </g>
      ))}

      <text x={30} y={276} fontSize={12.5} fill="#fff">таймаута по умолчанию нет вообще: скрипт без него висит, пока его не убьют</text>
    </Panel>
  ),
};
