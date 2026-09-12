import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Демонстрация решения»: структура показа, скрипт против
 * ручных кликов и что ломается на демонстрации. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const demoShowSchemes: Schemes = {
  'dm-five-minutes': (aria) => (
    <Panel id="fig-dm-5m" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЯТЬ МИНУТ: ЧТО ЗА ЧЕМ</text>

      {[
        { y: 62, m: '0:30', t: 'что за задача и что получилось', d: 'одно предложение, без предыстории' },
        { y: 110, m: '1:30', t: 'главный путь целиком', d: 'от пустого состояния до результата, без объяснений по дороге' },
        { y: 158, m: '1:00', t: 'что защищено', d: 'показать отказ: неверные данные, чужой доступ' },
        { y: 206, m: '1:00', t: 'как устроено', d: 'два-три решения и почему так, а не иначе' },
        { y: 254, m: '1:00', t: 'вопросы', d: 'оставить время намеренно: это часть показа' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={78} height={38} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={69} y={r.y + 25} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>{r.m}</text>
          <text x={126} y={r.y + 17} fontSize={12.5} fontWeight={700} fill="#fff">{r.t}</text>
          <text x={126} y={r.y + 34} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}
    </Panel>
  ),

  'dm-script-vs-clicks': (aria) => (
    <Panel id="fig-dm-sc" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПРОГОН ПРОТИВ ДВАДЦАТИ КЛИКОВ</text>

      <rect x={30} y={64} width={370} height={150} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Руками на показе</text>
      <text x={50} y={120} fontSize={11.5} fill={RED_TEXT}>забыл шаг — начинай сначала</text>
      <text x={50} y={146} fontSize={11.5} fill={RED_TEXT}>состояние осталось от прошлого раза</text>
      <text x={50} y={172} fontSize={11.5} fill={RED_TEXT}>говоришь и кликаешь одновременно</text>
      <text x={50} y={198} fontSize={11.5} fill={RED_TEXT}>эксперт смотрит на ваши пальцы</text>

      <rect x={420} y={64} width={370} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Скриптом</text>
      <text x={440} y={120} fontSize={11.5} fill={ACCENT}>шаги пронумерованы и подписаны</text>
      <text x={440} y={146} fontSize={11.5} fill={ACCENT}>каждый запуск с новыми данными</text>
      <text x={440} y={172} fontSize={11.5} fill={ACCENT}>говоришь, пока он работает</text>
      <text x={440} y={198} fontSize={11.5} fill={ACCENT}>эксперт смотрит на результат</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">скрипт демонстрации — не показуха, а способ не потерять баллы на волнении</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>его пишут заранее и прогоняют до показа не меньше двух раз подряд</text>
    </Panel>
  ),

  'dm-lying-script': (aria) => (
    <Panel id="fig-dm-lie" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СКРИПТ, КОТОРЫЙ СОВРАЛ — ЖИВОЙ СЛУЧАЙ</text>

      <rect x={30} y={62} width={760} height={78} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={88} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>[4/4] проверка защиты: балл вне диапазона</text>
      <text x={50} y={112} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>    ПРОШЛО — это ошибка!</text>
      <text x={50} y={132} fontSize={11} fill={FADE}>а сеть на самом деле отказала: в состоянии по-прежнему 5</text>

      <rect x={30} y={156} width={760} height={78} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={182} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>[4/4] проверка защиты: балл вне диапазона</text>
      <text x={50} y={206} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>    отказано: Ball vne diapazona 2..5</text>
      <text x={50} y={226} fontSize={11} fill={FADE}>после того, как проверка стала смотреть на код ответа, а не на исключение</text>

      <text x={30} y={268} fontSize={12.5} fill="#fff">прогон скрипта до показа нужен не для красоты: он ловит ошибки в самом скрипте</text>
    </Panel>
  ),
};
