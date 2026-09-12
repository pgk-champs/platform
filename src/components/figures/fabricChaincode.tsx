import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Смарт-контракт для Fabric»: устройство контракта,
 * недетерминизм и разница между состоянием и историей ключа. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const fabricChaincodeSchemes: Schemes = {
  'fc-contract-shape': (aria) => (
    <Panel id="fig-fc-shape" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОНТРАКТ — ЭТО КЛАСС, А ХРАНИЛИЩЕ — ЭТО CTX.STUB</text>

      <rect x={30} y={64} width={340} height={190} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>class Zachetka extends Contract</text>
      <text x={50} y={124} fontSize={11} fontFamily={MONO} fill="#fff">@Transaction()</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={FADE}>async Zavesti(ctx, id, fio)</text>
      <text x={50} y={176} fontSize={11} fontFamily={MONO} fill="#fff">@Transaction(false)</text>
      <text x={50} y={196} fontSize={11} fontFamily={MONO} fill={FADE}>async Pokazat(ctx, id)</text>
      <text x={50} y={228} fontSize={11} fill={FADE}>публичные методы = функции контракта</text>

      <Arrow x1={380} y1={160} x2={430} y2={160} color={ACCENT} w={2.5} />

      <rect x={440} y={64} width={350} height={190} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={460} y={92} fontSize={12} fontWeight={700} fill="#fff">ctx.stub — вход в реестр</text>
      {[
        { y: 122, m: 'getState(id)', d: 'прочитать значение' },
        { y: 150, m: 'putState(id, bytes)', d: 'записать значение' },
        { y: 178, m: 'deleteState(id)', d: 'пометить удалённым' },
        { y: 206, m: 'getHistoryForKey(id)', d: 'все версии ключа' },
      ].map((r) => (
        <g key={r.y}>
          <text x={460} y={r.y} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.m}</text>
          <text x={640} y={r.y} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={284} fontSize={12.5} fill="#fff">всё хранилище — пары «ключ → набор байт»; JSON туда кладут руками, через строку</text>
      <text x={30} y={304} fontSize={12.5} fill={FADE}>аргументы функций — всегда строки: числа разбирают внутри и проверяют там же</text>
    </Panel>
  ),

  'fc-nondeterminism': (aria) => (
    <Panel id="fig-fc-nd" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ВЫЗОВ СЧИТАЮТ ДВА ПИРА НЕЗАВИСИМО</text>

      <rect x={30} y={64} width={230} height={64} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={48} y={90} fontSize={11} fontFamily={MONO} fill="#fff">peer0.org1</text>
      <text x={48} y={114} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>"ball": 4</text>

      <rect x={30} y={142} width={230} height={64} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={48} y={168} fontSize={11} fontFamily={MONO} fill="#fff">peer0.org2</text>
      <text x={48} y={192} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>"ball": 3</text>

      <Arrow x1={272} y1={135} x2={330} y2={135} color={RED} w={2.5} />

      <rect x={344} y={88} width={446} height={94} rx={11} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={2} />
      <text x={364} y={116} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>Error: could not assemble transaction:</text>
      <text x={364} y={138} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>ProposalResponsePayloads do not match</text>
      <text x={364} y={166} fontSize={11} fill={FADE}>сделка не собралась: до упорядочивателя она не доехала</text>

      {[
        { y: 216, f: 'Math.random()', r: 'ломается всегда', ok: false },
        { y: 248, f: 'Date.now()', r: 'ломается через раз — если пиры попали в разные миллисекунды', ok: false },
        { y: 280, f: 'ctx.stub.getTxTimestamp()', r: 'время берётся из самой сделки и у всех одинаковое', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.f}</text>
          <text x={300} y={r.y} fontSize={12} fill={r.ok ? '#fff' : FADE}>{r.r}</text>
        </g>
      ))}
    </Panel>
  ),

  'fc-state-vs-history': (aria) => (
    <Panel id="fig-fc-hist" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СОСТОЯНИЕ — ОДНО, ИСТОРИЯ — ВСЯ</text>

      <rect x={30} y={64} width={300} height={120} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Состояние (быстрая база)</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>z-1 → три оценки</text>
      <text x={50} y={148} fontSize={11} fill={FADE}>одно значение на ключ,</text>
      <text x={50} y={166} fontSize={11} fill={FADE}>читается мгновенно</text>

      <rect x={360} y={64} width={430} height={120} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={380} y={92} fontSize={12} fontWeight={700} fill="#fff">История (сама цепочка)</text>
      {[
        { y: 116, t: 'txId a23931… → три оценки' },
        { y: 136, t: 'txId 4b9288… → две оценки' },
        { y: 156, t: 'txId be7d7a… → одна оценка' },
        { y: 176, t: 'txId 8d102b… → пустая зачётка' },
      ].map((r) => (
        <text key={r.y} x={380} y={r.y} fontSize={10.5} fontFamily={MONO} fill={FADE}>{r.t}</text>
      ))}

      <text x={30} y={222} fontSize={12.5} fill="#fff">удалили ключ — из состояния он исчез, из истории нет: там останется запись с пометкой «удалён»</text>
      <text x={30} y={248} fontSize={12.5} fill={FADE}>историю выдаёт getHistoryForKey — в открытых сетях такого вызова нет вообще</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>именно это делает Fabric удобным для журналов: кто, когда и чем поменял запись, видно из коробки</text>
    </Panel>
  ),
};
