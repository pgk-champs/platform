import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Асинхронность»: устройство цикла событий с двумя очередями,
 * три состояния промиса, разница между «подряд» и «вместе» на одной шкале
 * времени и четыре комбинатора Promise рядом друг с другом. */

export const tsAsyncSchemes: Schemes = {
  /* стек, две очереди и петля между ними — порядок 1, 2, 3, 4 */
  'ts-event-loop': (aria) => (
    <Panel id="fig-ts-loop" w={820} h={360} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПОТОК, ДВЕ ОЧЕРЕДИ, ОДНА ПЕТЛЯ</text>

      <rect x={30} y={62} width={230} height={150} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={145} y={90} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill={ACCENT}>стек вызовов</text>
      <rect x={52} y={104} width={186} height={28} rx={8} fill={ACCENT} />
      <text x={145} y={123} textAnchor="middle" fontSize={12} fill="#10243a">1 синхронно</text>
      <rect x={52} y={140} width={186} height={28} rx={8} fill={ACCENT} />
      <text x={145} y={159} textAnchor="middle" fontSize={12} fill="#10243a">2 тоже синхронно</text>
      <text x={145} y={192} textAnchor="middle" fontSize={11.5} fill={FADE}>выполняется до конца, без пауз</text>

      <rect x={300} y={62} width={230} height={70} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={415} y={88} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">микрозадачи</text>
      <text x={415} y={112} textAnchor="middle" fontSize={11.5} fill={ACCENT}>3 .then, await, queueMicrotask</text>

      <rect x={300} y={148} width={230} height={70} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={415} y={174} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">макрозадачи</text>
      <text x={415} y={198} textAnchor="middle" fontSize={11.5} fill={FADE}>4 setTimeout, ввод-вывод, сеть</text>

      <Arrow x1={262} y1={96} x2={296} y2={96} color={ACCENT} w={3} />
      <Arrow x1={262} y1={182} x2={296} y2={182} color={INK} w={3} />

      <rect x={570} y={62} width={220} height={156} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={680} y={92} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill="#fff">цикл событий</text>
      <text x={680} y={122} textAnchor="middle" fontSize={11.5} fill={FADE}>стек пуст?</text>
      <text x={680} y={148} textAnchor="middle" fontSize={11.5} fill={ACCENT}>сначала ВСЕ микрозадачи</text>
      <text x={680} y={174} textAnchor="middle" fontSize={11.5} fill="#fff">потом ОДНА макрозадача</text>
      <text x={680} y={200} textAnchor="middle" fontSize={11.5} fill={FADE}>и снова сначала</text>

      <Arrow x1={532} y1={140} x2={566} y2={140} color={INK} w={3} />
      <path d="M680 226v34H145v-32" stroke={ACCENT} strokeWidth={2.5} fill="none" strokeDasharray="7 6" strokeLinecap="round" />

      <text x={30} y={306} fontSize={12.5} fill="#fff">микрозадачи выгребают до дна — поэтому .then всегда обгоняет setTimeout(0)</text>
      <text x={30} y={330} fontSize={12.5} fill={FADE}>пока стек занят, очереди просто ждут: ни один таймер не сработает вовремя</text>
    </Panel>
  ),

  /* три состояния промиса и что их обрабатывает */
  'ts-promise-states': (aria) => (
    <Panel id="fig-ts-states" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПРОМИС МЕНЯЕТ СОСТОЯНИЕ РОВНО ОДИН РАЗ</text>

      <rect x={30} y={110} width={200} height={62} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="7 6" />
      <text x={130} y={138} textAnchor="middle" fontSize={14} fontFamily={MONO} fill="#fff">pending</text>
      <text x={130} y={160} textAnchor="middle" fontSize={11.5} fill={FADE}>ответа ещё нет</text>

      <path d="M234 141h56v-56h48" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M234 141h56v56h48" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <rect x={340} y={58} width={210} height={56} rx={14} fill={ACCENT} />
      <text x={445} y={82} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill="#10243a">fulfilled</text>
      <text x={445} y={102} textAnchor="middle" fontSize={11.5} fill="#10243a">есть значение</text>

      <rect x={340} y={170} width={210} height={56} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={445} y={194} textAnchor="middle" fontSize={14} fontFamily={MONO} fill="#fff">rejected</text>
      <text x={445} y={214} textAnchor="middle" fontSize={11.5} fill={FADE}>есть причина отказа</text>

      <Arrow x1={554} y1={86} x2={596} y2={86} color={ACCENT} w={3} />
      <Arrow x1={554} y1={198} x2={596} y2={198} color={INK} w={3} />
      <text x={606} y={80} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>await / .then</text>
      <text x={606} y={102} fontSize={11.5} fill={FADE}>значение приходит сюда</text>
      <text x={606} y={192} fontSize={12.5} fontFamily={MONO} fill="#fff">catch / .catch</text>
      <text x={606} y={214} fontSize={11.5} fill={FADE}>ошибка приходит сюда</text>

      <text x={30} y={264} fontSize={12.5} fill="#fff">обратной дороги нет: осевший промис навсегда хранит своё значение или ошибку</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>finally срабатывает в обоих случаях и ничего не меняет в передаваемом значении</text>
    </Panel>
  ),

  /* та же работа на одной шкале: подряд и вместе */
  'ts-await-timeline': (aria) => (
    <Panel id="fig-ts-timeline" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА ЗАПРОСА ПО 500 МС: ГДЕ УХОДИТ СЕКУНДА</text>

      <text x={30} y={76} fontSize={12.5} fill="#fff">два await подряд</text>
      <rect x={30} y={88} width={760} height={48} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <rect x={44} y={100} width={356} height={24} rx={7} fill={INK} />
      <text x={222} y={117} textAnchor="middle" fontSize={11.5} fill="#fff">баланс, 500 мс</text>
      <rect x={408} y={100} width={356} height={24} rx={7} fill={INK} />
      <text x={586} y={117} textAnchor="middle" fontSize={11.5} fill="#fff">курс, 500 мс</text>
      <text x={30} y={158} fontSize={11.5} fill={FADE}>измерено: 1.003s — второй запрос ждал, пока закончится первый</text>

      <text x={30} y={196} fontSize={12.5} fill={ACCENT}>Promise.all</text>
      <rect x={30} y={208} width={760} height={62} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={44} y={218} width={356} height={20} rx={6} fill={ACCENT} />
      <text x={222} y={233} textAnchor="middle" fontSize={11} fill="#10243a">баланс, 500 мс</text>
      <rect x={44} y={242} width={356} height={20} rx={6} fill={ACCENT} />
      <text x={222} y={257} textAnchor="middle" fontSize={11} fill="#10243a">курс, 500 мс</text>
      <text x={420} y={244} fontSize={11.5} fill={ACCENT}>измерено: 501.458ms — оба запроса ушли в сеть сразу</text>

      <text x={30} y={298} fontSize={12.5} fill="#fff">await не ускоряет работу — он решает, ждать её сейчас или чуть позже</text>
    </Panel>
  ),

  /* четыре комбинатора: что берут и когда заканчивают */
  'ts-combinators': (aria) => (
    <Panel id="fig-ts-comb" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ СПОСОБА ДОЖДАТЬСЯ НЕСКОЛЬКИХ ПРОМИСОВ</text>

      {[
        { y: 62, name: 'all', when: 'все выполнились', fail: 'падает от первой ошибки', accent: true },
        { y: 128, name: 'allSettled', when: 'все закончились', fail: 'не падает никогда', accent: false },
        { y: 194, name: 'race', when: 'первый закончился', fail: 'ошибка тоже считается', accent: false },
        { y: 260, name: 'any', when: 'первый УСПЕШНЫЙ', fail: 'ошибки пропускает', accent: false },
      ].map((c) => (
        <g key={c.name}>
          <rect x={30} y={c.y} width={190} height={52} rx={12} fill={c.accent ? ACCENT : SOFT} stroke={c.accent ? 'none' : INK} strokeWidth={2.5} />
          <text x={125} y={c.y + 32} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill={c.accent ? '#10243a' : '#fff'}>{c.name}</text>
          <text x={244} y={c.y + 22} fontSize={12.5} fill="#fff">ждёт, пока {c.when}</text>
          <text x={244} y={c.y + 44} fontSize={11.5} fill={c.accent ? ACCENT : FADE}>{c.fail}</text>
          <rect x={556} y={c.y + 10} width={234} height={32} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={673} y={c.y + 31} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={c.accent ? ACCENT : FADE}>
            {c.name === 'all' ? '[a, b, c]' : c.name === 'allSettled' ? '[{status, value|reason}]' : c.name === 'race' ? 'значение или ошибка' : 'значение или AggregateError'}
          </text>
        </g>
      ))}
    </Panel>
  ),
};
