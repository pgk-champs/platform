import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «DOM и события»: текст против разметки, всплытие
 * и цена полной перерисовки. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webDomSchemes: Schemes = {
  'wd-text-vs-html': (aria) => (
    <Panel id="fig-wd-text" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА СТРОКА ОТ ПОЛЬЗОВАТЕЛЯ, ДВА СПОСОБА ВСТАВКИ</text>

      <rect x={30} y={62} width={760} height={34} rx={8} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={1.6} />
      <text x={46} y={84} fontSize={10.5} fontFamily={MONO} fill="#fff">{'<img src=x onerror=… >Баланс: 100'}</text>

      <rect x={30} y={112} width={370} height={128} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={138} fontSize={12} fontFamily={MONO} fill="#fff">innerHTML</text>
      <text x={50} y={164} fontSize={11} fill={FADE}>строка разбирается как разметка</text>
      <text x={50} y={188} fontSize={11} fill={RED_TEXT}>картинка не загрузилась — сработал код</text>
      <text x={50} y={212} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>заголовок вкладки стал «взломано»</text>

      <rect x={420} y={112} width={370} height={128} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={138} fontSize={12} fontFamily={MONO} fill="#fff">textContent</text>
      <text x={440} y={164} fontSize={11} fill={FADE}>строка остаётся строкой</text>
      <text x={440} y={188} fontSize={11} fill={ACCENT}>на странице виден сам текст с угловыми скобками</text>
      <text x={440} y={212} fontSize={11} fill={ACCENT}>выполнять нечего</text>

      <text x={30} y={272} fontSize={12.5} fill="#fff">всё, что пришло от пользователя или из сети, вставляют текстом — это не осторожность, а правило</text>
      <text x={30} y={296} fontSize={12.5} fill={FADE}>адрес кошелька, имя, комментарий: любое из этого может оказаться разметкой с кодом внутри</text>
    </Panel>
  ),

  'wd-delegation': (aria) => (
    <Panel id="fig-wd-deleg" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СОБЫТИЕ ВСПЛЫВАЕТ ОТ КНОПКИ ВВЕРХ</text>

      <rect x={30} y={70} width={430} height={130} rx={12} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={48} y={94} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>контейнер — обработчик здесь</text>

      {[{ x: 56, t: '1' }, { x: 150, t: '2' }, { x: 244, t: '3' }].map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={124} width={76} height={40} rx={8}
            fill={i === 2 ? 'rgba(0,0,0,0.2)' : SOFT} stroke={i === 2 ? INK : ACCENT} strokeWidth={2}
            strokeDasharray={i === 2 ? '4 3' : undefined} />
          <text x={b.x + 38} y={149} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={i === 2 ? FADE : ACCENT}>{b.t}</text>
          <Arrow x1={b.x + 38} y1={120} x2={b.x + 38} y2={102} color={ACCENT} w={2} />
        </g>
      ))}
      <text x={344} y={149} fontSize={10.5} fill={FADE}>третья добавлена</text>
      <text x={344} y={165} fontSize={10.5} fill={FADE}>уже потом</text>

      <rect x={484} y={70} width={306} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={502} y={96} fontSize={11.5} fill="#fff">что вывел прогон</text>
      <text x={502} y={122} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>кнопка 1: сработали оба</text>
      <text x={502} y={144} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>кнопка 2: сработал контейнер</text>
      <text x={502} y={166} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>кнопка 3: сработал контейнер</text>
      <text x={502} y={188} fontSize={10.5} fill={FADE}>обработчик один на всех</text>

      <text x={30} y={246} fontSize={12.5} fill="#fff">один обработчик на контейнере ловит нажатия и на тех кнопках, которых в момент навешивания не было</text>
      <text x={30} y={270} fontSize={12.5} fill={FADE}>кого именно нажали — видно из события; так делают списки, где строки появляются и исчезают</text>
    </Panel>
  ),

  'wd-rerender-cost': (aria) => (
    <Panel id="fig-wd-cost" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТАБЛИЦА НА 200 СТРОК: ИЗМЕНИЛОСЬ ОДНО ЧИСЛО</text>

      <text x={30} y={70} fontSize={11.5} fill={RED_TEXT}>перерисовали всё целиком</text>
      <rect x={30} y={80} width={520} height={24} rx={5} fill="rgba(255,140,140,0.16)" stroke={RED} strokeWidth={1.8} />
      <text x={562} y={97} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>33.27 мс</text>

      <text x={30} y={134} fontSize={11.5} fill={ACCENT}>поменяли одну ячейку</text>
      <rect x={30} y={144} width={4} height={24} rx={2} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={46} y={161} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>0.003 мс — в десять тысяч раз быстрее</text>

      <rect x={30} y={188} width={760} height={70} rx={11} fill="rgba(255,140,140,0.10)" stroke={RED} strokeWidth={2} />
      <text x={48} y={212} fontSize={11.5} fill="#fff">и дело не только в скорости — вот что не пережило перерисовку:</text>
      <text x={48} y={234} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>поле внутри списка: фокус true → false, текст «моя заметка» → пусто</text>
      <text x={48} y={252} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>подсветка строки, поставленная кодом: пропала</text>

      <text x={30} y={288} fontSize={12.5} fill="#fff">делать точечно — быстро и безопасно, но вручную это десятки мест, которые надо не забыть обновить</text>
    </Panel>
  ),
};
