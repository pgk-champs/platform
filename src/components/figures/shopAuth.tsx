import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Регистрация и вход»: ошибки по полям, жизнь токена,
 * маскировка запрета под «не найдено». */

export const shopAuthSchemes: Schemes = {
  'sa-field-errors': (aria) => (
    <Panel id="fig-sa-err" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОШИБКА ПРИХОДИТ С АДРЕСОМ ПОЛЯ</text>

      <rect x={30} y={62} width={392} height={186} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={90} fontSize={12} fontFamily={MONO} fill={FADE}>{'{'}</text>
      <text x={64} y={114} fontSize={12} fontFamily={MONO} fill="#fff">{'"status": 400,'}</text>
      <text x={64} y={138} fontSize={12} fontFamily={MONO} fill="#fff">{'"message": "Failed to create record.",'}</text>
      <text x={64} y={162} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'"data": {'}</text>
      <text x={80} y={186} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'"passwordConfirm": {'}</text>
      <text x={96} y={208} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{'"code": "validation_values_mismatch"'}</text>
      <text x={80} y={230} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'} }'}</text>

      <rect x={452} y={62} width={338} height={84} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={472} y={90} fontSize={12.5} fill="#fff">message — для журнала</text>
      <text x={472} y={116} fontSize={11.5} fill={FADE}>один и тот же текст на любую ошибку формы</text>

      <rect x={452} y={164} width={338} height={84} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={472} y={192} fontSize={12.5} fill={ACCENT}>data — для экрана</text>
      <text x={472} y={218} fontSize={11.5} fill="#fff">ключ = имя поля, под которым рисуем подпись</text>

      <text x={30} y={282} fontSize={12.5} fill="#fff">показать «Failed to create record.» под формой — потерять балл: пользователь не узнал, что чинить</text>
      <text x={30} y={308} fontSize={12.5} fill={ACCENT}>из data достаётся, что пароли не совпали — и подпись встаёт под нужным полем</text>
    </Panel>
  ),

  'sa-token-life': (aria) => (
    <Panel id="fig-sa-token" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТОКЕН: ЧТО ВНУТРИ И КТО ЕГО ПОДСТАВЛЯЕТ</text>

      <rect x={30} y={62} width={760} height={62} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <rect x={42} y={74} width={150} height={38} rx={8} fill="rgba(255,255,255,0.12)" stroke={FADE} strokeWidth={1.5} />
      <text x={117} y={98} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>заголовок</text>
      <rect x={200} y={74} width={400} height={38} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={400} y={91} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>id · exp · type: auth · refreshable</text>
      <text x={400} y={107} textAnchor="middle" fontSize={10} fill={FADE}>читается кем угодно — это не шифр</text>
      <rect x={608} y={74} width={170} height={38} rx={8} fill="rgba(255,255,255,0.12)" stroke={FADE} strokeWidth={1.5} />
      <text x={693} y={98} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>подпись</text>

      <text x={30} y={158} fontSize={12} fill={FADE}>224 символа · живёт 5 суток · подделать нельзя, прочитать — можно</text>

      {[
        { x: 30, t: 'вход', d: 'токен получен' },
        { x: 236, t: 'хранилище', d: 'DataStore, не память' },
        { x: 442, t: 'интерцептор', d: 'вешает заголовок' },
        { x: 648, t: 'любой запрос', d: 'уже с токеном' },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={186} width={142} height={68} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
          <text x={b.x + 71} y={216} textAnchor="middle" fontSize={12.5} fill="#fff">{b.t}</text>
          <text x={b.x + 71} y={238} textAnchor="middle" fontSize={10.5} fill={FADE}>{b.d}</text>
        </g>
      ))}
      <Arrow x1={178} y1={220} x2={230} y2={220} color={INK} w={3} />
      <Arrow x1={384} y1={220} x2={436} y2={220} color={INK} w={3} />
      <Arrow x1={590} y1={220} x2={642} y2={220} color={ACCENT} w={3} />

      <text x={30} y={290} fontSize={12.5} fill={ACCENT}>заголовок вешается в одном месте — иначе его забудут ровно в том запросе, который проверяет эксперт</text>
    </Panel>
  ),

  'sa-404-mask': (aria) => (
    <Panel id="fig-sa-mask" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ РАЗНЫЕ ПРИЧИНЫ — ОДИН ОТВЕТ</text>

      {[
        { x: 30, t: 'токена нет', d: 'запрос анонимный' },
        { x: 288, t: 'токен чужой', d: 'запись не твоя' },
        { x: 546, t: 'записи нет', d: 'неверный id' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={72} width={244} height={70} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
          <text x={c.x + 122} y={102} textAnchor="middle" fontSize={12.5} fill="#fff">{c.t}</text>
          <text x={c.x + 122} y={124} textAnchor="middle" fontSize={11} fill={FADE}>{c.d}</text>
          <Arrow x1={c.x + 122} y1={148} x2={c.x + 122} y2={178} color={FADE} w={3} />
        </g>
      ))}

      <rect x={30} y={186} width={760} height={56} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={210} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>404 · The requested resource wasn&apos;t found.</text>
      <text x={410} y={232} textAnchor="middle" fontSize={11} fill="#fff">PocketBase не признаётся, что запись есть, но не твоя</text>

      <text x={30} y={276} fontSize={12.5} fill="#fff">по коду ответа отличить «не вошёл» от «нет такого» нельзя — решает наличие токена на устройстве</text>
    </Panel>
  ),
};
