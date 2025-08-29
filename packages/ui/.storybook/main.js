import path, { dirname, join } from 'path';

const config = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [
    '../stories/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Add any custom config here
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        core: path.resolve(__dirname, '../../core/src'),
      },
    };
    return config;
  },
};

module.exports = config;
