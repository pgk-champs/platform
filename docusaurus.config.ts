import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'PGK Champs',
  tagline: 'От нуля до чемпиона: мобильная разработка и блокчейн',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://pgk-champs.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/platform/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pgk-champs', // Usually your GitHub org/user name.
  projectName: 'platform', // Usually your repo name.

  onBrokenLinks: 'throw',

  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700&family=Onest:wght@600;700;800&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
      },
    },
  ],

  clientModules: ['./src/clientModules/readingProgress.ts', './src/clientModules/konami.ts', './src/clientModules/account.ts'],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // «Редактировать страницу» под каждой главой: GitHub сам предложит
          // форк и PR любому залогиненному. Подпись локализована в i18n/ru/code.json.
          editUrl: 'https://github.com/pgk-champs/platform/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'PGK Champs',
      logo: {
        alt: 'PGK Champs',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'dropdown',
          label: 'Учебник',
          position: 'left',
          items: [
            {to: '/docs/foundation', label: 'Фундамент — с нуля'},
            {to: '/docs/mobile', label: 'Мобилка — Kotlin и Compose'},
            {to: '/docs/blockchain', label: 'Блокчейн — смарт-контракты'},
            {to: '/docs/advanced/git-rebase', label: 'Отдельные темы'},
          ],
        },
        {
          to: '/route',
          label: 'Маршрут',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Тренажёры',
          position: 'left',
          items: [
            {to: '/playground', label: 'Песочница — попробовать сразу'},
            {to: '/gym', label: 'Зал — все тренажёры'},
            {to: '/words', label: 'Слова — английский по карточкам'},
            {to: '/simulator', label: 'Симулятор чемпионата'},
          ],
        },
        {
          to: '/community',
          label: 'Сообщество',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Мои успехи',
          position: 'right',
          items: [
            {to: '/account', label: 'Личный кабинет'},
            {to: '/achievements', label: 'Достижения и рекорды'},
            {to: '/favorites', label: 'Избранное'},
          ],
        },
        {
          href: 'https://github.com/pgk-champs/platform',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Треки',
          items: [
            {
              label: 'Фундамент',
              to: '/docs/foundation',
            },
            {
              label: 'Мобильная разработка',
              to: '/docs/mobile',
            },
            {
              label: 'Блокчейн',
              to: '/docs/blockchain',
            },
          ],
        },
        {
          title: 'Ресурсы',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pgk-champs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PGK Champs. Built with Docusaurus.`,
    },
    prism: {
      // Светлая тема github красит комментарии в #999988 (2.71:1 на фоне блока),
      // числа в #36acaa (2.58) и строки в #e3116c (4.32) — для чтения кода это
      // мало, а комментарии в учебнике несут половину смысла. Подменяем только
      // провальные цвета, остальную палитру темы оставляем как есть.
      theme: {
        ...prismThemes.github,
        styles: prismThemes.github.styles.map((rule) => {
          const recolor: Record<string, string> = {
            comment: '#57606a',
            prolog: '#57606a',
            doctype: '#57606a',
            cdata: '#57606a',
            number: '#0550ae',
            boolean: '#0550ae',
            function: '#6f42c1',
            string: '#0a3069',
            'attr-value': '#0a3069',
            char: '#0a3069',
            builtin: '#0a3069',
            inserted: '#0a3069',
          };
          const hit = rule.types.find((t) => recolor[t]);
          return hit ? { ...rule, style: { ...rule.style, color: recolor[hit] } } : rule;
        }),
      },
      // dracula красит комментарии в #6272a4 — 3.03:1 на своём же фоне.
      // Осветляем только их, остальная палитра темы не трогается.
      darkTheme: {
        ...prismThemes.dracula,
        styles: prismThemes.dracula.styles.map((rule) =>
          rule.types.some((t) => ['comment', 'prolog', 'doctype', 'cdata'].includes(t))
            ? { ...rule, style: { ...rule.style, color: '#9aa6cf' } }
            : rule,
        ),
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
