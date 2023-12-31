/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

let cus_keywords_violet = [
    'as',
    'break',
    'case',
    'catch',
    'continue',
    'debugger',
    'default',
    'do',
    'else',
    'export',
    'finally',
    'for',
    'from',
    'if',
    'import',
    'return',
    'switch',
    'throw',
    'try',
    'while',
    'with',
    'yield',
    'await',
];

let cus_keywords_green = [
    'module',
    'exports',
    'namespace',
    'never',
    'readonly',
    'global',
    'void',
];

let keywords_str_violet = '\\b('+cus_keywords_violet.join('|')+')\\b'
let keywords_str_green = '\\b('+cus_keywords_green.join('|')+')\\b'

define('vs/basic-languages/typescript/typescript',["require", "exports", "../fillers/monaco-editor-core"], function (require, exports, monaco_editor_core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.language = exports.conf = void 0;
    exports.conf = {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        onEnterRules: [
            {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: {
                    indentAction: monaco_editor_core_1.languages.IndentAction.IndentOutdent,
                    appendText: ' * '
                }
            },
            {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                action: {
                    indentAction: monaco_editor_core_1.languages.IndentAction.None,
                    appendText: ' * '
                }
            },
            {
                // e.g.  * ...|
                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: {
                    indentAction: monaco_editor_core_1.languages.IndentAction.None,
                    appendText: '* '
                }
            },
            {
                // e.g.  */|
                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                action: {
                    indentAction: monaco_editor_core_1.languages.IndentAction.None,
                    removeText: 1
                }
            }
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: "'", close: "'", notIn: ['string', 'comment'] },
            { open: '`', close: '`', notIn: ['string', 'comment'] },
            { open: '/**', close: ' */', notIn: ['string'] }
        ],
        folding: {
            markers: {
                start: new RegExp('^\\s*//\\s*#?region\\b'),
                end: new RegExp('^\\s*//\\s*#?endregion\\b')
            }
        }
    };
    exports.language = {
        // Set defaultToken to invalid to see what you do not tokenize yet
        defaultToken: 'invalid',
        tokenPostfix: '.ts',
        keywords: [
            // Should match the keys of textToKeywordObj in
            // https://github.com/microsoft/TypeScript/blob/master/src/compiler/scanner.ts
            'abstract',
            'any',
            'as',
            'asserts',
            'bigint',
            'boolean',
            'break',
            'case',
            'catch',
            'class',
            'continue',
            'const',
            'constructor',
            'debugger',
            'declare',
            'default',
            'delete',
            'do',
            'else',
            'enum',
            'export',
            'extends',
            'false',
            'finally',
            'for',
            'from',
            'function',
            'get',
            'if',
            'implements',
            'import',
            'in',
            'infer',
            'instanceof',
            'interface',
            'is',
            'keyof',
            'let',
            'module',
            'namespace',
            'never',
            'new',
            'null',
            'number',
            'object',
            'package',
            'private',
            'protected',
            'public',
            'readonly',
            'require',
            'global',
            'return',
            'set',
            'static',
            'string',
            'super',
            'switch',
            'symbol',
            'this',
            'throw',
            'true',
            'try',
            'type',
            'typeof',
            'undefined',
            'unique',
            'unknown',
            'var',
            'void',
            'while',
            'with',
            'yield',
            'async',
            'await',
            'of'
        ],
        operators: [
            '<=',
            '>=',
            '==',
            '!=',
            '===',
            '!==',
            '=>',
            '+',
            '-',
            '**',
            '*',
            '/',
            '%',
            '++',
            '--',
            '<<',
            '</',
            '>>',
            '>>>',
            '&',
            '|',
            '^',
            '!',
            '~',
            '&&',
            '||',
            '??',
            '?',
            ':',
            '=',
            '+=',
            '-=',
            '*=',
            '**=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '&=',
            '|=',
            '^=',
            '@'
        ],
        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        digits: /\d+(_+\d+)*/,
        octaldigits: /[0-7]+(_+[0-7]+)*/,
        binarydigits: /[0-1]+(_+[0-1]+)*/,
        hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
        regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
        regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
        // The main tokenizer for our languages
        tokenizer: {
            root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],
            common: [
                // identifiers and keywords                
                [new RegExp(keywords_str_green), 'js.keywords.green'], // 函数定义
                [new RegExp(keywords_str_violet), 'js.keywords.violet'], // 函数定义
                [/[a-z_$\u4e00-\u9fa5][\w$\u4e00-\u9fa5]*( ){0,5}(?=\()/, 'func'], // 函数定义
                
                [
                    /[a-z_$\u4e00-\u9fa5][\w$\u4e00-\u9fa5]*/,
                    {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }
                ],
                [/[A-Z][\w\$]*/, 'type.identifier'],
                // [/[A-Z][\w\$]*/, 'identifier'],
                // whitespace
                { include: '@whitespace' },
                // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
                [
                    /\/(?=([^\\\/]|\\.)+\/([gimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
                    { token: 'regexp', bracket: '@open', next: '@regexp' }
                ],
                // delimiters and operators
                [/[()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/!(?=([^=]|$))/, 'delimiter'],
                [
                    /@symbols/,
                    {
                        cases: {
                            '@operators': 'delimiter',
                            '@default': ''
                        }
                    }
                ],
                // numbers
                [/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
                [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
                [/0[xX](@hexdigits)n?/, 'number.hex'],
                [/0[oO]?(@octaldigits)n?/, 'number.octal'],
                [/0[bB](@binarydigits)n?/, 'number.binary'],
                [/(@digits)n?/, 'number'],
                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],
                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string_double'],
                [/'/, 'string', '@string_single'],
                [/`/, 'string', '@string_backtick']
            ],
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment']
            ],
            comment: [
                [/[^\/*]+/, 'comment'],
                [/\*\//, 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],
            jsdoc: [
                [/[^\/*]+/, 'comment.doc'],
                [/\*\//, 'comment.doc', '@pop'],
                [/[\/*]/, 'comment.doc']
            ],
            // We match regular expression quite precisely
            regexp: [
                [
                    /(\{)(\d+(?:,\d*)?)(\})/,
                    ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control']
                ],
                [
                    /(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,
                    ['regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]
                ],
                [/(\()(\?:|\?=|\?!)/, ['regexp.escape.control', 'regexp.escape.control']],
                [/[()]/, 'regexp.escape.control'],
                [/@regexpctl/, 'regexp.escape.control'],
                [/[^\\\/]/, 'regexp'],
                [/@regexpesc/, 'regexp.escape'],
                [/\\\./, 'regexp.invalid'],
                [
                    /(\/)([gimsuy]*)/,
                    [{ token: 'regexp', bracket: '@close', next: '@pop' }, 'keyword.other']
                ]
            ],
            regexrange: [
                [/-/, 'regexp.escape.control'],
                [/\^/, 'regexp.invalid'],
                [/@regexpesc/, 'regexp.escape'],
                [/[^\]]/, 'regexp'],
                [
                    /\]/,
                    {
                        token: 'regexp.escape.control',
                        next: '@pop',
                        bracket: '@close'
                    }
                ]
            ],
            string_double: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],
            string_single: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, 'string', '@pop']
            ],
            string_backtick: [
                [/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
                [/[^\\`$]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/`/, 'string', '@pop']
            ],
            bracketCounting: [
                [/\{/, 'delimiter.bracket', '@bracketCounting'],
                [/\}/, 'delimiter.bracket', '@pop'],
                { include: 'common' }
            ]
        }
    };
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define('vs/basic-languages/javascript/javascript',["require", "exports", "../typescript/typescript"], function (require, exports, typescript_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.language = exports.conf = void 0;
    exports.conf = typescript_1.conf;
    exports.language = {
        // Set defaultToken to invalid to see what you do not tokenize yet
        defaultToken: 'invalid',
        tokenPostfix: '.js',
        keywords: [
            'break',
            'case',
            'catch',
            'class',
            'continue',
            'const',
            'constructor',
            'debugger',
            'default',
            'delete',
            'do',
            'else',
            'export',
            'extends',
            'false',
            'finally',
            'for',
            'from',
            'function',
            'get',
            'if',
            'import',
            'in',
            'instanceof',
            'let',
            'new',
            'null',
            'return',
            'set',
            'super',
            'switch',
            'symbol',
            'this',
            'throw',
            'true',
            'try',
            'typeof',
            'undefined',
            'var',
            'void',
            'while',
            'with',
            'yield',
            'async',
            'await',
            'of'
        ],
        typeKeywords: [],
        operators: typescript_1.language.operators,
        symbols: typescript_1.language.symbols,
        escapes: typescript_1.language.escapes,
        digits: typescript_1.language.digits,
        octaldigits: typescript_1.language.octaldigits,
        binarydigits: typescript_1.language.binarydigits,
        hexdigits: typescript_1.language.hexdigits,
        regexpctl: typescript_1.language.regexpctl,
        regexpesc: typescript_1.language.regexpesc,
        tokenizer: typescript_1.language.tokenizer
    };
});

