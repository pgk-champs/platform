import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Хранение»: что переживает перезапуск, чем отличается
 * хранилище настроек от базы, и почему запрос возвращает поток. */

export const dataStorageSchemes: Schemes = {
  'ds-survives': (aria) => (
    <Panel id="fig-ds-surv" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ДОКУДА ДОЖИВАЕТ</text>

      {[
        { y: 70, t: 'remember', a: 'рекомпозиция', b: '—', c: '—', d: '—' },
        { y: 112, t: 'rememberSaveable', a: 'рекомпозиция', b: 'поворот', c: '—', d: '—' },
        { y: 154, t: 'ViewModel', a: 'рекомпозиция', b: 'поворот', c: '—', d: '—' },
        { y: 196, t: 'DataStore / Room', a: 'рекомпозиция', b: 'поворот', c: 'смерть процесса', d: 'перезапуск' },
      ].map((r, i) => (
        <g key={r.t}>
          <rect x={30} y={r.y} width={200} height={32} rx={8}
            fill={i === 3 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 3 ? ACCENT : INK} strokeWidth={2} />
          <text x={46} y={r.y + 21} fontSize={12} fontFamily={MONO} fill={i === 3 ? ACCENT : '#fff'}>{r.t}</text>
          {[r.a, r.b, r.c, r.d].map((v, j) => (
            <text key={j} x={272 + j * 132} y={r.y + 21} fontSize={11.5}
              fill={v === '—' ? 'rgba(255,255,255,0.25)' : (i === 3 ? ACCENT : FADE)}>{v}</text>
          ))}
        </g>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">«состояние сохраняется после перезапуска приложения» закрывается только нижней строкой</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>перезапуск — новый процесс: в памяти не остаётся ничего</text>
    </Panel>
  ),

  'ds-prefs-vs-db': (aria) => (
    <Panel id="fig-ds-two" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА ХРАНИЛИЩА ПОД РАЗНЫЕ ЗАДАЧИ</text>

      <rect x={30} y={64} width={360} height={190} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13} fontFamily={MONO} fill="#fff">DataStore</text>
      <text x={52} y={120} fontSize={12} fill={FADE}>пары ключ — значение</text>
      {['токен входа', 'тёмная тема', 'последняя вкладка', 'онбординг показан'].map((t, i) => (
        <text key={t} x={52} y={148 + i * 22} fontSize={11.5} fill="#fff">· {t}</text>
      ))}
      <text x={52} y={240} fontSize={11.5} fill={FADE}>искать и сортировать нечем — и не нужно</text>

      <rect x={430} y={64} width={360} height={190} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={94} fontSize={13} fontFamily={MONO} fill={ACCENT}>Room</text>
      <text x={452} y={120} fontSize={12} fill="#fff">таблицы записей</text>
      {['500 товаров', 'история заказов', 'корзина', 'кэш каталога'].map((t, i) => (
        <text key={t} x={452} y={148 + i * 22} fontSize={11.5} fill="#fff">· {t}</text>
      ))}
      <text x={452} y={240} fontSize={11.5} fill={ACCENT}>выборка, сортировка, страницы — без чтения всего</text>

      <text x={30} y={292} fontSize={12.5} fill="#fff">вопрос для выбора: это одно значение или набор однотипных записей?</text>
    </Panel>
  ),

  'ds-flow': (aria) => (
    <Panel id="fig-ds-flow" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАПРОС, КОТОРЫЙ ПРОДОЛЖАЕТ ОТВЕЧАТЬ</text>

      <rect x={30} y={70} width={230} height={80} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={145} y={102} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>Room</text>
      <text x={145} y={126} textAnchor="middle" fontSize={11.5} fill="#fff">@Query → Flow</text>

      <Arrow x1={266} y1={110} x2={330} y2={110} color={ACCENT} w={3} />
      <text x={298} y={98} textAnchor="middle" fontSize={11} fill={ACCENT}>поток</text>

      <rect x={340} y={70} width={230} height={80} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={455} y={102} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">ViewModel</text>
      <text x={455} y={126} textAnchor="middle" fontSize={11.5} fill={FADE}>collect</text>

      <Arrow x1={576} y1={110} x2={640} y2={110} color={INK} w={3} />

      <rect x={650} y={70} width={140} height={80} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={720} y={116} textAnchor="middle" fontSize={13} fill="#fff">Экран</text>

      <rect x={30} y={172} width={760} height={48} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={202} fontSize={12.5} fill="#fff">записали в базу в одном месте — экран обновился сам, без повторного запроса</text>

      <text x={30} y={256} fontSize={12.5} fill={ACCENT}>это тот самый Flow из главы про потоки, только источник — база, а не сеть</text>
    </Panel>
  ),
};
