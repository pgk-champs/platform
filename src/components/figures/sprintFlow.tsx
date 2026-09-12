import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Формат чемпионата»: цикл рабочего дня, откуда отводить
 * ветку и конвейер вопросов к экспертам. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const sprintFlowSchemes: Schemes = {
  'sp-day-cycle': (aria) => (
    <Panel id="fig-sp-day" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СПРИНТ — ЭТО РАБОЧИЙ ДЕНЬ, А НЕ НЕДЕЛЯ</text>

      {[
        { x: 30, t: 'Утро', c: 'git switch -c sprint-X main', d: 'ветку дня отводят от main' },
        { x: 290, t: 'День', c: 'коммиты в sprint-X', d: 'весь день работают в ней' },
        { x: 550, t: 'Вечер', c: 'pull request → main', d: 'и его надо закрыть, а не оставить' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={240} height={116} rx={11}
            fill={i === 2 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 2 ? ACCENT : INK} strokeWidth={2} />
          <text x={c.x + 20} y={94} fontSize={13} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 20} y={124} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{c.c}</text>
          <text x={c.x + 20} y={154} fontSize={11} fill={FADE}>{c.d}</text>
          {i < 2 && <Arrow x1={c.x + 248} y1={124} x2={c.x + 282} y2={124} color={ACCENT} w={2.2} />}
        </g>
      ))}

      <text x={30} y={222} fontSize={12.5} fill="#fff">и так каждый рабочий день: X — номер дня, а не номер большого этапа</text>
      <text x={30} y={248} fontSize={12.5} fill={FADE}>незакрытый pull request — это невыполненный критерий, даже если код написан весь</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>отдельный критерий: проект лежит в ветке как файлы, а не архивом — распаковывать ничего не должны</text>
    </Panel>
  ),

  'sp-branch-from': (aria) => (
    <Panel id="fig-sp-br" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТ ЧЕГО ОТВЕДЕНА ВЕТКА — ВИДНО ТОЛЬКО В PULL REQUEST</text>

      <rect x={30} y={64} width={370} height={150} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">От вчерашней ветки</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>git switch -c sprint-2</text>
      <text x={50} y={148} fontSize={11} fill={FADE}>в pull request уедет:</text>
      <text x={50} y={170} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>b5e563a спринт 2: экраны</text>
      <text x={50} y={190} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>f94c346 спринт 1: каркас</text>

      <rect x={420} y={64} width={370} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">От main</text>
      <text x={440} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>git switch -c sprint-2 main</text>
      <text x={440} y={148} fontSize={11} fill={FADE}>в pull request уедет:</text>
      <text x={440} y={170} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>a4d9619 спринт 2: экраны</text>
      <text x={440} y={192} fontSize={11} fill={ACCENT}>ровно работа этого дня</text>

      <text x={30} y={250} fontSize={12.5} fill="#fff">вчерашние коммиты в сегодняшнем запросе — это спорная приёмка на ровном месте</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>проверяется одной командой до отправки: git log --oneline main..sprint-X</text>
    </Panel>
  ),

  'sp-questions': (aria) => (
    <Panel id="fig-sp-q" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВОПРОС ЭКСПЕРТУ — ТОЖЕ ЗАДАЧА</text>

      {[
        { x: 30, t: 'Заметил', d: 'расхождение макета и задания' },
        { x: 230, t: 'Записал', d: 'в список, не отвлекаясь' },
        { x: 430, t: 'Чекпоинт', d: 'задал пачкой, когда можно' },
        { x: 630, t: 'Записал ответ', d: 'письменно, себе и команде' },
      ].map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={86} rx={10}
            fill={i === 2 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 2 ? ACCENT : INK} strokeWidth={2} />
          <text x={c.x + 16} y={94} fontSize={12} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 16} y={118} fontSize={10.5} fill={FADE}>{c.d.split(' ').slice(0, 2).join(' ')}</text>
          <text x={c.x + 16} y={136} fontSize={10.5} fill={FADE}>{c.d.split(' ').slice(2).join(' ')}</text>
          {i < 3 && <Arrow x1={c.x + 168} y1={110} x2={c.x + 222} y2={110} color={ACCENT} w={2} />}
        </g>
      ))}

      <text x={30} y={192} fontSize={12.5} fill="#fff">ответ эксперта меняет критерий: «пароль должен содержать пробел» — это уже не опечатка, а требование</text>
      <text x={30} y={218} fontSize={12.5} fill={FADE}>не спросили — реализовали по своему пониманию и получили несоответствие при приёмке</text>
      <text x={30} y={246} fontSize={12.5} fill={ACCENT}>копить вопросы выгоднее, чем дёргать по одному: экспертов много не бывает, а времени у них мало</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>ответ записывают: через два дня «нам вроде разрешили» уже не аргумент</text>
    </Panel>
  ),
};
