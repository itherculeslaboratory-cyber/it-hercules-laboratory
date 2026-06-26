import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        civ: {
          deep: "var(--civ-bg-deep)",
          section: "var(--civ-bg-section)",
          card: "var(--civ-bg-card)",
          fg: "var(--civ-fg)",
          muted: "var(--civ-fg-muted)",
          disabled: "var(--civ-fg-disabled)",
          border: "var(--civ-border)",
          success: "var(--civ-semantic-success)",
          danger: "var(--civ-semantic-danger)",
          info: "var(--civ-semantic-info)",
          warning: "var(--civ-semantic-warning)",
        },
      },
      borderRadius: {
        card: "var(--civ-radius-card)",
        button: "var(--civ-radius-button)",
      },
      fontFamily: {
        sans: ["var(--civ-font-family)"],
      },
    },
  },
  plugins: [],
};

export default config;
