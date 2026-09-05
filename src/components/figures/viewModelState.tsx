import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ViewModel»: что переживает пересоздание экрана, россыпь
 * переменных против одного состояния, и однонаправленный круг
 * «состояние вниз, события вверх». */

export const viewModelStateSchemes: Schemes = {
  /* граница пересоздания: экран умирает, ViewModel остаётся */
  'vm-survives': (aria) => (
    <Panel id="fig-vm-surv" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОВОРОТ ЭКРАНА: ЧТО УМИРАЕТ, ЧТО ОСТАЁТСЯ</text>

      <rect x={30} y={64} width={330} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={92} fontSize={12.5} fill="#fff">Activity и вся разметка</text>
      <text x={52} y={118} fontSize={12} fontFamily={MONO} fill={FADE}>var counter = 7</text>
      <text x={52} y={148} fontSize={12} fill={FADE}>пересоздаётся целиком</text>
      <text x={52} y={176} fontSize={12.5} fill="rgba(255,140,140,0.95)">после поворота counter = 0</text>

      <rect x={396} y={100} width={54} height={78} rx={10} fill={SOFT} stroke={FADE} strokeWidth={2} strokeDasharray="6 4" />
      <text x={423} y={128} textAnchor="middle" fontSize={11} fill={FADE}>по</text>
      <text x={423} y={146} textAnchor="middle" fontSize={11} fill={FADE}>во</text>
      <text x={423} y={164} textAnchor="middle" fontSize={11} fill={FADE}>рот</text>

      <rect x={486} y={64} width={304} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={508} y={92} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>ViewModel</text>
      <text x={508} y={118} fontSize={12} fontFamily={MONO} fill="#fff">uiState.value = 7</text>
      <text x={508} y={148} fontSize={12} fill={FADE}>живёт дольше экрана</text>
      <text x={508} y={176} fontSize={12.5} fill={ACCENT}>после поворота counter = 7</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">ViewModel умирает не при повороте, а когда экран закрыт по-настоящему</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>перезапуск приложения она тоже не переживает — это уже задача хранилища</text>
    </Panel>
  ),

  /* пять флагов против одного закрытого набора состояний */
  'vm-uistate': (aria) => (
    <Panel id="fig-vm-state" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЯТЬ ПЕРЕМЕННЫХ ИЛИ ОДНО СОСТОЯНИЕ</text>

      <rect x={30} y={64} width={360} height={196} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      {[
        { y: 96, t: 'isLoading = true' },
        { y: 124, t: 'items = []' },
        { y: 152, t: 'error = "нет сети"' },
        { y: 180, t: 'isEmpty = false' },
      ].map((r) => (
        <text key={r.y} x={52} y={r.y} fontSize={12} fontFamily={MONO} fill="#fff">{r.t}</text>
      ))}
      <rect x={44} y={198} width={332} height={44} rx={9} fill="rgba(255,120,120,0.2)" stroke="rgba(255,140,140,0.8)" strokeWidth={2} />
      <text x={210} y={218} textAnchor="middle" fontSize={11.5} fill="#fff">спиннер и ошибка одновременно</text>
      <text x={210} y={234} textAnchor="middle" fontSize={11} fill={FADE}>сочетание, которого быть не должно</text>

      <rect x={430} y={64} width={360} height={196} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={92} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>UiState</text>
      {[
        { y: 122, t: 'Loading', d: 'спиннер' },
        { y: 158, t: 'Content(items)', d: 'список' },
        { y: 194, t: 'Error(msg)', d: 'ошибка и «Повторить»' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={452} y={r.y - 18} width={316} height={28} rx={8} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={1.5} />
          <text x={468} y={r.y} fontSize={12} fontFamily={MONO} fill="#fff">{r.t}</text>
          <text x={640} y={r.y} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}
      <text x={452} y={238} fontSize={11.5} fill={ACCENT}>третьего не дано — невозможных сочетаний нет</text>

      <text x={30} y={300} fontSize={12.5} fill="#fff">экран рисуется одним when по состоянию, а не пятью вложенными if</text>
    </Panel>
  ),

  /* круг: состояние вниз, события вверх */
  'vm-udf': (aria) => (
    <Panel id="fig-vm-udf" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНОНАПРАВЛЕННЫЙ КРУГ</text>

      <rect x={60} y={80} width={280} height={72} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={200} y={112} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>ViewModel</text>
      <text x={200} y={134} textAnchor="middle" fontSize={11.5} fill="#fff">держит состояние, решает, что с ним делать</text>

      <rect x={480} y={80} width={280} height={72} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={620} y={112} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">Экран</text>
      <text x={620} y={134} textAnchor="middle" fontSize={11.5} fill={FADE}>рисует то, что дали; сам ничего не решает</text>

      <Arrow x1={344} y1={102} x2={476} y2={102} color={ACCENT} w={4} />
      <text x={410} y={94} textAnchor="middle" fontSize={12} fill={ACCENT}>состояние вниз</text>

      <Arrow x1={476} y1={134} x2={344} y2={134} color={INK} w={4} />
      <text x={410} y={158} textAnchor="middle" fontSize={12} fill={FADE}>события вверх</text>

      <rect x={60} y={196} width={700} height={56} rx={12} fill="rgba(0,0,0,0.22)" stroke={FADE} strokeWidth={2} />
      <text x={80} y={220} fontSize={12.5} fontFamily={MONO} fill="#fff">onRetryClick: () -&gt; Unit</text>
      <text x={80} y={240} fontSize={12} fill={FADE}>событие — это параметр-функция: экран сообщает о нажатии, но не знает, что произойдёт</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">данные текут в одну сторону, поэтому всегда понятно, кто изменил состояние</text>
    </Panel>
  ),
};
