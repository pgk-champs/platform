import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Состояние и эффекты»: три setN подряд, поле формы,
 * привязанное к состоянию, и порядок выполнения эффектов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webStateSchemes: Schemes = {
  'ws-stale-value': (aria) => (
    <Panel id="fig-ws-stale" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ВЫЗОВА ПОДРЯД В ОДНОМ ОБРАБОТЧИКЕ</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">setN(n + 1) × 3</text>
      <text x={50} y={120} fontSize={11} fill={FADE}>n — значение того рендера, где написан</text>
      <text x={50} y={144} fontSize={11} fill={FADE}>обработчик; по ходу оно не меняется</text>
      <text x={50} y={172} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>было 2 → стало 3</text>
      <text x={50} y={196} fontSize={11} fill={RED_TEXT}>ожидали +3, получили +1</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">{'setN(v => v + 1) × 3'}</text>
      <text x={440} y={120} fontSize={11} fill={FADE}>функция получает актуальное значение</text>
      <text x={440} y={144} fontSize={11} fill={FADE}>на момент применения, а не при записи</text>
      <text x={440} y={172} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>было 3 → стало 6</text>
      <text x={440} y={196} fontSize={11} fill={ACCENT}>все три засчитаны</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">новое значение зависит от старого — пишут функцию; не зависит — можно значением</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>то же правило спасает в таймерах и обработчиках ответа из сети: там значение устаревает почти всегда</text>
    </Panel>
  ),

  'ws-controlled': (aria) => (
    <Panel id="fig-ws-ctrl" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛЕ, ПРИВЯЗАННОЕ К СОСТОЯНИЮ</text>

      <rect x={300} y={62} width={220} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={87} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>amount = «2.5»</text>

      <rect x={60} y={162} width={200} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={160} y={187} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#fff">поле ввода</text>

      <rect x={300} y={162} width={220} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={410} y={187} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#fff">кнопка: включена</text>

      <rect x={560} y={162} width={200} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={660} y={187} textAnchor="middle" fontSize={11} fontFamily={MONO} fill="#fff">подсказка о сумме</text>

      <Arrow x1={330} y1={106} x2={180} y2={156} color={ACCENT} w={2} />
      <Arrow x1={410} y1={106} x2={410} y2={156} color={ACCENT} w={2} />
      <Arrow x1={490} y1={106} x2={640} y2={156} color={ACCENT} w={2} />
      <Arrow x1={200} y1={156} x2={350} y2={106} color={RED} w={2} />
      <text x={196} y={136} fontSize={10} fontFamily={MONO} fill={RED_TEXT}>onChange</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">одно значение — и поле, и состояние кнопки, и подсказка: расходиться им негде</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>два поля, смотрящих в одно состояние, меняются одновременно — это проверено прогоном</text>
    </Panel>
  ),

  'ws-effect-order': (aria) => (
    <Panel id="fig-ws-eff" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО В КАКОМ ПОРЯДКЕ ВЫПОЛНЯЕТСЯ</text>

      {[
        { y: 62, t: 'появление компонента', lines: ['тело компонента, n = 0', 'эффект [] — только при появлении', 'эффект [n], n = 0'] },
        { y: 146, t: 'состояние стало 1', lines: ['тело компонента, n = 1', 'уборка за эффектом [n], n был 0', 'эффект [n], n = 1'] },
        { y: 230, t: 'компонент убран', lines: ['уборка за эффектом [n], n был 1'] },
      ].map((b) => (
        <g key={b.y}>
          <rect x={30} y={b.y} width={220} height={26 + b.lines.length * 18} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={48} y={b.y + 26} fontSize={11.5} fill={ACCENT}>{b.t}</text>
          {b.lines.map((l, i) => (
            <text key={i} x={274} y={b.y + 22 + i * 20} fontSize={10.5} fontFamily={MONO} fill={i === 1 && b.lines.length > 1 ? RED_TEXT : FADE}>{l}</text>
          ))}
        </g>
      ))}

      <text x={560} y={106} fontSize={11} fill="#fff">эффект идёт ПОСЛЕ</text>
      <text x={560} y={126} fontSize={11} fill="#fff">того, как экран обновлён</text>
      <text x={560} y={200} fontSize={11} fill={RED_TEXT}>перед новым запуском —</text>
      <text x={560} y={220} fontSize={11} fill={RED_TEXT}>уборка за предыдущим</text>
      <text x={560} y={272} fontSize={11} fill={FADE}>и один раз при уходе</text>
    </Panel>
  ),
};
