import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'PGK Champs',
  tagline: 'От нуля до чемпиона: мобильная разработка и блокчейн',
  favicon: 'img/favicon.ico',

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

  clientModules: ['./src/clientModules/readingProgress.ts'],

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
        alt: 'PGK Champs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/route',
          label: 'Маршрут',
          position: 'left',
        },
        {
          to: '/playground',
          label: 'Песочница',
          position: 'left',
        },
        {
          to: '/favorites',
          label: 'Избранное',
          position: 'left',
        },
        {
          to: '/achievements',
          label: 'Достижения',
          position: 'left',
        },
        {
          to: '/docs/foundation',
          label: 'Фундамент',
          position: 'left',
        },
        {
          to: '/docs/mobile',
          label: 'Мобилка',
          position: 'left',
        },
        {
          to: '/docs/blockchain',
          label: 'Блокчейн',
          position: 'left',
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
