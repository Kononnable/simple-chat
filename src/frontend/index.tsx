import * as React from "react";
import * as ReactDOM from "react-dom";

import ChatControl from "./chatControl";
import "./styles.css";

const rootElement = document.getElementById("root");
if (rootElement!.getAttribute("data-admin") === null) {
    ReactDOM.render(<ChatControl />, rootElement);
} else {
    ReactDOM.render(<ChatControl admin={true} />, rootElement);
}
