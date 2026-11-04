import javascript from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['dist/**', 'build/**', 'node_modules/**', 'vendor/**'] },
    javascript.configs.recommended,
    {
        files: ['js/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                jQuery: 'readonly',
                $: 'readonly',
                wp: 'readonly',
                ajaxurl: 'readonly',
                d3: 'readonly',
                topojson: 'readonly',
                afctHistoryAdminData: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['webpack.config.js'],
        languageOptions: { globals: globals.node, sourceType: 'commonjs' },
    },
];
