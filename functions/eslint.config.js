import globals from "globals";

export default [
  {
    files: ["*.js"], // Match all JavaScript files
    languageOptions: {
      ecmaVersion: 2021, // Enable modern JavaScript features
      
      globals: {
        ...globals.node // Includes Node.js globals like `require` and `exports`
      }
    },
    rules: {
      "no-undef": "off", // Disable undefined variable errors for Node.js globals
      "no-unused-vars": "warn", // Warn about unused variables
      "prefer-arrow-callback": "error", // Enforce arrow functions for callbacks
      "quotes": ["error", "double"], // Enforce double quotes
      "comma-dangle": ["error", "never"] // No trailing commas
    }
  }
];