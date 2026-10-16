const globals = {
  require: "readonly",
  module: "readonly",
  process: "readonly",
  console: "readonly",
  __dirname: "readonly"
};

module.exports = [
  {
    files: ["backend/**/*.js", "tests/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-undef": "error",
      "eqeqeq": ["error", "always"]
    }
  }
];
