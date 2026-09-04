import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «TypeScript и JavaScript»: исчезновение типов при компиляции,
 * что ловит проверка типов и что не ловит никто, дыра any и типизация
 * ответа REST-запроса к ноде. */

export const tsJsSchemes: Schemes = {
  /* типы живут до компиляции, в рантайм уезжает чистый JS */
  'tj-compile-away': (aria) => (
    <Panel id="fig-tj-compile" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТИПЫ ИСЧЕЗАЮТ ПРИ КОМПИЛЯЦИИ</text>

      <rect x={30} y={62} width={230} height={150} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={88} fontSize={13} fontWeight={700} fill={ACCENT}>contract.ts</text>
      <text x={50} y={116} fontSize={12.5} fontFamily={MONO} fill="#fff">const h: string =</text>
      <text x={50} y={136} fontSize={12.5} fontFamily={MONO} fill="#fff">  tx.id;</text>
      <text x={50} y={162} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>interface NodeInfo</text>
      <text x={50} y={182} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>type Height = number</text>
      <text x={50} y={204} fontSize={11.5} fill={FADE}>типы видит только tsc</text>

      <Arrow x1={270} y1={137} x2={330} y2={137} color={ACCENT} w={4} />
      <text x={300} y={120} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>tsc</text>

      <rect x={340} y={62} width={200} height={150} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={360} y={88} fontSize={13} fontWeight={700} fill="#fff">проверка типов</text>
      <text x={360} y={118} fontSize={12} fill={FADE}>совпадают ли типы</text>
      <text x={360} y={138} fontSize={12} fill={FADE}>во всех местах кода</text>
      <text x={440} y={178} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT}>ошибка или</text>
      <text x={440} y={198} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT}>тишина</text>

      <Arrow x1={550} y1={137} x2={610} y2={137} color={ACCENT} w={4} />
      <text x={580} y={120} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>emit</text>

      <rect x={620} y={62} width={170} height={150} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={640} y={88} fontSize={13} fontWeight={700} fill="#fff">contract.js</text>
      <text x={640} y={116} fontSize={12.5} fontFamily={MONO} fill="#fff">const h =</text>
      <text x={640} y={136} fontSize={12.5} fontFamily={MONO} fill="#fff">  tx.id;</text>
      <text x={640} y={168} fontSize={12} fill={FADE}>ни одной аннотации</text>
      <text x={640} y={186} fontSize={12} fill={FADE}>не осталось</text>

      <FileIcon x={80} y={236} accent />
      <text x={190} y={262} fontSize={13} fontWeight={700} fill="#fff">пишешь ты — TypeScript</text>
      <text x={190} y={282} fontSize={12} fill={FADE}>аннотации, интерфейсы, дженерики</text>
      <FileIcon x={470} y={236} />
      <text x={580} y={262} fontSize={13} fontWeight={700} fill="#fff">выполняет Node — JavaScript</text>
      <text x={580} y={282} fontSize={12} fill={FADE}>TypeScript в рантайме отсутствует</text>
      <text x={410} y={314} textAnchor="middle" fontSize={13} fill={FADE}>нода исполняет только JS: проверка типов заканчивается там же, где сборка</text>
    </Panel>
  ),

  /* что ловит компилятор до запуска и что не ловит никто */
  'tj-type-catches': (aria) => (
    <Panel id="fig-tj-catches" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГРАНИЦА ОТВЕТСТВЕННОСТИ ПРОВЕРКИ ТИПОВ</text>

      <rect x={30} y={62} width={370} height={216} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={90} fontSize={14} fontWeight={700} fill={ACCENT}>ловит tsc до запуска</text>
      {[
        'опечатка в имени поля: tx.snder',
        'число туда, где ждут строку',
        'забытый await у Promise',
        'необработанный вариант union',
        'обращение к полю, которого нет',
      ].map((t, i) => (
        <text key={t} x={52} y={122 + i * 28} fontSize={12.5} fill="#fff">{t}</text>
      ))}
      <text x={52} y={264} fontSize={11.5} fill={FADE}>цена ошибки — красная строка в редакторе</text>

      <rect x={420} y={62} width={370} height={216} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={442} y={90} fontSize={14} fontWeight={700} fill="#fff">не ловит никто</text>
      {[
        'нода вернула не то, что обещала',
        'неверная формула комиссии',
        'перепутаны местами два адреса',
        'сеть отвалилась на середине',
        'контракт развёрнут не в ту сеть',
      ].map((t, i) => (
        <text key={t} x={442} y={122 + i * 28} fontSize={12.5} fill={FADE}>{t}</text>
      ))}
      <text x={442} y={264} fontSize={11.5} fill={FADE}>цена ошибки — транзакция в блокчейне</text>

      <text x={410} y={306} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff">типы проверяют форму данных, а не смысл действий</text>
      <text x={410} y={328} textAnchor="middle" fontSize={13} fill={FADE}>зелёная сборка означает «согласовано», а не «правильно»</text>
    </Panel>
  ),

  /* any как дыра, через которую проверка перестаёт работать дальше по коду */
  'tj-any-hole': (aria) => (
    <Panel id="fig-tj-any" w={820} h={320} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ANY — ДЫРА В ПРОВЕРКЕ, А НЕ УДОБНЫЙ ТИП</text>

      <rect x={30} y={64} width={200} height={110} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={130} y={94} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">ответ ноды</text>
      <text x={130} y={124} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>res.json()</text>
      <text x={130} y={152} textAnchor="middle" fontSize={12} fill={FADE}>форма неизвестна</text>

      <Arrow x1={240} y1={119} x2={300} y2={119} color={ACCENT} w={4} />

      <rect x={310} y={64} width={200} height={110} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={410} y={94} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">данные как any</text>
      <text x={410} y={126} textAnchor="middle" fontSize={20} fontWeight={800} fill={ACCENT}>проверка off</text>
      <text x={410} y={152} textAnchor="middle" fontSize={12} fill={FADE}>компилятор молчит на всё</text>

      <Arrow x1={520} y1={119} x2={580} y2={119} color={ACCENT} w={4} />

      <rect x={590} y={64} width={200} height={110} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={690} y={94} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">весь код ниже</text>
      <text x={690} y={124} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>data.hieght + 1</text>
      <text x={690} y={152} textAnchor="middle" fontSize={12} fill={FADE}>опечатка доживёт до рантайма</text>

      <text x={410} y={210} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff">any заразен: он передаётся дальше по цепочке присваиваний</text>

      <rect x={110} y={230} width={280} height={62} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2} />
      <text x={250} y={254} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">any — «доверяй мне»</text>
      <text x={250} y={276} textAnchor="middle" fontSize={12} fill={FADE}>ошибку увидишь в проде</text>

      <rect x={430} y={230} width={280} height={62} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={570} y={254} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ACCENT}>unknown — «сначала проверь»</text>
      <text x={570} y={276} textAnchor="middle" fontSize={12} fill={FADE}>компилятор требует проверки</text>
    </Panel>
  ),

  /* путь ответа REST-запроса к ноде: из сети до типизированного объекта */
  'tj-api-response': (aria) => (
    <Panel id="fig-tj-api" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТВЕТ НОДЫ · ОТ JSON К ТИПИЗИРОВАННОМУ ОБЪЕКТУ</text>

      <rect x={30} y={64} width={180} height={120} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={120} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">нода</text>
      <text x={120} y={118} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>localhost:6862</text>
      <text x={120} y={144} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">GET /blocks/height</text>
      <text x={120} y={168} textAnchor="middle" fontSize={11.5} fill={FADE}>отдаёт обычный JSON</text>

      <Arrow x1={220} y1={124} x2={280} y2={124} color={ACCENT} w={4} />

      <rect x={290} y={64} width={230} height={120} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={405} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">граница типов</text>
      <text x={405} y={122} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>await res.json()</text>
      <text x={405} y={148} textAnchor="middle" fontSize={12} fill={FADE}>здесь TS ничего не знает</text>
      <text x={405} y={168} textAnchor="middle" fontSize={12} fill={FADE}>о содержимом ответа</text>

      <Arrow x1={530} y1={124} x2={590} y2={124} color={ACCENT} w={4} />

      <rect x={600} y={64} width={190} height={120} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={695} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>BlockHeight</text>
      <text x={695} y={120} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">height: number</text>
      <text x={695} y={146} textAnchor="middle" fontSize={12} fill={FADE}>дальше по коду —</text>
      <text x={695} y={164} textAnchor="middle" fontSize={12} fill={FADE}>подсказки и проверки</text>

      <rect x={290} y={214} width={230} height={80} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={405} y={240} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ACCENT}>проверка перед доверием</text>
      <text x={405} y={262} textAnchor="middle" fontSize={12} fill="#fff">typeof data.height</text>
      <text x={405} y={282} textAnchor="middle" fontSize={12} fill="#fff">равно 'number'</text>

      <text x={410} y={324} textAnchor="middle" fontSize={13} fill={FADE}>интерфейс — обещание о форме ответа; проверка в коде — то, что делает обещание правдой</text>
    </Panel>
  ),
};
