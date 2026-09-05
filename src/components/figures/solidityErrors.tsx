import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Ошибки и проверки»: откат стирает всё, но газ сгорает;
 * строка против кастомной ошибки; перевёрнутое условие в модификаторе. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityErrorsSchemes: Schemes = {
  'se-revert-all': (aria) => (
    <Panel id="fig-se-revert" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТКАТ СТИРАЕТ ВСЁ, ЧТО УСПЕЛА СДЕЛАТЬ ТРАНЗАКЦИЯ</text>

      {[
        { x: 30, t: 'attempts += 1', s: 'запись сделана', c: INK },
        { x: 250, t: 'require(…)', s: 'условие ложно', c: RED },
        { x: 470, t: 'откат', s: 'attempts снова 0', c: RED },
      ].map((s, i) => (
        <g key={s.t}>
          <rect x={s.x} y={70} width={190} height={70} rx={12}
            fill={s.c === RED ? 'rgba(0,0,0,0.28)' : SOFT} stroke={s.c} strokeWidth={2.5} />
          <text x={s.x + 95} y={98} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">{s.t}</text>
          <text x={s.x + 95} y={122} textAnchor="middle" fontSize={11.5} fill={s.c === RED ? RED_TEXT : FADE}>{s.s}</text>
          {i < 2 ? <Arrow x1={s.x + 198} y1={105} x2={s.x + 242} y2={105} color={FADE} w={2.5} /> : null}
        </g>
      ))}

      <rect x={680} y={70} width={110} height={70} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={735} y={98} textAnchor="middle" fontSize={12} fill="#fff">газ</text>
      <text x={735} y={122} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>46 483</text>

      <text x={30} y={186} fontSize={12.5} fill="#fff">данные вернулись как были — работа машины оплачена: 0,00007 ETH за отклонённую транзакцию</text>
      <text x={30} y={212} fontSize={12.5} fill={FADE}>поэтому проверки ставят в начале функции, до первой записи</text>

      <rect x={30} y={238} width={760} height={40} rx={9} fill="rgba(255,140,140,0.15)" stroke={RED} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={263} textAnchor="middle" fontSize={11.5} fill={RED_TEXT}>require без сообщения: «Transaction reverted without a reason string» — пользователь не узнает ничего</text>

      <text x={30} y={302} fontSize={12.5} fill={FADE}>промежуточного «половина записалась» не бывает: статус 1 или статус 0</text>
    </Panel>
  ),

  'se-string-vs-error': (aria) => (
    <Panel id="fig-se-custom" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СТРОКА ПРОТИВ СВОЕЙ ОШИБКИ: ГДЕ ЭКОНОМИЯ НА САМОМ ДЕЛЕ</text>

      {[
        { y: 66, t: 'газ на развёртывание', a: '332 352', b: '290 471', d: '−41 881' },
        { y: 112, t: 'газ за сам откат', a: '24 144', b: '24 105', d: '−39' },
        { y: 158, t: 'байт в данных отказа', a: '196', b: '68', d: '−128' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={36} rx={9} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 24} fontSize={11.5} fill="#fff">{r.t}</text>
          <text x={430} y={r.y + 24} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={FADE}>{r.a}</text>
          <text x={600} y={r.y + 24} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.b}</text>
          <text x={772} y={r.y + 24} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.d}</text>
        </g>
      ))}
      <text x={430} y={58} textAnchor="end" fontSize={11} fill={FADE}>строка</text>
      <text x={600} y={58} textAnchor="end" fontSize={11} fill={ACCENT}>своя ошибка</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">откат стоит одинаково — экономия в байткоде: текст сообщения в него не зашит</text>
      <text x={30} y={250} fontSize={12.5} fill={ACCENT}>главное отличие: своя ошибка несёт числа — InsufficientBalance(5, 10)</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>строка так не умеет: пользователь видит текст, но не видит, сколько у него есть</text>
    </Panel>
  ),

  'se-inverted-check': (aria) => (
    <Panel id="fig-se-inverted" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЗНАК ПЕРЕВОРАЧИВАЕТ ВСЮ ЗАЩИТУ</text>

      <text x={230} y={66} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={RED_TEXT}>require(role != _role)</text>
      <text x={600} y={66} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>require(role == _role)</text>

      {[
        { y: 80, who: 'владелец (он же деплоил)', bad: 'ПРОПУЩЕН', good: 'ОТКАЗ', badOk: false },
        { y: 132, who: 'провайдер — единственный, кому можно', bad: 'ОТКАЗ', good: 'ПРОПУЩЕН', badOk: false },
        { y: 184, who: 'посторонний', bad: 'ПРОПУЩЕН', good: 'ОТКАЗ', badOk: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 26} fontSize={11.5} fill="#fff">{r.who}</text>
          <rect x={360} y={r.y + 6} width={160} height={30} rx={8} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.8} />
          <text x={440} y={r.y + 26} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>{r.bad}</text>
          <rect x={540} y={r.y + 6} width={160} height={30} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={620} y={r.y + 26} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.good}</text>
        </g>
      ))}

      <text x={30} y={256} fontSize={12.5} fill="#fff">проверка руками ничего не покажет: по умолчанию вызывает тот, кто разворачивал</text>
      <text x={30} y={282} fontSize={12.5} fill={RED_TEXT}>сломанный контракт владельца пропускает — автор решает «работает» и идёт дальше</text>
      <text x={30} y={306} fontSize={12.5} fill={FADE}>компилятор молчит: с точки зрения языка обе записи одинаково правильны</text>
    </Panel>
  ),
};
