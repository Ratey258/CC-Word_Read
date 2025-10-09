import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
  // 忽略的文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src-tauri/**',
      '*.config.ts',
      '*.config.js',
      '.vite/**'
    ]
  },
  
  // ESLint 推荐配置
  eslint.configs.recommended,
  
  // TypeScript 文件配置
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions:
    {
      parser: tsparser,
      parserOptions:
      {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals:
      {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        URL: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        Node: 'readonly',
        Selection: 'readonly',
        Range: 'readonly',
        Element: 'readonly',
        // Event types
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        DragEvent: 'readonly',
        CompositionEvent: 'readonly',
        ScrollIntoViewOptions: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        globalThis: 'readonly',
        // ES2021 globals
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly'
      }
    },
    plugins:
    {
      '@typescript-eslint': tseslint
    },
    rules:
    {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn',
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    }
  },
  
  // Vue 文件配置
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions:
    {
      parser: vueParser,
      parserOptions:
      {
        ecmaVersion: 'latest',
        parser: tsparser,
        sourceType: 'module'
      }
    },
    rules:
    {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'warn',
    }
  },
  
  // 通用规则
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.vue'],
    rules:
    {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      // Allman 风格大括号 - 大括号单独占一行
      'brace-style': ['error', 'allman', { allowSingleLine: false }]
    }
  }
];
