// ESLint configuration migrated from .eslintrc.json for ESLint v9+ (flat config, без env, без extends)
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        jest: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    plugins: {},
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-console": "off"
    }
  }
]; 