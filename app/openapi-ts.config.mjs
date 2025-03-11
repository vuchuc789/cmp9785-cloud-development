import { defaultPlugins } from '@hey-api/openapi-ts';

/** @type {import('@hey-api/openapi-ts').UserConfig} */
const config = {
  input: 'http://localhost:8000/openapi.json',
  output: {
    lint: 'eslint',
    format: 'prettier',
    path: './src/client',
  },
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: './src/lib/api.ts',
    },
    {
      name: '@hey-api/schemas',
      type: 'form',
    },
    {
      name: '@hey-api/transformers',
      dates: true,
    },
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
      validator: true,
    },
    'zod',
  ],
};

export default config;
