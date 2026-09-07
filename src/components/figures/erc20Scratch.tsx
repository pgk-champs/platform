import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ERC20 с нуля»: состав стандарта, журнал как источник правды
 * и цена операций токена. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const erc20ScratchSchemes: Schemes = {
  'es-standard-parts': (aria) => (
    <Panel id="fig-es-parts" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СТАНДАРТ — ЭТО ДОГОВОР: ШЕСТЬ, ТРИ И ДВА</text>

      <rect x={30} y={64} width={370} height={180} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={12} fill="#fff">шесть обязательных функций</text>
      {['totalSupply()', 'balanceOf(address)', 'transfer(address, uint256)', 'approve(address, uint256)', 'allowance(address, address)', 'transferFrom(address, address, uint256)'].map((t, i) => (
        <text key={t} x={50} y={116 + i * 22} fontSize={11} fontFamily={MONO} fill={ACCENT}>{t}</text>
      ))}

      <rect x={420} y={64} width={370} height={84} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={90} fontSize={12} fill="#fff">три необязательных поля</text>
      <text x={440} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>name() · symbol() · decimals()</text>
      <text x={440} y={136} fontSize={10.5} fill={FADE}>вызывающий не должен на них рассчитывать</text>

      <rect x={420} y={160} width={370} height={84} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={186} fontSize={12} fill="#fff">два события</text>
      <text x={440} y={212} fontSize={11} fontFamily={MONO} fill={ACCENT}>Transfer(from, to, value)</text>
      <text x={440} y={232} fontSize={11} fontFamily={MONO} fill={ACCENT}>Approval(owner, spender, value)</text>

      <text x={30} y={274} fontSize={12.5} fill="#fff">кошелёк и биржа понимают любой токен потому, что заранее знают эти подписи</text>
      <text x={30} y={298} fontSize={12.5} fill={FADE}>всё состояние токена — три переменные: итог выпуска, словарь балансов и словарь словарей разрешений</text>
    </Panel>
  ),

  'es-events-truth': (aria) => (
    <Panel id="fig-es-events" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЖУРНАЛ — САМОСТОЯТЕЛЬНЫЙ ИСТОЧНИК ПРАВДЫ</text>

      <rect x={30} y={64} width={370} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={12} fill="#fff">события на месте</text>
      <text x={50} y={116} fontSize={11} fontFamily={MONO} fill={ACCENT}>Transfer от 0x000…000 → выпуск 1000</text>
      <text x={50} y={138} fontSize={11} fontFamily={MONO} fill={ACCENT}>Transfer на 0x000…000 → сжигание 20</text>
      <text x={50} y={164} fontSize={11.5} fill={FADE}>итог выпуска восстанавливается по журналу:</text>
      <text x={50} y={184} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>1000 − 20 = 980 — совпало с контрактом</text>

      <rect x={420} y={64} width={370} height={130} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={90} fontSize={12} fill="#fff">забыт один emit в transfer</text>
      <text x={440} y={116} fontSize={11} fontFamily={MONO} fill={FADE}>балансы честные: 300 и 200</text>
      <text x={440} y={138} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>переводов в журнале: 0</text>
      <text x={440} y={164} fontSize={11.5} fill={RED_TEXT}>по журналу переведено 50,</text>
      <text x={440} y={184} fontSize={11.5} fill={RED_TEXT}>на самом деле 550</text>

      <text x={30} y={236} fontSize={12.5} fill="#fff">на три обычных перевода приходится девять записей: пять о движении и четыре о разрешениях</text>
      <text x={30} y={260} fontSize={12.5} fill={FADE}>перевод нуля тоже даёт событие — стандарт требует считать его обычным переводом</text>
      <text x={30} y={286} fontSize={12.5} fill={RED_TEXT}>кошелёк не покажет поступление, а дашборд, который считает метрики по событиям, покажет ноль</text>
    </Panel>
  ),

  'es-gas-table': (aria) => (
    <Panel id="fig-es-gas" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЦЕНА ЗАВИСИТ НЕ ОТ СУММЫ, А ОТ СОСТОЯНИЯ ЯЧЕЙКИ</text>

      {[
        { y: 62, t: 'перевод новому получателю', g: '52 232', w: 430, c: RED },
        { y: 102, t: 'перевод тому, у кого баланс уже есть', g: '35 132', w: 290, c: ACCENT },
        { y: 142, t: 'первый approve', g: '46 777', w: 385, c: RED },
        { y: 182, t: 'повторный approve', g: '29 677', w: 245, c: ACCENT },
        { y: 222, t: 'сброс approve в ноль', g: '24 793', w: 204, c: ACCENT },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 17} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={330} y={r.y + 2} width={r.w} height={20} rx={5}
            fill={r.c === ACCENT ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.c} strokeWidth={1.8} />
          <text x={r.w + 342} y={r.y + 17} fontSize={11} fontFamily={MONO} fill={r.c}>{r.g}</text>
        </g>
      ))}

      <text x={30} y={268} fontSize={12.5} fill="#fff">разница в обоих случаях ровно 17 100 — цена превращения нулевой ячейки в ненулевую</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>сам журнал тоже не бесплатен: два события стоят 1 953 газа за перевод и 518 байт кода</text>
    </Panel>
  ),
};
