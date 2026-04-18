import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", ".open-next/**", ".wrangler/**", "coverage/**"],
  },
];

export default config;
