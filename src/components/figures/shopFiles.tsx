import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Картинки и файлы»: сборка адреса файла из полей записи,
 * устройство multipart-запроса, поведение уменьшенных копий. */

export const shopFilesSchemes: Schemes = {
  'sf-file-url': (aria) => (
    <Panel id="fig-sf-url" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>В ЗАПИСИ ЛЕЖИТ ИМЯ ФАЙЛА, А НЕ ССЫЛКА</text>

      <rect x={30} y={62} width={340} height={126} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'"collectionId": "pbc_987692768"'}</text>
      <text x={50} y={118} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'"id": "yzzw0qwd6b6bo0c"'}</text>
      <text x={50} y={146} fontSize={12} fontFamily={MONO} fill={ACCENT}>{'"newsImage": "banner_y2zhtudxtd.png"'}</text>
      <text x={50} y={172} fontSize={11} fill={FADE}>три поля одной записи акции</text>

      <Arrow x1={382} y1={124} x2={422} y2={124} color={ACCENT} w={3} />

      <rect x={434} y={62} width={356} height={126} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={90} fontSize={11.5} fill="#fff">/api/files/</text>
      <text x={452} y={114} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>pbc_987692768/</text>
      <text x={452} y={138} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>yzzw0qwd6b6bo0c/</text>
      <text x={452} y={162} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>banner_y2zhtudxtd.png</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">подставить это имя в тег картинки напрямую нельзя — адрес собирается из трёх частей</text>
      <text x={30} y={256} fontSize={12.5} fill={FADE}>пустая строка в поле означает, что файла нет: показывать надо заглушку, а не битую картинку</text>
      <text x={30} y={284} fontSize={12.5} fill={ACCENT}>картинки каталога и акций отдаются без токена — они публичные</text>
    </Panel>
  ),

  'sf-multipart': (aria) => (
    <Panel id="fig-sf-mp" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТЕЛО ЗАПРОСА С ФАЙЛОМ</text>

      <rect x={30} y={62} width={470} height={210} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={88} fontSize={11} fontFamily={MONO} fill={FADE}>--граница</text>
      <text x={48} y={110} fontSize={11} fontFamily={MONO} fill="#fff">name=&quot;title&quot;</text>
      <text x={48} y={130} fontSize={11} fontFamily={MONO} fill={ACCENT}>Летний забег</text>
      <text x={48} y={154} fontSize={11} fontFamily={MONO} fill={FADE}>--граница</text>
      <text x={48} y={176} fontSize={11} fontFamily={MONO} fill="#fff">name=&quot;image&quot;; filename=&quot;moy-proekt.png&quot;</text>
      <text x={48} y={196} fontSize={11} fontFamily={MONO} fill="#fff">Content-Type: image/png</text>
      <text x={48} y={218} fontSize={11} fontFamily={MONO} fill={ACCENT}>‹1290 байт двоичных данных›</text>
      <text x={48} y={244} fontSize={11} fontFamily={MONO} fill={FADE}>--граница--</text>
      <text x={48} y={264} fontSize={10.5} fill={FADE}>обычные поля и файл едут вместе, каждое своей частью</text>

      <rect x={520} y={62} width={270} height={96} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={540} y={90} fontSize={12.5} fill={ACCENT}>@Part(&quot;title&quot;) RequestBody</text>
      <text x={540} y={116} fontSize={11.5} fill="#fff">обычное поле — с именем</text>
      <text x={540} y={140} fontSize={11.5} fill="#fff">строку сначала в RequestBody</text>

      <rect x={520} y={176} width={270} height={96} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={540} y={204} fontSize={12.5} fill="#fff">@Part MultipartBody.Part</text>
      <text x={540} y={230} fontSize={11.5} fill={FADE}>файл — БЕЗ имени в скобках</text>
      <text x={540} y={254} fontSize={11.5} fill={FADE}>имя внутри createFormData</text>

      <text x={30} y={300} fontSize={12.5} fill={ACCENT}>имя в скобках у файла — частая ошибка: часть уедет дважды и сервер её не примет</text>
    </Panel>
  ),

  'sf-thumb': (aria) => (
    <Panel id="fig-sf-thumb" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>?thumb= РАБОТАЕТ НЕ ДЛЯ ЛЮБОГО РАЗМЕРА</text>

      {[
        { x: 30, t: '?thumb=100x100', b: '226 байт', ok: true, n: 'размер объявлен' },
        { x: 288, t: '?thumb=300x120', b: '633 байта', ok: true, n: 'размер объявлен' },
        { x: 546, t: '?thumb=50x50', b: '810 байт', ok: false, n: 'пришёл ОРИГИНАЛ' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={68} width={244} height={104} rx={12}
            fill={c.ok ? SOFT : 'rgba(0,0,0,0.3)'} stroke={c.ok ? ACCENT : INK} strokeWidth={2.5} />
          <text x={c.x + 122} y={98} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={c.ok ? ACCENT : '#fff'}>{c.t}</text>
          <text x={c.x + 122} y={126} textAnchor="middle" fontSize={13} fill="#fff">{c.b}</text>
          <text x={c.x + 122} y={152} textAnchor="middle" fontSize={11} fill={FADE}>{c.n}</text>
        </g>
      ))}

      <rect x={30} y={196} width={760} height={44} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={224} fontSize={12} fill="#fff">незаявленный размер не даёт ошибки — молча приходит файл целиком</text>

      <text x={30} y={270} fontSize={12.5} fill={ACCENT}>надёжнее просить оригинал и уменьшать на устройстве: Coil делает это сам</text>
    </Panel>
  ),
};
