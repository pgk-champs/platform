import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Смарт-аккаунт»: скрипт как турникет, доплата за сложность
 * и подписи по местам в массиве proofs. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesSmartAccountSchemes: Schemes = {
  'wsa-turnstile': (aria) => (
    <Panel id="fig-wsa-turn" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СКРИПТ НА АККАУНТЕ — ТУРНИКЕТ НА ВЫХОДЕ</text>

      <rect x={30} y={66} width={200} height={150} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={94} fontSize={12} fontWeight={700} fill="#fff">Транзакция</text>
      <text x={50} y={122} fontSize={11} fontFamily={MONO} fill={FADE}>Transfer</text>
      <text x={50} y={148} fontSize={11} fontFamily={MONO} fill={FADE}>Data</text>
      <text x={50} y={174} fontSize={11} fontFamily={MONO} fill={FADE}>SetScript</text>
      <text x={50} y={200} fontSize={10.5} fill={FADE}>отправляется со счёта</text>

      <rect x={270} y={66} width={230} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={290} y={94} fontSize={12} fontWeight={700} fill="#fff">Скрипт-проверяющий</text>
      <text x={290} y={124} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>match tx {'{'}</text>
      <text x={290} y={146} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  case t: TransferTransaction</text>
      <text x={290} y={166} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>    =&gt; false</text>
      <text x={290} y={188} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>  case _ =&gt; sigVerify(…)</text>
      <text x={290} y={208} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'}'}</text>

      <Arrow x1={514} y1={110} x2={572} y2={110} color={ACCENT} w={2.4} />
      <rect x={586} y={88} width={204} height={44} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={688} y={116} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>true → уходит</text>

      <Arrow x1={514} y1={172} x2={572} y2={172} color={RED} w={2.4} />
      <rect x={586} y={150} width={204} height={44} rx={9} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={1.8} />
      <text x={688} y={178} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={RED_TEXT}>false → отказ</text>

      <text x={30} y={254} fontSize={12.5} fill="#fff">скрипт решает про исходящие: входящий перевод он не остановит</text>
      <text x={30} y={280} fontSize={12.5} fill={FADE}>отказ звучит одинаково всегда: Transaction is not allowed by account-script</text>
    </Panel>
  ),

  'wsa-extra-fee': (aria) => (
    <Panel id="fig-wsa-fee" w={820} h={270} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЛОЖНОСТЬ ПРОВЕРЯЮЩЕГО РЕШАЕТ, БУДЕТ ЛИ ДОПЛАТА</text>

      {[
        { y: 66, c: '183', e: '0', f: '0,001 WAVES', ok: true, d: 'простая проверка подписи' },
        { y: 130, c: '549', e: '400 000', f: '0,005 WAVES', ok: false, d: 'две подписи из трёх' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={170} height={50} rx={9}
            fill={r.ok ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.ok ? ACCENT : INK} strokeWidth={1.8} />
          <text x={115} y={r.y + 31} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff">{r.c}</text>
          <text x={220} y={r.y + 22} fontSize={11.5} fill={FADE}>доплата</text>
          <text x={220} y={r.y + 42} fontSize={12} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.e}</text>
          <text x={400} y={r.y + 22} fontSize={11.5} fill={FADE}>итого за перевод</text>
          <text x={400} y={r.y + 42} fontSize={12} fontFamily={MONO} fill="#fff">{r.f}</text>
          <text x={580} y={r.y + 32} fontSize={11.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={222} fontSize={12.5} fill="#fff">граница — 200: пока проверяющий укладывается, аккаунт платит как обычный</text>
      <text x={30} y={246} fontSize={12.5} fill={FADE}>узел сам называет доплату в поле extraFee ответа scriptInfo</text>
    </Panel>
  ),

  'wsa-proofs': (aria) => (
    <Panel id="fig-wsa-pr" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>МЕСТО В МАССИВЕ ЗАКРЕПЛЕНО ЗА КЛЮЧОМ</text>

      {[
        { y: 66, i: 'proofs[0]', k: 'Алиса', ok: true },
        { y: 112, i: 'proofs[1]', k: 'Борис', ok: true },
        { y: 158, i: 'proofs[2]', k: 'Соня', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={150} height={34} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 22} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.i}</text>
          <Arrow x1={192} y1={r.y + 17} x2={240} y2={r.y + 17} color={r.ok ? ACCENT : 'rgba(255,255,255,0.3)'} w={2} />
          <rect x={254} y={r.y} width={150} height={34} rx={8}
            fill={r.ok ? SOFT : 'rgba(0,0,0,0.2)'} stroke={r.ok ? ACCENT : INK} strokeWidth={1.8} />
          <text x={329} y={r.y + 22} textAnchor="middle" fontSize={11.5} fill={r.ok ? ACCENT : FADE}>{r.k}</text>
          <text x={430} y={r.y + 22} fontSize={11.5} fill={r.ok ? '#fff' : FADE}>{r.ok ? 'подписал' : 'пусто'}</text>
        </g>
      ))}

      <rect x={560} y={66} width={230} height={126} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={580} y={94} fontSize={12} fontWeight={700} fill="#fff">2 из 3 → проходит</text>
      <text x={580} y={124} fontSize={11} fill={FADE}>a + b + s &gt;= 2</text>
      <text x={580} y={154} fontSize={11} fill={RED_TEXT}>1 из 3 → отказ</text>
      <text x={580} y={178} fontSize={11} fill={RED_TEXT}>перепутали места → отказ</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">подпись Алисы, положенная в proofs[1], не засчитывается: там ждут Бориса</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>пустая строка на своём месте — законное значение: так отмечают «этот не подписывал»</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>именно поэтому proofs — массив на восемь мест, а не одно поле подписи</text>
    </Panel>
  ),
};
