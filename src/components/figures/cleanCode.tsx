import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Чистый код»: множитель на ведомости, цена логики в теле
 * композабла и разбор инцидента по двум журналам. */

export const cleanCodeSchemes: Schemes = {
  'cc-multiplier': (aria) => (
    <Panel id="fig-cc-mult" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЭТО МНОЖИТЕЛЬ, А НЕ ОТДЕЛЬНЫЙ КРИТЕРИЙ</text>

      <text x={30} y={72} fontSize={12} fill={FADE}>149 аспектов ведомости</text>
      <rect x={30} y={84} width={760} height={40} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <rect x={34} y={88} width={655} height={32} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={362} y={109} textAnchor="middle" fontSize={12} fill={ACCENT}>101 аспект с оговоркой «половина оценки»</text>
      <text x={740} y={109} textAnchor="middle" fontSize={11.5} fill={FADE}>48 без</text>

      <text x={30} y={158} fontSize={12.5} fill="#fff">под оговоркой — примерно 86 из 100 баллов</text>

      <rect x={30} y={178} width={370} height={86} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={206} fontSize={12.5} fill="#fff">приложение сделано на 100%</text>
      <text x={52} y={228} fontSize={12} fill={FADE}>комментариев и логов нет</text>
      <text x={52} y={252} fontSize={15} fontWeight={700} fontFamily={MONO} fill="rgba(255,140,140,0.95)">57 баллов</text>

      <rect x={420} y={178} width={370} height={86} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={442} y={206} fontSize={12.5} fill="#fff">приложение сделано на 65%</text>
      <text x={442} y={228} fontSize={12} fill={ACCENT}>комментарии и логи есть</text>
      <text x={442} y={252} fontSize={15} fontWeight={700} fontFamily={MONO} fill={ACCENT}>65 баллов</text>

      <text x={30} y={294} fontSize={12.5} fill="#fff">двадцать шапок по полминуты — десять минут набора, которые спасают 43 балла</text>
    </Panel>
  ),

  'cc-recomposition': (aria) => (
    <Panel id="fig-cc-recomp" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА РАБОТА ПОЛЬЗОВАТЕЛЯ, 30 ВЫЗОВОВ ТЕЛА</text>

      <text x={30} y={72} fontSize={12.5} fill="#fff">логика в теле @Composable</text>
      <rect x={30} y={84} width={760} height={62} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 30 }, (_, i) => 44 + i * 24.6).map((x) => (
        <rect key={x} x={x} y={96} width={18} height={22} rx={4} fill="rgba(255,140,140,0.85)" />
      ))}
      <text x={50} y={136} fontSize={11.5} fill={FADE}>30 проходов фильтра · 900 созданных объектов форматтера</text>

      <text x={30} y={180} fontSize={12.5} fill={ACCENT}>логика вынесена, тело только рисует</text>
      <rect x={30} y={192} width={760} height={62} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={44} y={204} width={18} height={22} rx={4} fill={ACCENT} />
      <text x={80} y={220} fontSize={12} fill={ACCENT}>1 проход фильтра · 1 объект форматтера</text>
      <text x={50} y={244} fontSize={11.5} fill={FADE}>то же число рекомпозиций — но работы в них больше нет</text>

      <text x={30} y={286} fontSize={12.5} fill="#fff">«логика не в разметке» — не вкусовщина, а разница в девятьсот раз</text>
    </Panel>
  ),

  'cc-log-format': (aria) => (
    <Panel id="fig-cc-log" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ СБОЙ, ДВА ЖУРНАЛА</text>

      <rect x={30} y={64} width={360} height={166} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill={FADE}>как получилось</text>
      {['DEBUG  тут', 'DEBUG  ok', 'DEBUG  test', 'ERROR  ошибка', 'DEBUG  0'].map((t, i) => (
        <text key={t} x={50} y={116 + i * 20} fontSize={11} fontFamily={MONO} fill="rgba(255,255,255,0.6)">{t}</text>
      ))}
      <text x={50} y={222} fontSize={11.5} fill="rgba(255,140,140,0.95)">компонент неизвестен · причины нет</text>

      <rect x={430} y={64} width={360} height={166} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={450} y={92} fontSize={12} fill={ACCENT}>по регламенту</text>
      <text x={450} y={116} fontSize={10.5} fontFamily={MONO} fill="#fff">INFO  [CartScreen]: Экран создан</text>
      <text x={450} y={136} fontSize={10.5} fontFamily={MONO} fill="#fff">INFO  [CartRepository]: Запрос начат</text>
      <text x={450} y={156} fontSize={10.5} fontFamily={MONO} fill="#fff">DEBUG [CartRepository]: HTTP 200</text>
      <text x={450} y={176} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>ERROR [CartRepository]: Ошибка разбора</text>
      <text x={450} y={196} fontSize={10.5} fontFamily={MONO} fill={FADE}>      — пришло поле &quot;products&quot;</text>
      <text x={450} y={222} fontSize={11.5} fill={ACCENT}>компонент · 1165 мс · причина</text>

      <rect x={30} y={246} width={760} height={44} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={274} fontSize={12.5} fill="#fff">сбой один: сервер ответил 200, но поле называется products, а не items</text>

      <text x={30} y={312} fontSize={12.5} fill={FADE}>слева это не найти в принципе — не из чего; справа читается механически</text>
    </Panel>
  ),
};
