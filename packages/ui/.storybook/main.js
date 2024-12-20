import { join, dirname } from 'path';
/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn or pnpm workspaces.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

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
  viteFinal: async config => {
    // Add any custom config here
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        core: getAbsolutePath('core'),
      },
    };
    return config;
  },
};

module.exports = config;
