const server = require("../src/index");
const config = require("./config/dev.config");

server.startup(config);

// server.http.beforeSend((data) => {
//     let config = data.config;
//     let context = data.context;
//     if(context && context.getToken) {
//         let token = context.getToken();
//         if(token) {
//             config.headers["Authorization"] = token;
//         }
//     }
// });