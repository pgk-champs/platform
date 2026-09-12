import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Устройство сети Fabric»: два уровня политик, содержимое MSP
 * и правило нарезки блоков. */

export const fabricNetworkSchemes: Schemes = {
  'fn-policy-levels': (aria) => (
    <Panel id="fig-fn-pol" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛИТИКА КАНАЛА НЕ НАЗЫВАЕТ ЛЮДЕЙ — ОНА ССЫЛАЕТСЯ НА ОРГАНИЗАЦИИ</text>

      <rect x={30} y={64} width={760} height={86} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={90} fontSize={12} fontWeight={700} fill="#fff">Уровень канала</text>
      {[
        { x: 50, k: 'Readers', v: 'ANY' },
        { x: 230, k: 'Writers', v: 'ANY' },
        { x: 410, k: 'Endorsement', v: 'MAJORITY' },
        { x: 610, k: 'Admins', v: 'MAJORITY' },
      ].map((p) => (
        <g key={p.x}>
          <text x={p.x} y={116} fontSize={11} fontFamily={MONO} fill={ACCENT}>{p.k}</text>
          <text x={p.x} y={136} fontSize={11} fill="#fff">{p.v}</text>
        </g>
      ))}

      <Arrow x1={410} y1={152} x2={410} y2={182} color={INK} w={2.4} />

      <rect x={30} y={186} width={370} height={100} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={210} fontSize={12} fontWeight={700} fill="#fff">Org1MSP</text>
      <text x={50} y={232} fontSize={10.5} fontFamily={MONO} fill={FADE}>Endorsement → Org1MSP/PEER</text>
      <text x={50} y={252} fontSize={10.5} fontFamily={MONO} fill={FADE}>Writers → ADMIN, CLIENT</text>
      <text x={50} y={272} fontSize={10.5} fontFamily={MONO} fill={FADE}>Readers → ADMIN, PEER, CLIENT</text>

      <rect x={420} y={186} width={370} height={100} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={210} fontSize={12} fontWeight={700} fill="#fff">Org2MSP</text>
      <text x={440} y={232} fontSize={10.5} fontFamily={MONO} fill={FADE}>Endorsement → Org2MSP/PEER</text>
      <text x={440} y={252} fontSize={10.5} fontFamily={MONO} fill={FADE}>Writers → ADMIN, CLIENT</text>
      <text x={440} y={272} fontSize={10.5} fontFamily={MONO} fill={FADE}>Readers → ADMIN, PEER, CLIENT</text>

      <text x={30} y={316} fontSize={12.5} fill="#fff">добавили организацию — её подписи заработали сами: правило верхнего уровня переписывать не нужно</text>
    </Panel>
  ),

  'fn-msp-folder': (aria) => (
    <Panel id="fig-fn-msp" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ЛЕЖИТ В ПАПКЕ ЛИЧНОСТИ</text>

      {[
        { y: 62, f: 'signcerts/', d: 'сертификат: кто вы и какая у вас роль', a: true },
        { y: 108, f: 'keystore/', d: 'закрытый ключ: им подписываются запросы', a: true },
        { y: 154, f: 'cacerts/', d: 'корневой сертификат организации — кем вы заверены', a: false },
        { y: 200, f: 'tlscacerts/', d: 'корень для шифрования соединения', a: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={190} height={36} rx={8}
            fill={r.a ? SOFT : 'rgba(0,0,0,0.26)'} stroke={r.a ? ACCENT : INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 23} fontSize={11.5} fontFamily={MONO} fill={r.a ? ACCENT : '#fff'}>{r.f}</text>
          <text x={240} y={r.y + 23} fontSize={12} fill={r.a ? '#fff' : FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">потерять keystore — потерять личность; показать её другому — отдать личность</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>роль записана прямо в сертификате: OU=admin у человека, OU=peer у узла</text>
    </Panel>
  ),

  'fn-batching': (aria) => (
    <Panel id="fig-fn-batch" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>БЛОК ЗАКРЫВАЕТСЯ ПО ПЕРВОМУ ИЗ ТРЁХ УСЛОВИЙ</text>

      {[
        { x: 30, t: '2 секунды', s: 'BatchTimeout', d: 'прошло с первой сделки' },
        { x: 290, t: '10 сделок', s: 'MaxMessageCount', d: 'набралось в пачке' },
        { x: 550, t: '512 КБ', s: 'PreferredMaxBytes', d: 'набралось по объёму' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={64} width={240} height={92} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={c.x + 20} y={94} fontSize={16} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 20} y={116} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{c.s}</text>
          <text x={c.x + 20} y={138} fontSize={11} fill={FADE}>{c.d}</text>
        </g>
      ))}

      <text x={30} y={192} fontSize={12.5} fill="#fff">поэтому одиночная сделка ждёт до двух секунд, а под нагрузкой блоки идут чаще</text>
      <text x={30} y={216} fontSize={12.5} fill={FADE}>майнинга нет: блок собирает назначенная служба, соревнования за право записи не происходит</text>
      <text x={30} y={244} fontSize={12.5} fill={ACCENT}>согласие между упорядочивателями — etcdraft: выбранный лидер, остальные повторяют за ним</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>отсюда окончательность: попал в блок — значит попал, откатов из-за более длинной ветки не бывает</text>
    </Panel>
  ),
};
