// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nav: "#1D2840",         // Navigation menu background
        mediaBg: "#111827",     // Media file area background
        previewBg: "#01060F",   // Preview area background
        channel: "#03132F",     // Timeline channel container background
        fontWhite: "#E5E7E6",   // White font color
        borderSilver: "#B7B5B3",// Silver borders
        accent: "#027BCE",      // Accent color (light blue for segments)
      },
    },
  },
  plugins: [],
};
