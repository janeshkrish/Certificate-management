/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#e0e0e0",
        ink: "#213045",
        muted: "#62718d",
        accent: "#1f6feb",
        accentSoft: "#dbe9ff",
        successSoft: "#d6f5e4",
        dangerSoft: "#f7d7d7"
      },
      borderRadius: {
        panel: "20px"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      }
    }
  },
  plugins: []
};

