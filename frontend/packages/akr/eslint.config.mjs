import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import noOnlyTests from "eslint-plugin-no-only-tests";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/webpack.config.js"]), {
    extends: fixupConfigRules(compat.extends(
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:jsx-a11y/recommended",
        "plugin:react/jsx-runtime",
        "plugin:eslint-comments/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    )),

    plugins: {
        "no-only-tests": noOnlyTests,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
    },

    settings: {
        react: {
            version: "detect",
        },

        "import/resolver": {
            node: {
                moduleDirectory: ["node_modules", "src/"],
            },

            webpack: {
                config: "webpack.config.js",

                env: {
                    prod: false,
                },
            },
        },
    },

    rules: {
        "react/jsx-uses-react": "off",
        "react-hooks/set-state-in-effect": "off",
        "react-hooks/rules-of-hooks": "off",
        "react-hooks/refs": "off",
        "react/react-in-jsx-scope": "off",
        "react-hooks/static-components": "off",
        "react/react-in-jsx-scope": "off",

        "import/order": ["error", {
            groups: [["builtin", "external"]],
            "newlines-between": "always",

            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
        }],

        "@typescript-eslint/no-empty-object-type": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrors: "none",
        }],

        "no-console": "warn",

        "no-restricted-imports": ["error", {
            patterns: [".*"],
        }],

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: "*",
            next: "return",
        }],

        "sort-imports": ["error", {
            ignoreCase: true,
            ignoreDeclarationSort: true,
        }],

        "no-only-tests/no-only-tests": "error",
    },
}]);
