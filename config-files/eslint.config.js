import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                route: 'readonly',
                window: 'readonly',
                document: 'readonly',
                __dirname: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                ignoreRestSiblings: true 
            }],
            'no-undef': 'off', // TypeScript handles this
            'no-redeclare': 'off', // TypeScript handles this
        },
    },
    {
        files: ['**/*.jsx', '**/*.tsx'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                route: 'readonly',
                window: 'readonly',
                document: 'readonly',
                React: 'readonly',
                __dirname: 'readonly',
            },
        },
        plugins: {
            react: react,
        },
        rules: {
            ...react.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react/jsx-no-target-blank': 'warn',
            'react/display-name': 'off',
            'no-undef': 'off',
            'no-redeclare': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['**/*.jsx', '**/*.tsx'],
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                route: 'readonly',
                window: 'readonly',
                document: 'readonly',
                __dirname: 'readonly',
            },
        },
        rules: {
            'no-undef': 'off',
            'no-redeclare': 'off',
            'no-useless-escape': 'off',
        },
    },
    {
        ignores: ['vendor', 'node_modules', 'public', 'bootstrap/ssr', 'tailwind.config.js'],
    },
    prettier,
];
