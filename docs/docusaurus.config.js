// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Online Saathi IDP',
  tagline: 'Modern, secure, and fast Identity Solutions for your applications.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://online-saathi.in',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  customFields: {
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'onlinesaathi', // Usually your GitHub org/user name.
  projectName: 'sso-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Remove default editUrl
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Online Saathi Blog',
          blogDescription: 'Latest updates on security and SSO integration.',
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          // Remove default editUrl
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Online Saathi',
        logo: {
          alt: 'Online Saathi Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'User Guide',
            docsPluginId: 'default',
            sidebarPath: 'userGuideSidebar', // custom sidebar id if needed
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Developer Guide',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'http://localhost:5173/login',
            label: 'Sign In',
            position: 'right',
            className: 'button button--primary navbar-btn',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guides',
            items: [
              {
                label: 'User Guide',
                to: '/docs/user-guide',
              },
              {
                label: 'Developer Guide',
                to: '/docs/developer-guide',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/thapahemraj/onlinesaathi-sso',
              },
            ],
          },
          {
            title: 'Portal',
            items: [
              {
                label: 'Accounts Dashboard',
                href: 'http://localhost:5173',
              },
              {
                label: 'Admin Panel',
                href: 'http://localhost:5173/dashboard/admin',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Online Saathi. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
