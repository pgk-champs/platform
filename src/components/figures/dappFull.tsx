import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «dApp целиком»: чтение против записи, путь транзакции
 * в интерфейсе и три способа узнать о событии. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const dappFullSchemes: Schemes = {
  'dap-read-write': (aria) => (
    <Panel id="fig-dap-rw" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА РЕЖИМА ОДНОГО КОНТРАКТА</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">new Contract(адрес, ABI, provider)</text>
      <text x={50} y={120} fontSize={11} fill={ACCENT}>читает: owner, rate, totalDeposits</text>
      <text x={50} y={144} fontSize={11} fill={FADE}>обычный запрос к узлу</text>
      <text x={50} y={168} fontSize={11} fill={FADE}>ни газа, ни окна кошелька</text>
      <text x={50} y={194} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>запись → contract runner does not support</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">new Contract(адрес, ABI, signer)</text>
      <text x={440} y={120} fontSize={11} fill={ACCENT}>читает так же</text>
      <text x={440} y={144} fontSize={11} fill={ACCENT}>и умеет отправлять транзакции</text>
      <text x={440} y={168} fontSize={11} fill={FADE}>каждая — окно подтверждения у человека</text>
      <text x={440} y={194} fontSize={11} fill={FADE}>и плата за газ</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">интерфейс показывает данные сразу, до подключения кошелька: читать может кто угодно</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>кнопка «подключить» нужна ровно тогда, когда пользователь собрался что-то изменить</text>
    </Panel>
  ),

  'dap-lifecycle': (aria) => (
    <Panel id="fig-dap-life" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПУТЬ ОДНОЙ КНОПКИ: ЧТО ПОКАЗЫВАТЬ НА КАЖДОМ ШАГЕ</text>

      {[
        { y: 62, t: 'проверка вызова', d: 'staticCall — выполнится ли', s: 'NothingToWithdraw ловится здесь', ok: true },
        { y: 106, t: 'оценка стоимости', d: 'estimateGas + цена газа', s: '68 332 газа ≈ 0.00003 ETH', ok: true },
        { y: 150, t: 'подпись в кошельке', d: 'человек подтверждает', s: 'может отказаться: код 4001', ok: null },
        { y: 194, t: 'отправлено', d: 'хеш есть, блока ещё нет', s: 'блок: null', ok: null },
        { y: 238, t: 'подтверждено', d: 'попала в блок', s: 'блок 7, статус 1, газ 67 481', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={200} height={34} rx={8}
            fill={r.ok ? SOFT : 'rgba(0,0,0,0.26)'} stroke={r.ok ? ACCENT : INK} strokeWidth={1.8} />
          <text x={46} y={r.y + 22} fontSize={11} fill={r.ok ? ACCENT : FADE}>{r.t}</text>
          <text x={250} y={r.y + 22} fontSize={11} fill={FADE}>{r.d}</text>
          <text x={470} y={r.y + 22} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={292} fontSize={12.5} fill="#fff">оценка газа оказалась чуть больше факта: 68 332 против 67 481 — запас закладывается нарочно</text>
    </Panel>
  ),

  'dap-events': (aria) => (
    <Panel id="fig-dap-ev" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ СПОСОБА УЗНАТЬ, ЧТО СОБЫТИЕ СЛУЧИЛОСЬ</text>

      {[
        { y: 66, t: 'из чека транзакции', d: 'своё событие, сразу после подтверждения', s: 'событий в чеке: 1', ok: true },
        { y: 122, t: 'подпиской', d: 'чужие события тоже; приходят сами', s: 'опрос узла каждые 4000 мс', ok: true },
        { y: 178, t: 'запросом истории', d: 'всё, что было раньше', s: 'блок 7 | 0x70997970… | 2.0 ETH', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={210} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={46} y={r.y + 26} fontSize={11.5} fill={ACCENT}>{r.t}</text>
          <text x={262} y={r.y + 18} fontSize={11} fill={FADE}>{r.d}</text>
          <text x={262} y={r.y + 36} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={244} fontSize={12.5} fill="#fff">список операций собирают из истории при загрузке и дополняют подпиской по ходу работы</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>подписка по обычному соединению — это опрос узла, а не push: узел спрашивают раз в несколько секунд</text>
    </Panel>
  ),
};
