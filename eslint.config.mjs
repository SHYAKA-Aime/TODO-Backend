import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default {
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint"
  ],
  overrides: [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  rules: {
    indent: ["error", 2],
    semi: ["error", "always"],
    quotes: ["error", "single"],
    "no-unused-vars": "warn",
    "space-before-function-paren": ["error", "always"],
    "arrow-parens": ["error", "always"],
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "linebreak-style": ["error", "unix"]
  }
};
