import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Сеть»: из чего состоит HTTP-запрос, интерфейс вместо
 * ручной сборки, и путь ответа сервера от JSON до экрана. */

export const networkLayerSchemes: Schemes = {
  'nl-request': (aria) => (
    <Panel id="fig-nl-req" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО УХОДИТ НА СЕРВЕР</text>

      <rect x={30} y={64} width={470} height={166} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={94} fontSize={13} fontFamily={MONO} fill={ACCENT}>POST</text>
      <text x={110} y={94} fontSize={13} fontFamily={MONO} fill="#fff">/api/basket</text>
      <text x={50} y={124} fontSize={12} fontFamily={MONO} fill={FADE}>Content-Type: application/json</text>
      <text x={50} y={146} fontSize={12} fontFamily={MONO} fill={FADE}>Authorization: Bearer …</text>
      <rect x={50} y={162} width={430} height={44} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.5} />
      <text x={66} y={190} fontSize={12} fontFamily={MONO} fill="#fff">&#123;&quot;productId&quot;:7,&quot;count&quot;:1&#125;</text>

      <text x={528} y={94} fontSize={12} fill={FADE}>метод — что делаем</text>
      <text x={528} y={124} fontSize={12} fill={FADE}>заголовки — как и кто</text>
      <text x={528} y={190} fontSize={12} fill={ACCENT}>тело — что передаём</text>

      <rect x={30} y={246} width={760} height={44} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={274} fontSize={12.5} fill="#fff">ответ: 200 — ок · 401 — токен протух · 404 — нет такого · 500 — сервер упал</text>
    </Panel>
  ),

  'nl-interface': (aria) => (
    <Panel id="fig-nl-iface" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИНТЕРФЕЙС ВМЕСТО КОДА ЗАПРОСА</text>

      <rect x={30} y={66} width={340} height={140} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={94} fontSize={12} fill="#fff">пишем руками в каждом методе</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={FADE}>url + путь + заголовки + тело</text>
      <text x={50} y={142} fontSize={11} fontFamily={MONO} fill={FADE}>разбор ответа, коды, ошибки</text>
      <text x={50} y={176} fontSize={11.5} fill="rgba(255,140,140,0.95)">забыл заголовок в одном из двадцати —</text>
      <text x={50} y={194} fontSize={11.5} fill="rgba(255,140,140,0.95)">поймаешь на защите</text>

      <Arrow x1={386} y1={136} x2={438} y2={136} color={ACCENT} w={3} />

      <rect x={452} y={66} width={338} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={472} y={94} fontSize={12} fill={ACCENT}>описываем один раз</text>
      <text x={472} y={122} fontSize={11.5} fontFamily={MONO} fill="#fff">@GET(&quot;products/&#123;id&#125;&quot;)</text>
      <text x={472} y={146} fontSize={11.5} fontFamily={MONO} fill="#fff">suspend fun get(@Path id: Int)</text>
      <text x={472} y={182} fontSize={11.5} fill={ACCENT}>адрес и заголовки — общие для всех</text>

      <text x={30} y={250} fontSize={12.5} fill="#fff">Retrofit сам собирает запрос по описанию и сам разбирает ответ в объект</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>ваше дело — правильно описать, а не правильно склеить строку</text>
    </Panel>
  ),

  'nl-path': (aria) => (
    <Panel id="fig-nl-path" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПУТЬ ОТВЕТА ДО ЭКРАНА</text>

      {[
        { x: 30, t: 'JSON', s: '{"product_name":…}', c: INK },
        { x: 222, t: 'DTO', s: 'ProductDto', c: INK },
        { x: 414, t: 'Domain', s: 'Product', c: ACCENT },
        { x: 606, t: 'Экран', s: 'ProductCard', c: INK },
      ].map((n) => (
        <g key={n.t}>
          <rect x={n.x} y={72} width={168} height={72} rx={11}
            fill={n.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={n.c} strokeWidth={2.5} />
          <text x={n.x + 84} y={102} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={n.c === ACCENT ? ACCENT : '#fff'}>{n.t}</text>
          <text x={n.x + 84} y={124} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={FADE}>{n.s}</text>
        </g>
      ))}
      {[206, 398, 590].map((x) => <Arrow key={x} x1={x} y1={108} x2={x + 12} y2={108} color={ACCENT} w={3} />)}

      <text x={114} y={172} textAnchor="middle" fontSize={11} fill={FADE}>конвертер</text>
      <text x={306} y={172} textAnchor="middle" fontSize={11} fill={FADE}>маппер</text>
      <text x={498} y={172} textAnchor="middle" fontSize={11} fill={FADE}>состояние</text>

      <text x={30} y={216} fontSize={12.5} fill="#fff">границы слоёв — это места, где данные меняют форму</text>
      <text x={30} y={244} fontSize={12.5} fill={FADE}>дальше DTO не проходит: экран не должен знать, как поле называлось на сервере</text>
    </Panel>
  ),
};
