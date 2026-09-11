import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Развёртывание»: транзакция без получателя, скрипт против
 * описания развёртывания и четыре отказа. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const hardhatDeploySchemes: Schemes = {
  'hd-deploy-tx': (aria) => (
    <Panel id="fig-hd-tx" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРАНЗАКЦИЯ БЕЗ ПОЛУЧАТЕЛЯ</text>

      <rect x={30} y={66} width={300} height={150} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">что уходит в сеть</text>
      <text x={48} y={118} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>to: пусто</text>
      <text x={48} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>data: 2476 байт байт-кода</text>
      <text x={48} y={166} fontSize={11} fontFamily={MONO} fill={ACCENT}>nonce: 0</text>
      <text x={48} y={190} fontSize={11} fontFamily={MONO} fill={FADE}>газ: 586 384</text>

      <Arrow x1={342} y1={140} x2={410} y2={140} color={ACCENT} w={2.5} />

      <rect x={424} y={66} width={366} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={442} y={92} fontSize={11.5} fill="#fff">что появляется в сети</text>
      <text x={442} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>адрес 0x8464135c…730C318bC</text>
      <text x={442} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>код по адресу: 2253 байта</text>
      <text x={442} y={166} fontSize={11} fill={FADE}>до этого по адресу было пусто</text>
      <text x={442} y={190} fontSize={11} fill={FADE}>конструктор отработал и исчез</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">адрес не случайный: он считается из адреса отправителя и номера его транзакции</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>nonce 0 → 0x8464135c…, nonce 2 → 0x948B3c65… — оба совпали с тем, что реально развернулось</text>
      <text x={30} y={298} fontSize={12.5} fill={ACCENT}>значит, адрес будущего контракта можно узнать до того, как он появится</text>
    </Panel>
  ),

  'hd-script-vs-ignition': (aria) => (
    <Panel id="fig-hd-ign" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА СПОСОБА РАЗВЕРНУТЬ ОДНО И ТО ЖЕ</text>

      <rect x={30} y={66} width={370} height={160} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">scripts/deploy.ts</text>
      <text x={50} y={118} fontSize={11} fill={FADE}>пошаговый список действий</text>
      <text x={50} y={142} fontSize={11} fill={FADE}>всё видно, ничего не скрыто</text>
      <text x={50} y={166} fontSize={11} fill={RED_TEXT}>повторный запуск развернёт ещё раз</text>
      <text x={50} y={190} fontSize={11} fill={RED_TEXT}>упал на середине — состояние неизвестно</text>
      <text x={50} y={214} fontSize={11} fill={FADE}>адреса надо записывать самому</text>

      <rect x={420} y={66} width={370} height={160} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">ignition/modules/Vault.ts</text>
      <text x={440} y={118} fontSize={11} fill={FADE}>описание желаемого результата</text>
      <text x={440} y={142} fontSize={11} fill={ACCENT}>сам разбивает работу на пачки</text>
      <text x={440} y={166} fontSize={11} fontFamily={MONO} fill={ACCENT}>повтор: Nothing new to deploy</text>
      <text x={440} y={190} fontSize={11} fill={ACCENT}>упал — продолжит с места остановки</text>
      <text x={440} y={214} fontSize={11} fill={ACCENT}>адреса сохраняет в файл сам</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">одиночный контракт удобнее скриптом; связку из нескольких — описанием</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>файл с адресами лежит рядом и читается следующими скриптами: адрес больше не переписывают руками</text>
    </Panel>
  ),

  'hd-four-refusals': (aria) => (
    <Panel id="fig-hd-ref" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ ОТКАЗА ПРИ РАЗВЁРТЫВАНИИ</text>

      {[
        { y: 62, t: 'узел не отвечает', e: 'HHE703: Cannot connect to the network', f: 'узел не запущен или порт другой' },
        { y: 112, t: 'chainId не тот', e: 'HHE708: set to use chain id 9999, connected to 1337', f: 'поправить номер в настройках' },
        { y: 162, t: 'на счету ноль', e: 'insufficient funds for transfer', f: 'вписать адрес в alloc и поднять сеть заново' },
        { y: 212, t: 'свои транзакции мешают', e: 'HHE10402: wait until they get 5 confirmations', f: 'блоки по таймеру: --dev.period' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={186} height={38} rx={9} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.6} />
          <text x={46} y={r.y + 24} fontSize={11} fill={RED_TEXT}>{r.t}</text>
          <text x={232} y={r.y + 17} fontSize={10.5} fontFamily={MONO} fill={FADE}>{r.e}</text>
          <text x={232} y={r.y + 33} fontSize={10.5} fill={ACCENT}>{r.f}</text>
        </g>
      ))}

      <text x={30} y={278} fontSize={12.5} fill="#fff">все четыре — про сеть, а не про контракт: код при этом верен и собирается</text>
    </Panel>
  ),
};
