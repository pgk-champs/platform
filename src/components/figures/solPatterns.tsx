import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Паттерны безопасности»: повторный вход, «тяни, а не толкай»
 * и таблица владения на трёх стадиях. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solPatternsSchemes: Schemes = {
  'sp-reentrancy': (aria) => (
    <Panel id="fig-sp-reentr" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ВКЛАД В 1 ETH ПРЕВРАЩАЕТСЯ В ЧЕТЫРЕ</text>

      <rect x={30} y={64} width={370} height={126} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={12} fill="#fff">перевод раньше записи</text>
      <text x={50} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>call → balance[x] = 0</text>
      <text x={50} y={140} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>повторных входов: 3</text>
      <text x={50} y={162} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>в банке 0.0 ETH · у атакующего 4.0</text>
      <text x={50} y={182} fontSize={11} fill={RED_TEXT}>запись есть, денег нет: anna получает откат</text>

      <rect x={420} y={64} width={370} height={126} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={90} fontSize={12} fill="#fff">проверки → изменения → взаимодействия</text>
      <text x={440} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>balance[x] = 0 → call</text>
      <text x={440} y={140} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>повторных входов: 1</text>
      <text x={440} y={162} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>в банке 3.0 ETH · у атакующего 1.0</text>
      <text x={440} y={182} fontSize={11} fill={ACCENT}>второй вход получает «Нечего снимать»</text>

      <rect x={30} y={210} width={760} height={44} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={237} textAnchor="middle" fontSize={11.5} fill={FADE}>замок nonReentrant даёт тот же результат и внятный текст «Повторный вход запрещён» — ценой лишнего газа</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">внешний вызов отдаёт управление чужому коду — и тот заходит обратно, пока запись ещё не сделана</text>
      <text x={30} y={310} fontSize={12.5} fill={FADE}>по тексту функции разницы почти нет: переставлены две строки</text>
    </Panel>
  ),

  'sp-push-vs-pull': (aria) => (
    <Panel id="fig-sp-payout" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТОЛКАТЬ ИЛИ ДАТЬ ЗАБРАТЬ</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">рассылка по списку в цикле</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={FADE}>anna → boris → отказавшийся</text>
      <text x={50} y={144} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>откат: «Получатель отказался»</text>
      <text x={50} y={168} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>anna 0.0 · boris 0.0 ETH</text>
      <text x={50} y={190} fontSize={11} fill={RED_TEXT}>транзакция атомарна: один отказ останавливает всех</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">каждый забирает сам</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>anna claim() · boris claim() — по 28 725 газа</text>
      <text x={440} y={144} fontSize={11.5} fontFamily={MONO} fill={FADE}>доля отказавшегося лежит в контракте</text>
      <text x={440} y={168} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>повторный claim(): «Нечего забирать»</text>
      <text x={440} y={190} fontSize={11} fill={ACCENT}>никто никого не блокирует</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">сколько газа получает код получателя: transfer — 2 262, call — весь остаток</text>
      <text x={30} y={264} fontSize={12.5} fill={RED_TEXT}>получатель, который пишет к себе в хранилище, при transfer откатывает всю транзакцию</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>через call та же операция проходит за 53 866 газа</text>
    </Panel>
  ),

  'sp-ownership': (aria) => (
    <Panel id="fig-sp-owner" w={820} h={320} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЛАДЕНИЕ: ТРИ СТАДИИ, ОДНА ПЕРЕМЕННАЯ</text>

      {[
        { x: 30, t: 'после развёртывания', o: 'owner = деплоер', rows: [['деплоер', true], ['anna', false], ['boris', false]] },
        { x: 285, t: 'после передачи anna', o: 'owner = anna', rows: [['деплоер', false], ['anna', true], ['boris', false]] },
        { x: 540, t: 'после отказа от владения', o: 'owner = 0x000…000', rows: [['деплоер', false], ['anna', false], ['boris', false]] },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={56} width={250} height={190} rx={12}
            fill={c.t.includes('отказа') ? 'rgba(255,140,140,0.12)' : SOFT}
            stroke={c.t.includes('отказа') ? RED : ACCENT} strokeWidth={2.5} />
          <text x={c.x + 18} y={82} fontSize={11.5} fill="#fff">{c.t}</text>
          <text x={c.x + 18} y={104} fontSize={11} fontFamily={MONO} fill={FADE}>{c.o}</text>
          {c.rows.map((r, i) => (
            <g key={r[0] as string}>
              <text x={c.x + 18} y={136 + i * 34} fontSize={11} fontFamily={MONO} fill="#fff">{r[0] as string}</text>
              <text x={c.x + 232} y={136 + i * 34} textAnchor="end" fontSize={11} fontFamily={MONO}
                fill={r[1] ? ACCENT : RED_TEXT}>{r[1] ? 'может всё' : 'откат'}</text>
            </g>
          ))}
        </g>
      ))}

      <text x={30} y={276} fontSize={12.5} fill="#fff">передача владения — одна строка в хранилище; бывший владелец сразу получает такой же отказ, как посторонний</text>
      <text x={30} y={300} fontSize={12.5} fill={RED_TEXT}>отказ от владения необратим: в казне остались заперты 5 ETH, снять их не может уже никто</text>
    </Panel>
  ),
};
