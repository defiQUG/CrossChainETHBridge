module.exports = {
  plugins: ["prettier-plugin-solidity"],
  overrides: [
    {
      files: "*.sol",
      options: {
        parser: "solidity-parse",
        printWidth: 80,
        tabWidth: 4,
        useTabs: false,
        singleQuote: false,
        bracketSpacing: false
      }
    }
  ]
}
