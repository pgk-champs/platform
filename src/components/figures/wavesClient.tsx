import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Клиент к Waves»: четыре операции клиента, где живёт сид
 * и сравнение трёх платформ по итогам трека. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesClientSchemes: Schemes = {
  'wcl-four-ops': (aria) => (
    <Panel id="fig-wcl-ops" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЕСЬ КЛИЕНТ — ЧЕТЫРЕ ФУНКЦИИ</text>

      {[
        { y: 66, n: 'читать', c: 'GET /addresses/data/…', d: 'бесплатно, мгновенно, без подписи', free: true },
        { y: 122, n: 'собрать', c: 'invokeScript({…}, seed)', d: 'объект в памяти; сеть о нём не знает', free: true },
        { y: 178, n: 'отправить', c: 'POST /transactions/broadcast', d: '200 значит «принято в очередь»', free: false },
        { y: 234, n: 'дождаться', c: 'GET /transactions/info/<id>', d: '404 значит «ещё не в блоке»', free: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={130} height={42} rx={9}
            fill={r.free ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.free ? ACCENT : INK} strokeWidth={1.8} />
          <text x={95} y={r.y + 27} textAnchor="middle" fontSize={12.5} fill={r.free ? ACCENT : '#fff'}>{r.n}</text>
          <text x={182} y={r.y + 27} fontSize={11} fontFamily={MONO} fill="#fff">{r.c}</text>
          <text x={480} y={r.y + 27} fontSize={11.5} fill={FADE}>{r.d}</text>
        </g>
      ))}
    </Panel>
  ),

  'wcl-seed-place': (aria) => (
    <Panel id="fig-wcl-seed" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГДЕ МОЖЕТ ЛЕЖАТЬ СИД, А ГДЕ НЕТ</text>

      <rect x={30} y={64} width={370} height={140} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Можно</text>
      <text x={50} y={120} fontSize={11.5} fill={ACCENT}>переменная окружения на сервере</text>
      <text x={50} y={146} fontSize={11.5} fill={ACCENT}>хранилище секретов</text>
      <text x={50} y={172} fontSize={11.5} fill={ACCENT}>расширение браузера — подпись у пользователя</text>

      <rect x={420} y={64} width={370} height={140} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Нельзя</text>
      <text x={440} y={120} fontSize={11.5} fill={RED_TEXT}>в коде страницы — виден всем</text>
      <text x={440} y={146} fontSize={11.5} fill={RED_TEXT}>в репозитории — навсегда в истории</text>
      <text x={440} y={172} fontSize={11.5} fill={RED_TEXT}>в localStorage — забирают одним скриптом</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">во фронтенде сида нет вообще: транзакцию подписывает кошелёк пользователя</text>
      <text x={30} y={266} fontSize={12.5} fill={FADE}>на сервере сид нужен только своему аккаунту приложения — и только ему</text>
    </Panel>
  ),

  'wcl-three-platforms': (aria) => (
    <Panel id="fig-wcl-3p" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ЗАЧЁТКА, ТРИ ПЛАТФОРМЫ — ИТОГ ТРЕКА</text>

      <text x={250} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">Solidity</text>
      <text x={450} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">Fabric</text>
      <text x={650} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ACCENT}>Waves</text>

      {[
        { y: 94, k: 'язык', a: 'Solidity', b: 'TypeScript', c: 'RIDE' },
        { y: 126, k: 'где данные', a: 'поля контракта', b: 'общее хранилище', c: 'состояние аккаунта' },
        { y: 158, k: 'кто вызвал', a: 'msg.sender', b: 'clientIdentity', c: 'i.caller' },
        { y: 190, k: 'цена вызова', a: '~96 000 газа', b: 'нет платы', c: '0,005 WAVES' },
        { y: 222, k: 'вход', a: 'свой ключ', b: 'сертификат', c: 'сид-фраза' },
        { y: 254, k: 'история поля', a: 'через события', b: 'getHistoryForKey', c: 'через транзакции' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11} fill={FADE}>{r.k}</text>
          <text x={172} y={r.y} fontSize={11} fill="#fff">{r.a}</text>
          <text x={372} y={r.y} fontSize={11} fill="#fff">{r.b}</text>
          <text x={572} y={r.y} fontSize={11} fill={ACCENT}>{r.c}</text>
        </g>
      ))}

      <text x={30} y={294} fontSize={12.5} fill="#fff">логика везде одна, различаются вход, цена и способ вернуть результат</text>
    </Panel>
  ),
};
