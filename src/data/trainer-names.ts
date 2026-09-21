// Подписи и глифы механик для Зала. Единственное, что здесь ведётся руками:
// имя механики из данных не выводится — в главах лежат названия упражнений, и
// «Квест: оформи выпуск версии», «Квест: прямая история против развилки»,
// «Квест: подключись к серверу по ключу» дали бы трём разным механикам одно
// имя «Квест».
//
// Состав упражнений, главы, треки и якоря генерятся в src/data/trainers.json.
// Страж в scripts/trainers.test.mjs не даёт списку отстать в обе стороны:
// механика без подписи и подпись без механики одинаково роняют тесты. Отступ
// перед ключом ровно два пробела — на него смотрит страж.
//
// glyph — не рисунок на каждую из 46, а одно из десяти СЕМЕЙСТВ по роду
// упражнения (см. GLYPH_MEANING в TrainerGlyph.tsx): на 22 пикселях сорок
// шесть уникальных значков не информативнее десяти, зато список стал бы
// неподъёмным.

import type { GlyphId } from '../components/TrainerGlyph';

export type TrainerName = { name: string; blurb: string; glyph: GlyphId };

export const TRAINER_NAMES: Record<string, TrainerName> = {
  CodeTyping: { name: 'Слепая печать', blurb: 'Набирай команды и код, не глядя на клавиши', glyph: 'keyboard' },
  TerminalSim: { name: 'Терминал Linux', blurb: 'Квесты в настоящей командной строке', glyph: 'terminal' },
  PredictOutput: { name: 'Предскажи вывод', blurb: 'Что напечатает этот код', glyph: 'code' },
  GitSim: { name: 'Git-симулятор', blurb: 'Коммиты, ветки и merge по шагам', glyph: 'git' },
  MatchPairs: { name: 'Найди пару', blurb: 'Соедини понятие с тем, что оно значит', glyph: 'words' },
  WordOrder: { name: 'Собери фразу', blurb: 'Расставь слова перевода по порядку', glyph: 'words' },
  WizardOrder: { name: 'Порядок шагов', blurb: 'Разложи шаги мастера как надо', glyph: 'quest' },
  HotkeyTrainer: { name: 'Горячие клавиши', blurb: 'Нажми сочетание, не открывая меню', glyph: 'ide' },
  SelectionSandbox: { name: 'Выделение текста', blurb: 'Выдели и скопируй без мыши', glyph: 'ide' },
  TranslatorBox: { name: 'Переводчик под рукой', blurb: 'Отправь фразу в переводчик не выходя из главы', glyph: 'words' },
  ComposePreview: { name: 'Живой мокап Compose', blurb: 'Крути экран и смотри, что получается', glyph: 'screen' },
  SshQuest: { name: 'Квест SSH', blurb: 'Подключись к серверу по ключу', glyph: 'terminal' },
  HashPlayground: { name: 'Хеш-площадка', blurb: 'Поменяй букву и увидь лавинный эффект', glyph: 'chain' },
  BlockChainDemo: { name: 'Цепочка блоков', blurb: 'Испорти блок и почини всю цепь', glyph: 'chain' },
  PowMiner: { name: 'PoW-майнер', blurb: 'Подбери nonce руками', glyph: 'chain' },
  SignDemo: { name: 'Цифровая подпись', blurb: 'Подпиши сообщение и попробуй подделать', glyph: 'chain' },
  NodeNetSim: { name: 'Сеть из трёх нод', blurb: 'Погаси ноду и посмотри, что станет с сетью', glyph: 'chain' },
  ComposeBuilder: { name: 'Конструктор docker-compose', blurb: 'Собери файл из готовых кусков', glyph: 'graph' },
  DockerCmdQuest: { name: 'Команды Docker по порядку', blurb: 'От конфигов до остановки', glyph: 'quest' },
  ErrorTranslator: { name: 'Переводчик ошибок', blurb: 'Что на самом деле говорит компилятор', glyph: 'code' },
  ReverseQuiz: { name: 'Обратный квиз', blurb: 'С русского на английский, без подсказок', glyph: 'words' },
  FsTreeViz: { name: 'Дерево файлов', blurb: 'Куда именно ведёт этот cd', glyph: 'terminal' },
  MiniFileManager: { name: 'Мини-файловый менеджер', blurb: 'Копируй и переноси файлы командами', glyph: 'terminal' },
  ChmodCalc: { name: 'Калькулятор chmod', blurb: 'Собери права галочками и получи число', glyph: 'terminal' },
  NanoQuest: { name: 'Редактор nano', blurb: 'Сохранить и выйти, не закрывая терминал', glyph: 'terminal' },
  PermQuest: { name: 'Права на файл', blurb: 'Кто и что может с этим файлом', glyph: 'terminal' },
  GitStatusReader: { name: 'Чтение git status', blurb: 'Что попадёт в коммит, а что нет', glyph: 'git' },
  CommitMsgBuilder: { name: 'Сообщение коммита', blurb: 'Собери понятное сообщение из частей', glyph: 'git' },
  FetchPullViz: { name: 'fetch, merge и pull', blurb: 'Три команды по шагам, без путаницы', glyph: 'git' },
  PRTrainer: { name: 'Мини-ревью', blurb: 'Найди три проблемы в чужом diff', glyph: 'git' },
  IdeTour: { name: 'Экскурсия по IDE', blurb: 'Найди нужную панель в окне', glyph: 'ide' },
  MemoryViz: { name: 'Ячейки памяти', blurb: 'Что происходит с val и var', glyph: 'code' },
  BugHunt: { name: 'Охота на ошибки', blurb: 'Кликни строку, которая не соберётся', glyph: 'code' },
  CallTracer: { name: 'Трассировка вызова', blurb: 'Проследи, куда уходит каждый шаг', glyph: 'code' },
  SignatureBuilder: { name: 'Конструктор сигнатуры', blurb: 'Собери объявление функции из кусочков', glyph: 'code' },
  DataClassBuilder: { name: 'Конструктор data class', blurb: 'Собери класс и увидь, что сгенерится', glyph: 'code' },
  MapFilterViz: { name: 'Конвейер map и filter', blurb: 'Смотри, как список меняется по шагам', glyph: 'code' },
  CodeSketchMatch: { name: 'Код и скетч', blurb: 'Что нарисует этот фрагмент', glyph: 'screen' },
  ModifierChain: { name: 'Цепочка Modifier', blurb: 'Порядок решает — собери правильный', glyph: 'screen' },
  RememberSim: { name: 'remember и без него', blurb: 'Увидь разницу своими глазами', glyph: 'screen' },
  RecompositionCounter: { name: 'Счётчик перерисовок', blurb: 'Кто перерисовался и почему', glyph: 'screen' },
  EyeDp: { name: 'Глазомер', blurb: 'Сколько тут dp — на глаз', glyph: 'screen' },
  CardAssembler: { name: 'Сборка карточки', blurb: 'Разложи элементы карточки по местам', glyph: 'screen' },
  ModuleGraph: { name: 'Граф зависимостей', blurb: 'Собери связи между модулями', glyph: 'graph' },
  ModuleSort: { name: 'Разбор по модулям', blurb: 'Какой класс в каком модуле живёт', glyph: 'graph' },
  ApiVisToggle: { name: 'api или implementation', blurb: 'Что увидит :app при каждом варианте', glyph: 'graph' },
};
