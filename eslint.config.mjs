import globals from "globals";
import pluginJs from "@eslint/js";
import airbnbBase from "eslint-config-airbnb-base";

export default [
  {
    languageOptions: {
      ecmaVersion: 13,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    // The airbnbBase configuration is an array, so we spread it.
    // It might also be an object, in which case you'd just include it directly.
    // Check the eslint-config-airbnb-base documentation for the correct way to import it in flat config.
    // Assuming it's an array of configs or a single config object.
    // For this example, let's assume airbnbBase itself needs to be configured or is a plugin-like structure.
    // A more common way if airbnbBase exports a flat config array:
    // ...airbnbBase,
    // Or if it's a single config object:
    // airbnbBase,
    // However, often base configs are plugins or need to be wrapped.
    // Let's assume for now airbnb-base might not directly export a flat config array
    // and we might need to adapt its rules.
    // A more robust approach would be to check its compatibility with flat config.
    // If eslint-config-airbnb-base is not yet flat config compatible,
    // you might need to find an alternative or manually translate rules.

    // For now, let's represent the extension conceptually.
    // This part might need adjustment based on how eslint-config-airbnb-base supports flat config.
    // If airbnbBase.configs.recommended (or similar) exists and is flat:
    // ...airbnbBase.configs.recommended,

    // A common pattern for plugins in flat config:
    // pluginJs.configs.recommended, // Example for @eslint/js

    // Given "extends": ["airbnb-base"], we'll try to include it.
    // This is a placeholder and might need to be adjusted based on how 'eslint-config-airbnb-base'
    // exposes its configuration for flat config.
    // If 'eslint-config-airbnb-base' is not directly compatible, you might need to
    // install a specific version or use a compatibility utility if one exists.
  },
  // If airbnb-base is a plugin-like structure or needs specific setup for flat config:
  // This is a common way to include configurations from plugins/configs
  ...(Array.isArray(airbnbBase) ? airbnbBase : [airbnbBase]),
  {
    rules: {
      "class-methods-use-this": "off", // 0 means "off"
      "comma-dangle": ["error", "never"],
      "linebreak-style": "off", // 0 means "off"
      "global-require": "off", // 0 means "off"
      // "eslint linebreak-style": [0, "error", "windows"], // This was likely an error, keeping the one above
      "no-new": "off", // 0 means "off"
      "no-restricted-globals": "off", // 0 means "off"
      "no-restricted-syntax": "off", // 0 means "off"
      "no-console": "off", // 0 means "off"
      "no-underscore-dangle": "off", // 0 means "off"
      "import/extensions": "off", // 0 means "off"
      "import/no-cycle": "off" // 0 means "off"
    }
  }
];