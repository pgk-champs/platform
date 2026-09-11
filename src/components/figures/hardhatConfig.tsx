import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «hardhat.config.ts»: карта файла настроек, что рождает
 * сборка и чем симулятор отличается от своего узла. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const hardhatConfigSchemes: Schemes = {
  'hc-config-map': (aria) => (
    <Panel id="fig-hc-map" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ БЛОКА НАСТРОЕК И ЧТО ОТВАЛИВАЕТСЯ БЕЗ КАЖДОГО</text>

      {[
        { y: 62, n: 'plugins', d: 'подключаемые части', b: 'сборка пройдёт, но ethers в скриптах не будет' },
        { y: 112, n: 'solidity.profiles', d: 'версия компилятора и настройки', b: 'HHE909: версия не подходит под pragma' },
        { y: 162, n: 'networks', d: 'куда подключаться', b: 'некуда развернуть контракт' },
        { y: 212, n: 'configVariable', d: 'секреты вне файла', b: 'HHE7: переменная не найдена' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={190} height={38} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={46} y={r.y + 25} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.n}</text>
          <text x={238} y={r.y + 25} fontSize={11} fill={FADE}>{r.d}</text>
          <Arrow x1={432} y1={r.y + 19} x2={470} y2={r.y + 19} color={RED} w={1.8} />
          <text x={484} y={r.y + 25} fontSize={11} fill={RED_TEXT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={274} fontSize={12.5} fill="#fff">файл настроек — единственное, что отличает папку с пакетом от проекта</text>
      <text x={30} y={296} fontSize={12.5} fill={FADE}>без него любая команда упирается в HHE3, с ним — работает всё остальное</text>
    </Panel>
  ),

  'hc-compile-output': (aria) => (
    <Panel id="fig-hc-out" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН .SOL — ТРИ РАЗНЫХ РЕЗУЛЬТАТА</text>

      <rect x={30} y={74} width={160} height={110} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={110} y={122} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">Vault.sol</text>
      <text x={110} y={146} textAnchor="middle" fontSize={10.5} fill={FADE}>то, что написал человек</text>

      <Arrow x1={202} y1={128} x2={262} y2={128} color={ACCENT} w={2.5} />
      <text x={232} y={118} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>build</text>

      {[
        { y: 62, n: 'abi', d: '13 записей: функции, события, ошибки', s: 'по нему с контрактом говорят снаружи' },
        { y: 120, n: 'bytecode', d: '2476 байт', s: 'то, что отправляют при развёртывании' },
        { y: 178, n: 'build-info', d: '93 КБ', s: 'исходники и настройки сборки целиком' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={276} y={r.y} width={150} height={46} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={294} y={r.y + 29} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.n}</text>
          <text x={442} y={r.y + 20} fontSize={11} fill="#fff">{r.d}</text>
          <text x={442} y={r.y + 38} fontSize={10.5} fill={FADE}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={252} fontSize={12.5} fill="#fff">в сеть уезжает только байт-код: ни имён, ни комментариев, ни названий переменных там нет</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>оптимизатор ужал тело контракта с 2253 до 1115 байт — вдвое, при том же поведении</text>
      <text x={30} y={298} fontSize={12.5} fill={ACCENT}>предел на контракт в сети — 24 576 байт; о нём вспоминают, когда до него уже дошли</text>
    </Panel>
  ),

  'hc-two-networks': (aria) => (
    <Panel id="fig-hc-net" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН СКРИПТ, ДВЕ СЕТИ ИЗ ОДНОГО ФАЙЛА НАСТРОЕК</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">type: "edr-simulated"</text>
      <text x={50} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>chainId 31337 · блок 0</text>
      <text x={50} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>счетов 20 · по 10000 ETH</text>
      <text x={50} y={166} fontSize={11} fill={FADE}>поднимается на время команды</text>
      <text x={50} y={190} fontSize={11} fill={FADE}>после неё исчезает без следа</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">type: "http"</text>
      <text x={440} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>chainId 1337 · блок 306</text>
      <text x={440} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>счетов 1 · 496.99998 ETH</text>
      <text x={440} y={166} fontSize={11} fill={FADE}>это наш geth из прошлой главы</text>
      <text x={440} y={190} fontSize={11} fill={ACCENT}>баланс — тот, что остался после переводов</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">счета в симуляторе даёт он сам; в своей сети — ровно те ключи, что вы вписали в настройки</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>отсюда «почему getSigners вернул один адрес вместо двадцати»: вы уже не в симуляторе</text>
    </Panel>
  ),
};
