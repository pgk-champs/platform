import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Scaffold»: слоты каркаса экрана, что происходит с содержимым
 * без innerPadding, и нижняя панель с поднятым состоянием выбранной вкладки. */

export const scaffoldBarsSchemes: Schemes = {
  /* каркас и его четыре слота */
  'sb-slots': (aria) => (
    <Panel id="fig-sb-slots" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SCAFFOLD — РАМКА С ЧЕТЫРЬМЯ МЕСТАМИ</text>

      <rect x={250} y={60} width={320} height={244} rx={16} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />

      <rect x={262} y={72} width={296} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={97} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>topBar</text>

      <rect x={262} y={122} width={296} height={112} rx={9} fill="rgba(0,0,0,0.2)" stroke={FADE} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={172} textAnchor="middle" fontSize={12.5} fill="#fff">содержимое экрана</text>
      <text x={410} y={194} textAnchor="middle" fontSize={11} fill={FADE}>получает innerPadding</text>

      <rect x={480} y={196} width={64} height={30} rx={15} fill={ACCENT} />
      <text x={512} y={216} textAnchor="middle" fontSize={11} fill="#fff">FAB</text>

      <rect x={262} y={244} width={296} height={48} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={273} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>bottomBar</text>

      <text x={30} y={92} fontSize={12} fill={FADE}>заголовок, кнопка</text>
      <text x={30} y={110} fontSize={12} fill={FADE}>назад, действия</text>
      <Arrow x1={168} y1={100} x2={252} y2={94} color={FADE} w={2.5} />

      <text x={596} y={214} fontSize={12} fill={FADE}>плавающая кнопка</text>
      <Arrow x1={592} y1={210} x2={550} y2={210} color={FADE} w={2.5} />

      <text x={30} y={268} fontSize={12} fill={FADE}>вкладки разделов</text>
      <Arrow x1={168} y1={264} x2={252} y2={266} color={FADE} w={2.5} />

      <text x={30} y={322} fontSize={12.5} fill="#fff">снекбар показывается поверх и тоже знает про эти границы</text>
    </Panel>
  ),

  /* главная ошибка: содержимое ушло под шапку */
  'sb-inner-padding': (aria) => (
    <Panel id="fig-sb-padding" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЗАБЫТЫЙ ПАРАМЕТР</text>

      <text x={30} y={72} fontSize={12.5} fill="#fff">padding проигнорирован</text>
      <rect x={30} y={84} width={340} height={190} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <rect x={42} y={96} width={316} height={40} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={200} y={121} textAnchor="middle" fontSize={12} fill="#fff">шапка</text>
      <rect x={42} y={104} width={316} height={26} rx={6} fill="rgba(255,120,120,0.35)" stroke="rgba(255,140,140,0.9)" strokeWidth={2} />
      <text x={200} y={122} textAnchor="middle" fontSize={11} fill="#fff">первый элемент — под ней</text>
      {[146, 178, 210].map((y) => (
        <rect key={y} x={42} y={y} width={316} height={24} rx={6} fill="rgba(255,255,255,0.12)" />
      ))}
      <text x={200} y={262} textAnchor="middle" fontSize={11.5} fill={FADE}>виден со второго элемента</text>

      <text x={450} y={72} fontSize={12.5} fill={ACCENT}>Modifier.padding(innerPadding)</text>
      <rect x={450} y={84} width={340} height={190} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={462} y={96} width={316} height={40} rx={8} fill="rgba(0,0,0,0.35)" stroke={ACCENT} strokeWidth={2} />
      <text x={620} y={121} textAnchor="middle" fontSize={12} fill={ACCENT}>шапка</text>
      {[146, 178, 210].map((y) => (
        <rect key={y} x={462} y={y} width={316} height={24} rx={6} fill={ACCENT} opacity={0.75} />
      ))}
      <text x={620} y={262} textAnchor="middle" fontSize={11.5} fill={ACCENT}>список начинается под шапкой</text>

      <text x={30} y={304} fontSize={12.5} fill="#fff">Scaffold сообщает высоту панелей, но применить её обязан ты сам</text>
    </Panel>
  ),

  /* выбранная вкладка — состояние, которое живёт выше панели */
  'sb-tab-state': (aria) => (
    <Panel id="fig-sb-tab" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КТО ПОМНИТ ВЫБРАННУЮ ВКЛАДКУ</text>

      <rect x={30} y={64} width={760} height={70} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={92} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>selectedTab</text>
      <text x={52} y={116} fontSize={12} fill="#fff">живёт выше панели: во ViewModel, а для перезапуска — в хранилище</text>

      <Arrow x1={410} y1={140} x2={410} y2={176} color={ACCENT} w={4} />
      <text x={424} y={164} fontSize={12} fill={FADE}>состояние вниз</text>

      <rect x={30} y={184} width={760} height={62} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      {[
        { x: 52, t: 'Главная', on: true },
        { x: 232, t: 'Каталог' },
        { x: 412, t: 'Корзина' },
        { x: 592, t: 'Профиль' },
      ].map((b) => (
        <g key={b.t}>
          <rect x={b.x} y={196} width={160} height={38} rx={9} fill={b.on ? ACCENT : 'rgba(255,255,255,0.08)'} />
          <text x={b.x + 80} y={220} textAnchor="middle" fontSize={12} fill="#fff">{b.t}</text>
        </g>
      ))}

      <Arrow x1={700} y1={176} x2={700} y2={140} color={INK} w={3} />
      <text x={714} y={164} fontSize={12} fill={FADE}>нажатие вверх</text>

      <text x={30} y={278} fontSize={12.5} fill="#fff">панель ничего не помнит сама: она показывает то, что ей передали, и сообщает о нажатии</text>
    </Panel>
  ),
};
