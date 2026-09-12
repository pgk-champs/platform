import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Подписи»: восстановление адреса, типизированные данные
 * против текста и проверка в контракте. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const walletSignSchemes: Schemes = {
  'wls-recover': (aria) => (
    <Panel id="fig-wls-rec" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОДПИСЬ НЕ «ЛОМАЕТСЯ» — ОНА ВОССТАНАВЛИВАЕТ ДРУГОЙ АДРЕС</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fill="#fff">то же сообщение, что подписывали</text>
      <text x={50} y={118} fontSize={10.5} fontFamily={MONO} fill={FADE}>«…Одноразовый код: 8f3a2c»</text>
      <text x={50} y={146} fontSize={10} fontFamily={MONO} fill={ACCENT}>восстановлен 0xf39Fd6e5…Fb92266</text>
      <text x={50} y={170} fontSize={11} fill={ACCENT}>совпал с подписавшим</text>
      <text x={50} y={192} fontSize={11} fill={FADE}>значит, подпись подлинная</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fill="#fff">поменяли один символ</text>
      <text x={440} y={118} fontSize={10.5} fontFamily={MONO} fill={FADE}>«…Одноразовый код: 8f3a2d»</text>
      <text x={440} y={146} fontSize={10} fontFamily={MONO} fill={RED_TEXT}>восстановлен 0xA7Fd9B48…62262c10</text>
      <text x={440} y={170} fontSize={11} fill={RED_TEXT}>не совпал ни с кем знакомым</text>
      <text x={440} y={192} fontSize={11} fill={RED_TEXT}>ошибки при этом не было</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">проверка — это всегда сравнение: восстановили адрес и сверили с тем, кого ждали</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>65 байт подписи: две половины по 32 байта и один байт-признак</text>
    </Panel>
  ),

  'wls-712': (aria) => (
    <Panel id="fig-wls-712" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ВИДИТ ЧЕЛОВЕК В ОКНЕ КОШЕЛЬКА</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fill="#fff">подпись текста</text>
      <text x={50} y={120} fontSize={10} fontFamily={MONO} fill={RED_TEXT}>0x7b226f776e6572223a22307866…</text>
      <text x={50} y={146} fontSize={11} fill={RED_TEXT}>набор байтов или непонятная строка</text>
      <text x={50} y={172} fontSize={11} fill={RED_TEXT}>согласиться, не понимая, — норма</text>
      <text x={50} y={196} fontSize={11} fill={FADE}>именно так и крадут разрешения</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fill="#fff">подпись структуры</text>
      <text x={440} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>owner   0xf39Fd6e5…</text>
      <text x={440} y={138} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>amount  2500000000000000000</text>
      <text x={440} y={158} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>deadline 1789000000</text>
      <text x={440} y={184} fontSize={11} fill={ACCENT}>поля с именами и типами</text>
      <text x={440} y={206} fontSize={11} fill={FADE}>плюс домен: имя, версия, сеть, контракт</text>

      <text x={30} y={258} fontSize={12.5} fill="#fff">домен отвечает на вопрос «где эта подпись действительна»: другая сеть или другой контракт — уже нет</text>
      <text x={30} y={282} fontSize={12.5} fill={FADE}>проверено: тот же подписанный текст в сети 1 вместо 1337 восстановил чужой адрес</text>
    </Panel>
  ),

  'wls-onchain': (aria) => (
    <Panel id="fig-wls-chain" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ХЕШ СЧИТАЮТ ОБЕ СТОРОНЫ</text>

      <rect x={30} y={66} width={340} height={100} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.2} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">в браузере, библиотекой</text>
      <text x={48} y={122} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>0x4ffef390753c2b7fe98b96c40ef744cd</text>
      <text x={48} y={140} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>9043dcf6fc2c6457f2cb15a3202471ea</text>

      <rect x={420} y={66} width={370} height={100} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.2} />
      <text x={438} y={92} fontSize={11.5} fill="#fff">в контракте, на Solidity</text>
      <text x={438} y={122} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>0x4ffef390753c2b7fe98b96c40ef744cd</text>
      <text x={438} y={140} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>9043dcf6fc2c6457f2cb15a3202471ea</text>

      <rect x={30} y={182} width={760} height={54} rx={11} fill="rgba(255,140,140,0.10)" stroke={RED} strokeWidth={2} />
      <text x={48} y={204} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>сумма изменена на 25 → BadSignature, восстановлен 0xAB299B23…</text>
      <text x={48} y={226} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>срок истёк → Expired</text>

      <text x={30} y={268} fontSize={12.5} fill="#fff">подпись, сделанную в браузере, контракт проверяет сам — и не тратит на это ни одной транзакции</text>
    </Panel>
  ),
};
