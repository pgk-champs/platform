import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Тесты контрактов»: два вида тестов, что даёт фикстура
 * и что показывают статистика газа и покрытие. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const hardhatTestSchemes: Schemes = {
  'ht-two-kinds': (aria) => (
    <Panel id="fig-ht-kinds" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА ВИДА ТЕСТОВ В ОДНОМ ПРОЕКТЕ</text>

      <rect x={30} y={66} width={370} height={160} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">contracts/Vault.t.sol</text>
      <text x={50} y={118} fontSize={11} fill={FADE}>пишут на Solidity, рядом с контрактом</text>
      <text x={50} y={142} fontSize={11} fill={ACCENT}>подменяют отправителя и выдают эфир</text>
      <text x={50} y={166} fontSize={11} fill={ACCENT}>гоняют случайные входные данные</text>
      <text x={50} y={190} fontSize={11} fill={FADE}>быстрые: сети снаружи нет вовсе</text>
      <text x={50} y={214} fontSize={11} fill={FADE}>не видят кошелька и внешних служб</text>

      <rect x={420} y={66} width={370} height={160} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">test/Vault.ts</text>
      <text x={440} y={118} fontSize={11} fill={FADE}>пишут на TypeScript, через ethers</text>
      <text x={440} y={142} fontSize={11} fill={ACCENT}>проверяют события и изменения балансов</text>
      <text x={440} y={166} fontSize={11} fill={ACCENT}>тот же код, что пойдёт в скрипты и сайт</text>
      <text x={440} y={190} fontSize={11} fill={FADE}>умеют ходить в настоящую сеть</text>
      <text x={440} y={214} fontSize={11} fill={FADE}>медленнее, зато ближе к жизни</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">одна команда запускает оба набора: 5 тестов на Solidity и 8 на TypeScript</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>логику контракта удобнее проверять первым видом, сценарий целиком — вторым</text>
    </Panel>
  ),

  'ht-fixture': (aria) => (
    <Panel id="fig-ht-fix" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ВТОРОЙ ТЕСТ, ДВА ИСХОДА</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">контракт развёрнут один раз на всех</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={FADE}>после первого теста: 1.0</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>в начале второго : 1.0</text>
      <text x={50} y={172} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>expected 1000000000000000000 to equal 0</text>
      <text x={50} y={196} fontSize={11} fill={RED_TEXT}>тесты зависят от порядка запуска</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">каждый тест берёт фикстуру</text>
      <text x={440} y={120} fontSize={11} fontFamily={MONO} fill={FADE}>после первого теста: 1.0</text>
      <text x={440} y={144} fontSize={11} fontFamily={MONO} fill={ACCENT}>в начале второго : 0.0</text>
      <text x={440} y={172} fontSize={11} fill={ACCENT}>сеть откатилась к снимку</text>
      <text x={440} y={196} fontSize={11} fill={ACCENT}>порядок запуска перестал значить что-либо</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">фикстура выполняется один раз, дальше сеть просто откатывается к снимку — это быстрее развёртывания</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>тест, который проходит только вторым по счёту, — не тест, а совпадение</text>
    </Panel>
  ),

  'ht-gas-coverage': (aria) => (
    <Panel id="fig-ht-gas" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПОКАЗЫВАЮТ ДВА ФЛАГА</text>

      <text x={30} y={68} fontSize={12} fontFamily={MONO} fill="#fff">--gas-stats</text>
      {[
        { y: 80, n: 'deposit', v: '67 481', w: 300 },
        { y: 112, n: 'withdraw', v: '32 285', w: 144 },
        { y: 144, n: 'setRate', v: '28 823', w: 128 },
        { y: 176, n: 'rate (чтение)', v: '23 490', w: 104 },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 16} fontSize={11} fontFamily={MONO} fill={FADE}>{r.n}</text>
          <rect x={150} y={r.y + 2} width={r.w} height={18} rx={5} fill={SOFT} stroke={ACCENT} strokeWidth={1.4} />
          <text x={150 + r.w + 12} y={r.y + 16} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
        </g>
      ))}
      <text x={30} y={218} fontSize={11} fill={FADE}>развёртывание — 586 384; тело контракта — 2253 байта</text>

      <text x={540} y={68} fontSize={12} fontFamily={MONO} fill="#fff">--coverage</text>
      <rect x={540} y={80} width={250} height={56} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={558} y={104} fontSize={11} fontFamily={MONO} fill={ACCENT}>все 13 тестов: 100.00 %</text>
      <text x={558} y={126} fontSize={11} fill={FADE}>непокрытых строк нет</text>
      <rect x={540} y={148} width={250} height={70} rx={9} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={1.8} />
      <text x={558} y={172} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>убрали два теста: 80.00 %</text>
      <text x={558} y={194} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>Uncovered Lines: 39-40, 44</text>
      <text x={558} y={212} fontSize={10.5} fill={FADE}>это проверка владельца и расчёт</text>

      <text x={30} y={256} fontSize={12.5} fill="#fff">газ показывает, что дорого; покрытие — до чего тесты не дотянулись ни разу</text>
      <text x={30} y={280} fontSize={12.5} fill={FADE}>сто процентов покрытия не означают, что логика верна: означают лишь, что каждая строка исполнялась</text>
    </Panel>
  ),
};
