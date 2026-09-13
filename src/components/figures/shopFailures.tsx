import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Отказы и сессии»: разбор исключений по видам, что можно
 * повторять, и что на самом деле делает удаление записи сессии. */

export const shopFailuresSchemes: Schemes = {
  'sx-classify': (aria) => (
    <Panel id="fig-sx-cls" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ ИСХОДА ВМЕСТО ДЕСЯТКА ИСКЛЮЧЕНИЙ</text>

      {[
        { y: 64, e: 'UnknownHostException', f: 'NoNetwork', s: 'Нет соединения · Повторить' },
        { y: 116, e: 'SocketTimeoutException', f: 'Timeout', s: 'Сервер не ответил · Повторить' },
        { y: 168, e: 'HttpException(404)', f: 'Server(404)', s: 'Товар не найден' },
        { y: 220, e: 'прочее', f: 'Unknown', s: 'Что-то пошло не так' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={244} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={48} y={r.y + 25} fontSize={11} fontFamily={MONO} fill="#fff">{r.e}</text>
          <Arrow x1={284} y1={r.y + 20} x2={312} y2={r.y + 20} color={FADE} w={2.5} />
          <rect x={322} y={r.y} width={168} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={340} y={r.y + 25} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.f}</text>
          <Arrow x1={500} y1={r.y + 20} x2={528} y2={r.y + 20} color={FADE} w={2.5} />
          <rect x={538} y={r.y} width={252} height={40} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={556} y={r.y + 25} fontSize={11.5} fill="#fff">{r.s}</text>
        </g>
      ))}

      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>экран знает про четыре исхода — не про исключения OkHttp и не про коды HTTP</text>
    </Panel>
  ),

  'sx-retry': (aria) => (
    <Panel id="fig-sx-retry" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПОВТОРЯТЬ, А ЧТО НЕТ</text>

      <rect x={30} y={64} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12.5} fill={ACCENT}>повторять имеет смысл</text>
      <text x={50} y={120} fontSize={12} fill="#fff">нет сети — она может вернуться</text>
      <text x={50} y={146} fontSize={12} fill="#fff">таймаут — сервер мог задуматься</text>
      <text x={50} y={172} fontSize={12} fill="#fff">5xx — у сервера временная беда</text>
      <text x={50} y={200} fontSize={11} fill={FADE}>пауза удваивается: 300 · 600 · 1200 мс</text>

      <rect x={420} y={64} width={370} height={150} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12.5} fill="#fff">повторять бессмысленно</text>
      <text x={440} y={120} fontSize={12} fill={FADE}>400 — тело запроса не изменится</text>
      <text x={440} y={146} fontSize={12} fill={FADE}>404 — записи не появится</text>
      <text x={440} y={172} fontSize={12} fill={FADE}>403 — прав не прибавится</text>
      <text x={440} y={200} fontSize={11} fill={FADE}>три попытки лишь задержат сообщение</text>

      <rect x={30} y={232} width={760} height={40} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={257} fontSize={12} fontFamily={MONO} fill="#fff">повтор POST опасен вдвойне: заказ может оформиться дважды</text>
    </Panel>
  ),

  'sx-logout': (aria) => (
    <Panel id="fig-sx-out" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ДЕЛАЕТ УДАЛЕНИЕ ЗАПИСИ СЕССИИ</text>

      <rect x={30} y={66} width={360} height={118} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={94} fontSize={12} fontFamily={MONO} fill="#fff">DELETE /_authOrigins/records/{'{id}'}</text>
      <text x={50} y={122} fontSize={12} fill={ACCENT}>204 No Content</text>
      <text x={50} y={150} fontSize={11.5} fill={FADE}>запись об устройстве удалена</text>
      <text x={50} y={172} fontSize={11.5} fill={FADE}>список сессий стал пустым</text>

      <rect x={420} y={66} width={370} height={118} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={94} fontSize={12} fontFamily={MONO} fill={ACCENT}>GET /users/records/{'{свой id}'}</text>
      <text x={440} y={122} fontSize={12} fill="#fff">тем же токеном → 200 OK</text>
      <text x={440} y={150} fontSize={11.5} fill="#fff">корзина тем же токеном → 200 OK</text>
      <text x={440} y={172} fontSize={11.5} fill={ACCENT}>токен ЖИВ</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">в спецификации запрос назван «удаление пользователя» — на деле это журнал устройств</text>
      <text x={30} y={252} fontSize={12.5} fill={ACCENT}>настоящий выход — стереть токен с устройства; сервер его не отзывает</text>
      <text x={30} y={280} fontSize={12.5} fill={FADE}>токен останется годным до своего exp — пять суток с момента выдачи</text>
    </Panel>
  ),
};
