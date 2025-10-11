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
      'build/**',
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
        CustomEvent: 'readonly',
        ScrollIntoViewOptions: 'readonly',
        // Browser functions
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        globalThis: 'readonly',
        // Vite 全局变量
        __APP_VERSION__: 'readonly',
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
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        Node: 'readonly',
        Selection: 'readonly',
        Range: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        DragEvent: 'readonly',
        CompositionEvent: 'readonly',
        CustomEvent: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly'
      }
    },
    rules:
    {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'warn',
      // 主流格式规范 - 折中方案
      'vue/max-attributes-per-line': ['error', {
        singleline: 3,  // 单行最多 3 个属性
        multiline: 1    // 多行时每行 1 个属性
      }],
      'vue/first-attribute-linebreak': ['error', {
        singleline: 'ignore',  // 单行不强制换行
        multiline: 'below'     // 多行时第一个属性换行
      }],
      'vue/html-closing-bracket-newline': ['error', {
        singleline: 'never',   // 单行不换行
        multiline: 'always'    // 多行换行
      }],
      'vue/singleline-html-element-content-newline': 'off',  // 允许单行内容
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',      // void 元素使用自闭合 (br, img, etc.)
          normal: 'never',     // 普通 HTML 元素不使用自闭合
          component: 'always'  // Vue 组件使用自闭合
        }
      }]
    }
  },
  
  // JavaScript 文件配置
  {
    files: ['**/*.js'],
    languageOptions:
    {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        Node: 'readonly',
        Selection: 'readonly',
        Range: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        DragEvent: 'readonly',
        CompositionEvent: 'readonly'
      }
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
      // 1TBS 风格大括号 - JavaScript 标准风格（花括号在同一行）
      'brace-style': ['error', '1tbs', { allowSingleLine: true }]
    }
  }
];
