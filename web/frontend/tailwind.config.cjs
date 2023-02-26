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
                "1/3": "33.333333%",
                "2/3": "66.666667%",
                "1/4": "25%",
                "2/4": "50%",
                "3/4": "75%",
                "1/5": "20%",
                "2/5": "40%",
                "3/5": "60%",
                "4/5": "80%",
                "1/6": "16.666667%",
                "2/6": "33.333333%",
                "3/6": "50%",
                "4/6": "66.666667%",
                "5/6": "83.333333%",
                "1/12": "8.333333%",
                "2/12": "16.666667%",
                "3/12": "25%",
                "4/12": "33.333333%",
                "5/12": "41.666667%",
                "6/12": "50%",
                "7/12": "58.333333%",
                "8/12": "66.666667%",
                "9/12": "75%",
                "10/12": "83.333333%",
                "11/12": "91.666667%",
                28: "7rem",
            },
            lineHeight: { 4: "1rem", 6: "1.5rem" },
            height: {
                60: "60%",
                90: "90%",
                340: "340px",
                400: "400px",
                "1/2": "50%",
            },
            width: {
                "350px": "350px",
            },
            minHeight: {
                lg: "18rem",
                340: "340px",
                750: "750px",
            },
            maxHeight: {
                lg: "18rem",
                xl: "24rem",
                700: "700px",
            },
            minWidth: {
                40: "10rem",
                56: "14rem",
                64: "16rem",
            },
            maxWidth: { 20: "5rem", 24: "6rem", 28: "7rem", 32: "8rem" },
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
                primary: "#F84768",
                facebook: "#3b5998",
                instagram: "#E1306C",
                twitter: "#1DA1F2",
                google: "#4285f4",
                secondary: "#ff0069",
                gold: "#ffd700",
                silver: "#00f3ff",
                bronze: "#00ffc4",
                highlight: "#fffd54",
            },
            margin: (theme, { negative }) => ({
                ...negative({ "2px": "2px" }),
            }),
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
        borderWidth: ["responsive", "first", "last", "hover", "focus"],
        backgroundColor: ["responsive", "odd", "hover", "focus"],
    },

    plugins: [
        require("tailwindcss-spinner")(), // no options to configure
        // require("@tailwindcss/custom-forms"),
        require("@tailwindcss/ui"),
    ],
};
