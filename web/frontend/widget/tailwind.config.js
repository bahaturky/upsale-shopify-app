const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: false,
  theme: {
    extend: {
      screens: { xs: "540px" },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "7xl": "5rem",
        "2xs": "0.625rem",
        "3xs": "0.5rem",
      },
      spacing: {
        "1/2": "50%",
      },
      minHeight: {
        lg: "18rem",
        340: "340px",
      },
      maxHeight: {
        lg: "18rem",
        xl: "24rem",
        700: "700px",
      },
      maxWidth: { "20": "5rem", "24": "6rem", "28": "7rem", "32": "8rem" },
      borderWidth: {
        16: "16px",
      },
      borderRadius: {
        xl: "1.5rem",
      },
      opacity: {
        90: "0.9",
      },
      zIndex: { 60: "60", 70: "70", 80: "80", 90: "90" },
      colors: {
        // primary: {
        //   100: "#ebf8ff",
        //   200: "#bee3f8",
        //   300: "#90cdf4",
        //   400: "#63b3ed",
        //   500: "#4299e1",
        //   600: "#0095ff",
        //   700: "#2b6cb0",
        //   800: "#2c5282",
        //   900: "#2a4365",
        // },
        // facebook: "#3b5998",
        // instagram: "#E1306C",
        // twitter: "#1DA1F2",
        // google: "#4285f4",
        // secondary: "#ff0069",
        // gold: "#ffd700",
        // silver: "#00f3ff",
        // bronze: "#00ffc4",
        // highlight: "#fffd54",
      },
      // margin: (theme, { negative }) => ({
      //   ...negative({ "2px": "2px" }),
      // }),
    },
    spinner: (theme) => ({
      default: {
        color: "#dae1e7", // color you want to make the spinner
        size: "1.5em", // size of the spinner (used for both width and height)
        border: "2px", // border-width of the spinner (shouldn't be bigger than half the spinner's size)
        speed: "700ms", // the speed at which the spinner should rotate
      },
    }),
  },

  variants: {
    spinner: ["responsive"],
    margin: ["responsive", "first"],
    borderWidth: ["responsive", "first", "hover", "focus"],
    backgroundColor: ["responsive", "odd", "hover", "focus"],
  },

  plugins: [
    require("tailwindcss-spinner")(), // no options to configure
    // require("@tailwindcss/custom-forms"),
    require("@tailwindcss/ui"),
  ],
};
