/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
    semi: true,
    singleQuote: true,
    trailingComma: "es5",
    tabWidth: 4,
};

export default config;
