import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default typescriptEslint.config(
  { ignores: ['**/coverage', '**/dist', 'drizzle/**'] },
  {
    extends: [eslint.configs.recommended, ...typescriptEslint.configs.recommended],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      semi: ['warn', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': 'warn',
    },
  },
  eslintConfigPrettier,
);
