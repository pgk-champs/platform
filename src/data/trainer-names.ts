// Подписи механик для Зала. Единственное, что здесь ведётся руками: имя
// механики из данных не выводится — в главах лежат названия упражнений, и
// «Квест: оформи выпуск версии», «Квест: прямая история против развилки»,
// «Квест: подключись к серверу по ключу» дали бы трём разным механикам одно
// имя «Квест».
//
// Состав упражнений, главы, треки и якоря генерятся в src/data/trainers.json.
// Страж в scripts/trainers.test.mjs не даёт списку отстать в обе стороны:
// механика без подписи и подпись без механики одинаково роняют тесты. Отступ
// перед ключом ровно два пробела — на него смотрит страж.

export type TrainerName = { name: string; blurb: string };

export const TRAINER_NAMES: Record<string, TrainerName> = {
  CodeTyping: { name: 'Слепая печать', blurb: 'Набирай команды и код, не глядя на клавиши' },
  TerminalSim: { name: 'Терминал Linux', blurb: 'Квесты в настоящей командной строке' },
  PredictOutput: { name: 'Предскажи вывод', blurb: 'Что напечатает этот код' },
  GitSim: { name: 'Git-симулятор', blurb: 'Коммиты, ветки и merge по шагам' },
  MatchPairs: { name: 'Найди пару', blurb: 'Соедини понятие с тем, что оно значит' },
  WordOrder: { name: 'Собери фразу', blurb: 'Расставь слова перевода по порядку' },
  WizardOrder: { name: 'Порядок шагов', blurb: 'Разложи шаги мастера как надо' },
  HotkeyTrainer: { name: 'Горячие клавиши', blurb: 'Нажми сочетание, не открывая меню' },
  SelectionSandbox: { name: 'Выделение текста', blurb: 'Выдели и скопируй без мыши' },
  TranslatorBox: { name: 'Переводчик под рукой', blurb: 'Отправь фразу в переводчик не выходя из главы' },
  ComposePreview: { name: 'Живой мокап Compose', blurb: 'Крути экран и смотри, что получается' },
  SshQuest: { name: 'Квест SSH', blurb: 'Подключись к серверу по ключу' },
  HashPlayground: { name: 'Хеш-площадка', blurb: 'Поменяй букву и увидь лавинный эффект' },
  BlockChainDemo: { name: 'Цепочка блоков', blurb: 'Испорти блок и почини всю цепь' },
  PowMiner: { name: 'PoW-майнер', blurb: 'Подбери nonce руками' },
  SignDemo: { name: 'Цифровая подпись', blurb: 'Подпиши сообщение и попробуй подделать' },
  NodeNetSim: { name: 'Сеть из трёх нод', blurb: 'Погаси ноду и посмотри, что станет с сетью' },
  ComposeBuilder: { name: 'Конструктор docker-compose', blurb: 'Собери файл из готовых кусков' },
  DockerCmdQuest: { name: 'Команды Docker по порядку', blurb: 'От конфигов до остановки' },
  ErrorTranslator: { name: 'Переводчик ошибок', blurb: 'Что на самом деле говорит компилятор' },
  ReverseQuiz: { name: 'Обратный квиз', blurb: 'С русского на английский, без подсказок' },
  FsTreeViz: { name: 'Дерево файлов', blurb: 'Куда именно ведёт этот cd' },
  MiniFileManager: { name: 'Мини-файловый менеджер', blurb: 'Копируй и переноси файлы командами' },
  ChmodCalc: { name: 'Калькулятор chmod', blurb: 'Собери права галочками и получи число' },
  NanoQuest: { name: 'Редактор nano', blurb: 'Сохранить и выйти, не закрывая терминал' },
  PermQuest: { name: 'Права на файл', blurb: 'Кто и что может с этим файлом' },
  GitStatusReader: { name: 'Чтение git status', blurb: 'Что попадёт в коммит, а что нет' },
  CommitMsgBuilder: { name: 'Сообщение коммита', blurb: 'Собери понятное сообщение из частей' },
  FetchPullViz: { name: 'fetch, merge и pull', blurb: 'Три команды по шагам, без путаницы' },
  PRTrainer: { name: 'Мини-ревью', blurb: 'Найди три проблемы в чужом diff' },
  IdeTour: { name: 'Экскурсия по IDE', blurb: 'Найди нужную панель в окне' },
  MemoryViz: { name: 'Ячейки памяти', blurb: 'Что происходит с val и var' },
  BugHunt: { name: 'Охота на ошибки', blurb: 'Кликни строку, которая не соберётся' },
  CallTracer: { name: 'Трассировка вызова', blurb: 'Проследи, куда уходит каждый шаг' },
  SignatureBuilder: { name: 'Конструктор сигнатуры', blurb: 'Собери объявление функции из кусочков' },
  DataClassBuilder: { name: 'Конструктор data class', blurb: 'Собери класс и увидь, что сгенерится' },
  MapFilterViz: { name: 'Конвейер map и filter', blurb: 'Смотри, как список меняется по шагам' },
  CodeSketchMatch: { name: 'Код и скетч', blurb: 'Что нарисует этот фрагмент' },
  ModifierChain: { name: 'Цепочка Modifier', blurb: 'Порядок решает — собери правильный' },
  RememberSim: { name: 'remember и без него', blurb: 'Увидь разницу своими глазами' },
  RecompositionCounter: { name: 'Счётчик перерисовок', blurb: 'Кто перерисовался и почему' },
  EyeDp: { name: 'Глазомер', blurb: 'Сколько тут dp — на глаз' },
  CardAssembler: { name: 'Сборка карточки', blurb: 'Разложи элементы карточки по местам' },
  ModuleGraph: { name: 'Граф зависимостей', blurb: 'Собери связи между модулями' },
  ModuleSort: { name: 'Разбор по модулям', blurb: 'Какой класс в каком модуле живёт' },
  ApiVisToggle: { name: 'api или implementation', blurb: 'Что увидит :app при каждом варианте' },
};
