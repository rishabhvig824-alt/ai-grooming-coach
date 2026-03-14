import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand palette — AI Grooming Coach design system
        brand: {
          primary: "#2C3E50",   // Deep Indigo — headers, buttons, nav
          secondary: "#4F6D7A", // Steel Blue — accents, highlights
        },
        surface: {
          bg: "#F5F7FA",        // Soft Neutral — page background
          card: "#FFFFFF",      // White — card backgrounds
        },
        content: {
          primary: "#1F2933",   // Primary text
          secondary: "#6B7280", // Secondary / caption text
        },
        chip: {
          inactive: "#E5E7EB",  // Inactive selection chip background
        },
        feedback: {
          success: "#4CAF50",   // Improvement confirmations
          warning: "#E53935",   // Errors / issues
        },
      },
      spacing: {
        // 8px grid — base unit is 8px
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
      },
      borderRadius: {
        button: "10px",
        card: "12px",
        chip: "9999px",
      },
      minHeight: {
        tap: "44px", // WCAG minimum tap target
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
