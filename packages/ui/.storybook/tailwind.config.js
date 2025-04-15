/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../src/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [require("../tailwind.config")],
};
