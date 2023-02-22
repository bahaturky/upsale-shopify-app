const path = require("path");
const glob = require("glob");

// Build the Upsell React app in a single js file
module.exports = {
  mode: "none",
  entry: {
    "bundle.js": glob.sync("build/static/js/*.js").map((f) => {
      console.log("file", f);
      return path.resolve(__dirname, f);
    }),
  },
  output: {
    filename: "bundle.min.js",
  },
};
