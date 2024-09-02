// index.js
import { greet } from "./module.js";

const message = greet("World");
console.log(message);
console.log("global", global.console);
