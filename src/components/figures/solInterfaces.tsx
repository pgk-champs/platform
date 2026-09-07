import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Интерфейсы»: двухшаговый протокол approve → transferFrom,
 * три отката по неверному адресу и правила интерфейса. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solInterfacesSchemes: Schemes = {
  'sif-approve-flow': (aria) => (
    <Panel id="fig-sif-approve" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОНТРАКТ НЕ БЕРЁТ ТОКЕНЫ САМ — ЕМУ ИХ РАЗРЕШАЮТ</text>

      <rect x={30} y={70} width={180} height={54} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={120} y={102} textAnchor="middle" fontSize={12} fill="#fff">пользователь</text>

      <rect x={320} y={70} width={180} height={54} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={410} y={102} textAnchor="middle" fontSize={12} fill="#fff">токен</text>

      <rect x={610} y={70} width={180} height={54} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={700} y={102} textAnchor="middle" fontSize={12} fill={ACCENT}>хранилище</text>

      <Arrow x1={214} y1={88} x2={314} y2={88} color={ACCENT} w={2.5} />
      <text x={264} y={78} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>1. approve(vault, 1000)</text>

      <Arrow x1={214} y1={150} x2={604} y2={150} color={ACCENT} w={2.5} />
      <text x={410} y={140} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={ACCENT}>2. deposit(600)</text>

      <Arrow x1={604} y1={182} x2={504} y2={182} color={FADE} w={2.5} />
      <text x={554} y={202} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={FADE}>3. transferFrom</text>

      <rect x={30} y={216} width={370} height={72} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={240} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>lender: 1000 → 400 · vault: 0 → 600</text>
      <text x={50} y={262} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>allowance: 1000 → 400 — разрешение расходуется</text>
      <text x={50} y={282} fontSize={11.5} fontFamily={MONO} fill={FADE}>газ вызова с внешним переходом: 82 171</text>

      <rect x={420} y={216} width={370} height={72} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={440} y={240} fontSize={11.5} fill="#fff">без шага 1 депозит откатывается</text>
      <text x={440} y={262} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>'MiniToken: не хватает разрешения'</text>
      <text x={440} y={282} fontSize={11} fill={FADE}>текст написал токен, получил его вызвавший</text>

      <text x={30} y={312} fontSize={12.5} fill={RED_TEXT}>перевод напрямую на адрес хранилища деньги доставит, но учёт о них не узнает: 700 на балансе, 600 в записи</text>
    </Panel>
  ),

  'sif-wrong-address': (aria) => (
    <Panel id="fig-sif-wrong" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ИНТЕРФЕЙС, ТРИ НЕВЕРНЫХ АДРЕСА — ТРИ РАЗНЫХ ОТКАТА</text>

      {[
        { y: 66, t: 'обычный аккаунт, кода 0 байт', e: 'function returned an unexpected amount of data' },
        { y: 130, t: 'контракт есть, нужной функции нет', e: "function selector was not recognized and there's no fallback function" },
        { y: 194, t: 'функция есть, но не возвращает bool', e: 'function returned an unexpected amount of data' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={300} height={48} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={48} y={r.y + 30} fontSize={11.5} fill="#fff">{r.t}</text>
          <Arrow x1={338} y1={r.y + 24} x2={368} y2={r.y + 24} color={FADE} w={2} />
          <rect x={376} y={r.y} width={414} height={48} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
          <text x={392} y={r.y + 30} fontSize={10} fontFamily={MONO} fill={RED_TEXT}>{r.e}</text>
        </g>
      ))}

      <text x={30} y={268} fontSize={12.5} fill="#fff">ни у одного отката нет причины: данные пустые, текста нет — интерфейс ничего не проверяет заранее</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>третий случай — настоящий USDT: селектор совпал, перевод внутри прошёл, но ответ не той длины откатил всё</text>
    </Panel>
  ),

  'sif-rules': (aria) => (
    <Panel id="fig-sif-rules" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО МОЖНО И ЧЕГО НЕЛЬЗЯ В ИНТЕРФЕЙСЕ</text>

      <rect x={30} y={64} width={370} height={168} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={12} fill="#fff">можно</text>
      {['подписи функций без тел', 'только external', 'события и свои ошибки', 'структуры и перечисления', 'наследовать другой интерфейс'].map((t, i) => (
        <text key={t} x={50} y={118 + i * 24} fontSize={11.5} fill={ACCENT}>· {t}</text>
      ))}

      <rect x={420} y={64} width={370} height={168} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={90} fontSize={12} fill="#fff">нельзя</text>
      {['тело функции', 'переменные состояния', 'конструктор', 'модификаторы', 'public или internal'].map((t, i) => (
        <text key={t} x={440} y={118 + i * 24} fontSize={11.5} fill={RED_TEXT}>· {t}</text>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">contract X is IVault обязывает реализовать все функции договора — иначе «should be marked as abstract»</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>приведение IERC20(addr) ничего не проверяет в сети: это обещание компилятору, а не сети</text>
    </Panel>
  ),
};
