import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Redux Toolkit»: что генерирует срез, от чего зависит
 * перерисовка и что даёт селектор с запоминанием. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webRtkSchemes: Schemes = {
  'wrt-slice': (aria) => (
    <Panel id="fig-wrt-slice" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО ОПИСАНИЕ — ТРИ ГОТОВЫЕ ВЕЩИ</text>

      <rect x={30} y={66} width={280} height={140} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">createSlice({'{'}</text>
      <text x={48} y={116} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  name: &quot;vault&quot;,</text>
      <text x={48} y={138} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  initialState,</text>
      <text x={48} y={160} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  reducers: {'{'} setAmount, setBusy {'}'}</text>
      <text x={48} y={184} fontSize={11.5} fontFamily={MONO} fill="#fff">{'}'})</text>

      <Arrow x1={322} y1={136} x2={370} y2={136} color={ACCENT} w={2.5} />

      {[
        { y: 66, t: 'slice.reducer', d: 'обработчик для хранилища' },
        { y: 116, t: 'slice.actions.setAmount', d: 'создатель действия' },
        { y: 166, t: '"vault/setAmount"', d: 'имя действия — само' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={386} y={r.y} width={404} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={404} y={r.y + 25} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.t}</text>
          <text x={620} y={r.y + 25} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={240} fontSize={12.5} fill="#fff">имена действий складываются из названия среза и названия обработчика — придумывать их не надо</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>раньше всё это писали руками в трёх файлах; отсюда репутация подхода как многословного</text>
    </Panel>
  ),

  'wrt-selectors': (aria) => (
    <Panel id="fig-wrt-sel" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ СЕЛЕКТОРА, ДВА ИЗМЕНЕНИЯ: КТО ПЕРЕСЧИТАЛСЯ</text>

      <text x={340} y={68} fontSize={11} fontFamily={MONO} fill={FADE}>изменили amount</text>
      <text x={530} y={68} fontSize={11} fontFamily={MONO} fill={FADE}>изменили busy</text>
      <text x={700} y={68} fontSize={11} fontFamily={MONO} fill={FADE}>вывод</text>

      {[
        { y: 84, n: 's.vault.amount', a: 1, b: 0, v: 'то, что надо', ok: true },
        { y: 132, n: 's.vault', a: 1, b: 1, v: 'лишняя работа', ok: false },
        { y: 180, n: 's.vault.ops.filter(…)', a: 1, b: 1, v: 'каждый раз новый массив', ok: false },
        { y: 228, n: 'селектор с запоминанием', a: 0, b: 0, v: 'ops не менялись — пересчёта нет', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={280} height={36} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={46} y={r.y + 23} fontSize={10.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.n}</text>
          <text x={370} y={r.y + 23} fontSize={13} fontFamily={MONO} fill={r.a ? RED_TEXT : ACCENT}>{r.a}</text>
          <text x={560} y={r.y + 23} fontSize={13} fontFamily={MONO} fill={r.b ? RED_TEXT : ACCENT}>{r.b}</text>
          <text x={632} y={r.y + 23} fontSize={10.5} fill={FADE}>{r.v}</text>
        </g>
      ))}

      <text x={30} y={286} fontSize={12.5} fill="#fff">выбирать надо самое узкое: компонент пересчитывается тогда, когда выбранное значение стало другим</text>
    </Panel>
  ),

  'wrt-memo': (aria) => (
    <Panel id="fig-wrt-memo" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЧЕМУ ФИЛЬТР ВНУТРИ СЕЛЕКТОРА — ЭТО ЛОВУШКА</text>

      <rect x={30} y={66} width={370} height={132} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11} fontFamily={MONO} fill="#fff">{'s => s.vault.ops.filter(…)'}</text>
      <text x={50} y={120} fontSize={11} fill={FADE}>фильтр создаёт новый массив при каждом вызове</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>прошлый !== новый — всегда</text>
      <text x={50} y={170} fontSize={11} fill={RED_TEXT}>пересчёт на любое изменение хранилища</text>

      <rect x={420} y={66} width={370} height={132} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11} fontFamily={MONO} fill="#fff">createSelector(вход, вычисление)</text>
      <text x={440} y={120} fontSize={11} fill={FADE}>вход не изменился — вернётся прошлый результат</text>
      <text x={440} y={144} fontSize={11} fontFamily={MONO} fill={ACCENT}>прошлый === новый</text>
      <text x={440} y={170} fontSize={11} fill={ACCENT}>ноль пересчётов, пока ops те же</text>

      <text x={30} y={232} fontSize={12.5} fill="#fff">сравнение идёт по ссылке: новый массив с тем же содержимым — это другое значение</text>
      <text x={30} y={256} fontSize={12.5} fill={FADE}>то же правило, что делало «изменение на месте» невидимым: библиотека сравнивает ссылки, а не поля</text>
    </Panel>
  ),
};
