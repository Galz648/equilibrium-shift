import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    ignores: ["**/dist/**"],
    files: ["**/src/ui/**/*.tsx"],

    rules: {
      // `h` is the classic JSX factory; TypeScript emits calls to it but ESLint does not count that as a use.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^h$", argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/src/ui/core/jsx-dom.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
]);
