import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

document.body.insertAdjacentHTML("beforeend", '<div id="root"></div>');

ReactDOM.render(<App />, document.getElementById("root"));
