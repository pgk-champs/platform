import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «dApp на RIDE»: устройство вызываемой функции, список
 * возможных действий и кто чьё состояние меняет. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesDappSchemes: Schemes = {
  'wdp-callable': (aria) => (
    <Panel id="fig-wdp-call" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЫЗЫВАЕМАЯ ФУНКЦИЯ ВОЗВРАЩАЕТ СПИСОК ДЕЙСТВИЙ</text>

      <rect x={30} y={64} width={430} height={170} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>@Callable(i)</text>
      <text x={50} y={116} fontSize={11.5} fontFamily={MONO} fill="#fff">func zavesti(id: String, fio: String) = {'{'}</text>
      <text x={50} y={142} fontSize={11.5} fontFamily={MONO} fill={FADE}>  let kluch = "z_" + id</text>
      <text x={50} y={166} fontSize={11.5} fontFamily={MONO} fill={FADE}>  …проверки…</text>
      <text x={50} y={192} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>  [ StringEntry(kluch, fio) ]</text>
      <text x={50} y={216} fontSize={11.5} fontFamily={MONO} fill="#fff">{'}'}</text>

      <Arrow x1={474} y1={150} x2={524} y2={150} color={ACCENT} w={2.4} />

      <rect x={538} y={64} width={252} height={170} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={558} y={92} fontSize={12} fontWeight={700} fill="#fff">i — кто и с чем пришёл</text>
      <text x={558} y={122} fontSize={11} fontFamily={MONO} fill={ACCENT}>i.caller</text>
      <text x={558} y={142} fontSize={10.5} fill={FADE}>адрес вызвавшего</text>
      <text x={558} y={170} fontSize={11} fontFamily={MONO} fill={ACCENT}>i.payments</text>
      <text x={558} y={190} fontSize={10.5} fill={FADE}>что приложено к вызову</text>
      <text x={558} y={216} fontSize={11} fontFamily={MONO} fill={ACCENT}>i.transactionId</text>

      <text x={30} y={268} fontSize={12.5} fill="#fff">функция ничего не пишет сама: она возвращает список того, что сеть должна сделать</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>вернуть одно действие вместо списка нельзя — компилятор перечислит все допустимые типы</text>
    </Panel>
  ),

  'wdp-actions': (aria) => (
    <Panel id="fig-wdp-act" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО МОЖНО ПОЛОЖИТЬ В СПИСОК ДЕЙСТВИЙ</text>

      {[
        { y: 64, a: 'IntegerEntry', d: 'записать число в своё состояние' },
        { y: 98, a: 'StringEntry', d: 'записать строку' },
        { y: 132, a: 'BooleanEntry / BinaryEntry', d: 'записать да-нет или байты' },
        { y: 166, a: 'DeleteEntry', d: 'удалить ключ' },
        { y: 200, a: 'ScriptTransfer', d: 'отправить деньги со счёта dApp' },
        { y: 234, a: 'Issue / Reissue / Burn', d: 'выпустить, допечатать, сжечь токен' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={28} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={46} y={r.y + 19} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.a}</text>
          <text x={300} y={r.y + 19} fontSize={12} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={282} fontSize={12.5} fill="#fff">всё, что делает dApp, — в этом списке: другого способа изменить мир у него нет</text>
    </Panel>
  ),

  'wdp-who': (aria) => (
    <Panel id="fig-wdp-who" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВЫЗЫВАЕТ ОДИН, МЕНЯЕТСЯ СОСТОЯНИЕ ДРУГОГО</text>

      <rect x={30} y={66} width={220} height={110} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={94} fontSize={12} fontWeight={700} fill="#fff">Вызвавший</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>3MGuDcHHKqHaU1CDt5a98…</text>
      <text x={50} y={146} fontSize={11} fill={FADE}>подписал транзакцию 16</text>
      <text x={50} y={166} fontSize={11} fill={FADE}>заплатил 0,005 WAVES</text>

      <Arrow x1={264} y1={120} x2={324} y2={120} color={ACCENT} w={2.4} />
      <text x={294} y={108} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>invoke</text>

      <rect x={338} y={66} width={452} height={110} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={358} y={94} fontSize={12} fontWeight={700} fill="#fff">Аккаунт dApp</text>
      <text x={358} y={120} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>3M52rTnLTitKusqJ9JCtJs4JCiptN9Yq4RX</text>
      <text x={358} y={146} fontSize={11} fill="#fff">this — это он: запись идёт в ЕГО состояние</text>
      <text x={358} y={166} fontSize={11} fill={FADE}>и деньги ScriptTransfer уходят с его счёта</text>

      <text x={30} y={216} fontSize={12.5} fill="#fff">i.caller — вызвавший, this — сам dApp: перепутать их значит написать не ту программу</text>
      <text x={30} y={242} fontSize={12.5} fill={FADE}>ключи, привязанные к пользователю, поэтому и делают составными: "vklad_" + i.caller.toString()</text>
      <text x={30} y={270} fontSize={12.5} fill={ACCENT}>состояние вызвавшего dApp изменить не может — только своё</text>
    </Panel>
  ),
};
