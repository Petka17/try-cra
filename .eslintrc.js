module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    "jest/globals": true
  },
  extends: [
    "plugin:jest/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended"
  ],
  plugins: ["jest", "react"],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "no-useless-constructor": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/explicit-function-return-type": 1,
    "@typescript-eslint/no-parameter-properties": {
      allows: ["public"]
    },
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "react/display-name": 0
  }
};
