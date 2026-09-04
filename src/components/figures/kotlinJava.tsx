import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Kotlin и Java»: одна программа на двух языках, путь до
 * байткода и JVM, null-безопасность и совместная жизнь .java и .kt в
 * одном проекте. */

export const kotlinJavaSchemes: Schemes = {
  /* одна и та же программа: Java слева, Kotlin справа */
  'kj-same-program': (aria) => (
    <Panel id="fig-kj-same" w={800} h={360} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ПРОГРАММА · ДВА ЯЗЫКА</text>
      <rect x={30} y={60} width={355} height={230} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={88} fontSize={14} fontWeight={700} fill="#fff">Java</text>
      {[
        'public class User {',
        '  private final String name;',
        '  public User(String name) {',
        '    this.name = name;',
        '  }',
        '  public String getName() {',
        '    return name;',
        '  }',
        '}',
      ].map((t, i) => (
        <text key={t} x={50} y={116 + i * 19} fontSize={11.5} fontFamily={MONO} fill={FADE}>{t}</text>
      ))}
      <rect x={415} y={60} width={355} height={230} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={435} y={88} fontSize={14} fontWeight={700} fill="#fff">Kotlin</text>
      <text x={435} y={130} fontSize={13} fontFamily={MONO} fill={ACCENT}>data class User(val name: String)</text>
      <text x={435} y={168} fontSize={12} fill={FADE}>конструктор, геттер, equals,</text>
      <text x={435} y={186} fontSize={12} fill={FADE}>hashCode и toString —</text>
      <text x={435} y={204} fontSize={12} fill={FADE}>компилятор пишет их сам</text>
      <text x={435} y={248} fontSize={12.5} fontWeight={700} fill="#fff">одна строка вместо девяти</text>
      <text x={207} y={318} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>всё описано руками</text>
      <text x={592} y={318} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>описано только новое</text>
      <text x={400} y={344} textAnchor="middle" fontSize={12.5} fill={FADE}>поведение у обоих классов одинаковое: разница в объёме кода, а не в возможностях</text>
    </Panel>
  ),
  /* два компилятора, один байткод, одна JVM */
  'kj-jvm-bytecode': (aria) => (
    <Panel id="fig-kj-jvm" w={800} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИСХОДНИК · БАЙТКОД · JVM</text>
      <rect x={30} y={64} width={160} height={56} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={110} y={98} textAnchor="middle" fontSize={14} fontFamily={MONO} fill="#fff">User.java</text>
      <rect x={30} y={150} width={160} height={56} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={110} y={184} textAnchor="middle" fontSize={14} fontFamily={MONO} fill={ACCENT}>User.kt</text>
      <Arrow x1={196} y1={92} x2={256} y2={92} color={INK} w={3.5} />
      <Arrow x1={196} y1={178} x2={256} y2={178} color={ACCENT} w={3.5} />
      <rect x={262} y={64} width={140} height={56} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={332} y={98} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">javac</text>
      <rect x={262} y={150} width={140} height={56} rx={12} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={332} y={184} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>kotlinc</text>
      <Arrow x1={408} y1={92} x2={470} y2={126} color={INK} w={3.5} />
      <Arrow x1={408} y1={178} x2={470} y2={144} color={ACCENT} w={3.5} />
      <rect x={476} y={104} width={150} height={62} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={551} y={130} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">байткод .class</text>
      <text x={551} y={152} textAnchor="middle" fontSize={11.5} fill={FADE}>один формат для обоих</text>
      <Arrow x1={632} y1={135} x2={686} y2={135} color={ACCENT} w={3.5} />
      <rect x={692} y={94} width={80} height={82} rx={12} fill={ACCENT} />
      <text x={732} y={128} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK}>JVM</text>
      <text x={732} y={150} textAnchor="middle" fontSize={11} fill={DARK}>исполняет</text>
      <FileIcon x={40} y={228} accent />
      <text x={130} y={252} fontSize={13} fontWeight={700} fill="#fff">JVM не знает, на каком языке это писали</text>
      <text x={130} y={274} fontSize={12.5} fill={FADE}>она видит только классы и методы байткода — поэтому библиотека</text>
      <text x={130} y={292} fontSize={12.5} fill={FADE}>на Java подключается к Kotlin-проекту как своя, без обёрток</text>
      <text x={130} y={314} fontSize={12.5} fill={FADE}>на Android байткод потом переводится в формат DEX для ART</text>
    </Panel>
  ),
  /* NullPointerException в Java против ? и ?. в Kotlin */
  'kj-null-safety': (aria) => (
    <Panel id="fig-kj-null" w={800} h={350} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>NULL · КОГДА ОШИБКА НАХОДИТСЯ</text>
      <rect x={30} y={62} width={355} height={200} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={14} fontWeight={700} fill="#fff">Java: любая ссылка может быть null</text>
      <text x={50} y={124} fontSize={12.5} fontFamily={MONO} fill={FADE}>String name = user.getName();</text>
      <text x={50} y={146} fontSize={12.5} fontFamily={MONO} fill={FADE}>int n = name.length();</text>
      <text x={50} y={182} fontSize={13} fontWeight={700} fill="#fff">компилируется молча</text>
      <text x={50} y={214} fontSize={13} fontFamily={MONO} fill={ACCENT}>NullPointerException</text>
      <text x={50} y={240} fontSize={12} fill={FADE}>падает у пользователя, в рантайме</text>
      <rect x={415} y={62} width={355} height={200} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={435} y={90} fontSize={14} fontWeight={700} fill="#fff">Kotlin: null разрешён только с вопросом</text>
      <text x={435} y={124} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>val name: String? = user.name</text>
      <text x={435} y={146} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>val n = name?.length ?: 0</text>
      <text x={435} y={182} fontSize={13} fontWeight={700} fill="#fff">без вопросительного знака</text>
      <text x={435} y={204} fontSize={13} fontWeight={700} fill="#fff">код просто не собирается</text>
      <text x={435} y={240} fontSize={12} fill={FADE}>ошибка найдена на твоей машине</text>
      <text x={400} y={296} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff">одна и та же ошибка: слева её находит пользователь, справа — компилятор</text>
      <text x={400} y={326} textAnchor="middle" fontSize={12.5} fill={FADE}>тип String и тип String? в Kotlin — разные типы, и компилятор их не путает</text>
    </Panel>
  ),
  /* .java и .kt в одном модуле: вызовы в обе стороны */
  'kj-interop': (aria) => (
    <Panel id="fig-kj-interop" w={800} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПРОЕКТ · ДВА ЯЗЫКА РЯДОМ</text>
      <rect x={40} y={70} width={250} height={120} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={165} y={100} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">старый код на Java</text>
      <text x={165} y={128} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={FADE}>LegacyParser.java</text>
      <text x={165} y={152} textAnchor="middle" fontSize={12} fill={FADE}>работает, трогать незачем</text>
      <text x={165} y={174} textAnchor="middle" fontSize={12} fill={FADE}>переписывать не требуется</text>
      <rect x={510} y={70} width={250} height={120} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={635} y={100} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">новый код на Kotlin</text>
      <text x={635} y={128} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>ProfileScreen.kt</text>
      <text x={635} y={152} textAnchor="middle" fontSize={12} fill={FADE}>вызывает Java напрямую</text>
      <text x={635} y={174} textAnchor="middle" fontSize={12} fill={FADE}>по обычному import</text>
      <Arrow x1={300} y1={108} x2={500} y2={108} color={ACCENT} w={3.5} />
      <text x={400} y={98} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>Kotlin вызывает Java</text>
      <Arrow x1={500} y1={162} x2={300} y2={162} color={INK} w={3.5} />
      <text x={400} y={182} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={FADE}>Java вызывает Kotlin</text>
      <rect x={40} y={214} width={720} height={44} rx={12} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 5" />
      <text x={400} y={241} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">граница с Java — платформенный тип String!: про null компилятор ничего не знает</text>
      <text x={400} y={288} textAnchor="middle" fontSize={12.5} fill={FADE}>миграция идёт по файлу за раз: смешанный модуль собирается так же, как чистый</text>
      <text x={400} y={312} textAnchor="middle" fontSize={12.5} fill={FADE}>значение из Java лучше сразу класть в явный тип String или String?</text>
    </Panel>
  ),
};
