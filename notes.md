# tailwind

> npm rm tailwindcss
> npm i -D tailwindcss@^3.4 postcss autoprefixer
> npx tailwindcss init -p

# tailwind.config.js

/** @type {import('tailwindcss').Config} \*/
module.exports = {
content: [
"./app/**/_.{js,ts,jsx,tsx}",
"./components/\*\*/_.{js,ts,jsx,tsx}",
"./pages/**/\*.{js,ts,jsx,tsx}",
"./src/**/\*.{js,ts,jsx,tsx}" // keep if you have a src/ dir
],
theme: { extend: {} },
plugins: [],
};
