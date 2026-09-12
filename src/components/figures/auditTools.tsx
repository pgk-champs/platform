import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Инструменты аудита»: четыре сита, что нашёл анализатор
 * и чего он не видит, соотношение сигнала и шума. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const auditToolsSchemes: Schemes = {
  'at-pipeline': (aria) => (
    <Panel id="fig-at-pipe" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ СИТА, И КАЖДОЕ ЛОВИТ СВОЁ</text>

      {[
        { x: 30, t: 'компилятор', d: 'бесплатно, всегда', f: 'непроверенный результат вызова', n: '2 предупреждения' },
        { x: 224, t: 'линтер', d: 'секунды', f: 'стиль и простые огрехи', n: '83 предупреждения' },
        { x: 418, t: 'анализатор', d: 'десятки секунд', f: 'известные схемы уязвимостей', n: '19 находок' },
        { x: 612, t: 'тесты', d: 'пишете сами', f: 'ваш замысел и ваши правила', n: '8 проверок' },
      ].map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={66} width={178} height={132} rx={11}
            fill={i === 3 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 3 ? ACCENT : INK} strokeWidth={2.2} />
          <text x={b.x + 16} y={92} fontSize={12} fill="#fff">{b.t}</text>
          <text x={b.x + 16} y={114} fontSize={10.5} fill={FADE}>{b.d}</text>
          <text x={b.x + 16} y={144} fontSize={10.5} fill={ACCENT}>{b.f}</text>
          <text x={b.x + 16} y={176} fontSize={10.5} fontFamily={MONO} fill={FADE}>{b.n}</text>
        </g>
      ))}

      <text x={30} y={240} fontSize={12.5} fill="#fff">первые три знают, как выглядят типовые ошибки; последнее знает, чего вы хотели</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>порядок применения: слева направо, по возрастанию затрат и убыванию универсальности</text>
      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>ни одно из сит не заменяет чтение кода глазами</text>
    </Panel>
  ),

  'at-slither': (aria) => (
    <Panel id="fig-at-sli" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО АНАЛИЗАТОР НАШЁЛ И ЧЕГО НЕ УВИДЕЛ</text>

      {[
        { y: 66, n: 'BadBank.withdraw()', r: 'reentrancy-eth', d: 'нашёл: запись после внешнего вызова', ok: true },
        { y: 114, n: 'GoodBank.withdraw()', r: '— ничего —', d: 'не нашёл: порядок правильный', ok: true },
        { y: 162, n: 'TxOriginVault', r: 'tx-origin', d: 'нашёл: проверка по инициатору цепочки', ok: true },
        { y: 210, n: 'NoGuard.setRate()', r: '— ничего —', d: 'НЕ нашёл: он не знает, что менять ставку должен владелец', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={200} height={36} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 23} fontSize={10.5} fontFamily={MONO} fill="#fff">{r.n}</text>
          <rect x={248} y={r.y} width={160} height={36} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={264} y={r.y + 23} fontSize={10.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.r}</text>
          <text x={426} y={r.y + 23} fontSize={11} fill={r.ok ? FADE : RED_TEXT}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={272} fontSize={12.5} fill="#fff">анализатор ищет схемы, а не замысел: пропущенная проверка прав для него — обычный код</text>
    </Panel>
  ),

  'at-noise': (aria) => (
    <Panel id="fig-at-noise" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СИГНАЛ И ШУМ: 83 ПРЕДУПРЕЖДЕНИЯ ЛИНТЕРА</text>

      <rect x={30} y={70} width={740} height={30} rx={6} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
      <rect x={30} y={70} width={9} height={30} rx={6} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={52} y={90} fontSize={11} fontFamily={MONO} fill={ACCENT}>1 важное</text>
      <text x={200} y={90} fontSize={11} fontFamily={MONO} fill={FADE}>82 про отсутствующие комментарии, имена и пустые блоки</text>

      <text x={30} y={132} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>no-unchecked-calls — результат низкоуровневого вызова не проверен</text>

      <rect x={30} y={156} width={740} height={62} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={48} y={180} fontSize={11.5} fill="#fff">что с этим делают</text>
      <text x={48} y={204} fontSize={11} fill={ACCENT}>настраивают правила под проект — иначе список перестают читать вовсе</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">инструмент, который выдаёт 83 предупреждения на четыре файла, быстро становится фоном</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>настроить его — часть работы, а не признак лени</text>
    </Panel>
  ),
};
