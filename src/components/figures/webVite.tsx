import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Проект на Vite»: путь от исходников к готовым файлам,
 * типы как гейт сборки и что попадает в собранный код. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webViteSchemes: Schemes = {
  'wv-pipeline': (aria) => (
    <Panel id="fig-wv-pipe" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ ИСХОДНИКИ НЕЛЬЗЯ ПРОСТО ОТКРЫТЬ В БРАУЗЕРЕ</text>

      <rect x={30} y={66} width={220} height={130} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">что пишет человек</text>
      <text x={48} y={118} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>.tsx — браузер не поймёт</text>
      <text x={48} y={140} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>JSX — нет в языке</text>
      <text x={48} y={162} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>import из node_modules</text>
      <text x={48} y={184} fontSize={10.5} fontFamily={MONO} fill={FADE}>20 модулей</text>

      <Arrow x1={262} y1={130} x2={318} y2={130} color={ACCENT} w={2.5} />
      <text x={290} y={120} textAnchor="middle" fontSize={9.5} fontFamily={MONO} fill={FADE}>build</text>

      <rect x={332} y={66} width={220} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={350} y={92} fontSize={11.5} fill="#fff">сборка проверяет и склеивает</text>
      <text x={350} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>tsc -b — типы</text>
      <text x={350} y={140} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>JSX → вызовы функций</text>
      <text x={350} y={162} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>всё в один файл</text>
      <text x={350} y={184} fontSize={10.5} fontFamily={MONO} fill={FADE}>497 мс</text>

      <Arrow x1={564} y1={130} x2={620} y2={130} color={ACCENT} w={2.5} />

      <rect x={634} y={66} width={156} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={652} y={92} fontSize={11.5} fill="#fff">dist/</text>
      <text x={652} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>index.html</text>
      <text x={652} y={140} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>index-jOB7.js</text>
      <text x={652} y={162} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>index-D64V.css</text>
      <text x={652} y={184} fontSize={10.5} fontFamily={MONO} fill={FADE}>288 КБ всего</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">на сервер уезжает только правая колонка: обычные файлы, которые понимает любой браузер</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>случайные буквы в именах — чтобы браузер не показал старую версию из своего запаса</text>
      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>222 кБ кода превращаются в 69 кБ при передаче: сервер отдаёт их сжатыми</text>
    </Panel>
  ),

  'wv-type-gate': (aria) => (
    <Panel id="fig-wv-gate" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СБОРКА — ЭТО ДВЕ КОМАНДЫ, И ПЕРВАЯ ПРОВЕРЯЕТ ТИПЫ</text>

      <text x={30} y={68} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{'"build": "tsc -b && vite build"'}</text>

      <rect x={30} y={90} width={340} height={110} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.2} />
      <text x={48} y={116} fontSize={11.5} fontFamily={MONO} fill="#fff">tsc -b</text>
      <text x={48} y={142} fontSize={11} fill={FADE}>проверяет типы во всём проекте</text>
      <text x={48} y={166} fontSize={11} fill={FADE}>сам ничего не собирает</text>
      <text x={48} y={188} fontSize={11} fill={ACCENT}>упал — вторая не запустится</text>

      <rect x={400} y={90} width={390} height={110} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.2} />
      <text x={418} y={116} fontSize={11} fill="#fff">{'написали: const amount: number = «пять»'}</text>
      <text x={418} y={144} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>src/App.tsx(8,9): error TS2322:</text>
      <text x={418} y={164} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{"Type 'string' is not assignable"}</text>
      <text x={418} y={184} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>{"to type 'number'"}</text>

      <text x={30} y={238} fontSize={12.5} fill="#fff">папка готовых файлов при этом не обновилась: сломанный код физически некуда выложить</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>в режиме разработки такой ошибки не видно — там типы только срезаются, как в главе про запуск</text>
    </Panel>
  ),

  'wv-env': (aria) => (
    <Panel id="fig-wv-env" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВЕ ПЕРЕМЕННЫЕ В ОДНОМ ФАЙЛЕ, РАЗНАЯ СУДЬБА</text>

      <rect x={30} y={66} width={370} height={120} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={10.5} fontFamily={MONO} fill="#fff">VITE_RPC_URL=http://127.0.0.1:8545</text>
      <text x={50} y={120} fontSize={11} fill={ACCENT}>приставка есть — значение подставлено</text>
      <text x={50} y={144} fontSize={11} fill={ACCENT}>прямо в собранный файл</text>
      <text x={50} y={168} fontSize={11} fontFamily={MONO} fill={FADE}>найдено в сборке: да</text>

      <rect x={420} y={66} width={370} height={120} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={10.5} fontFamily={MONO} fill="#fff">SECRET_NOT_EXPOSED=…</text>
      <text x={440} y={120} fontSize={11} fill={FADE}>приставки нет — в сборку не попало</text>
      <text x={440} y={144} fontSize={11} fill={FADE}>на месте обращения осталась пустота</text>
      <text x={440} y={168} fontSize={11} fontFamily={MONO} fill={FADE}>найдено в сборке: нет</text>

      <text x={30} y={226} fontSize={12.5} fill="#fff">переменная с приставкой уезжает к пользователю в открытом виде: её видно в исходном коде страницы</text>
      <text x={30} y={250} fontSize={12.5} fill={RED_TEXT}>поэтому туда кладут адреса и номера сетей — и никогда приватные ключи и пароли</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>«спрятать ключ во фронтенде» невозможно в принципе: весь код страницы открыт</text>
    </Panel>
  ),
};
