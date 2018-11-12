const taoye = require("../src/index");
const config = require("./config/dev.config");

taoye.startup(config);

taoye.http.beforeSend((data) => {
    let config = data.config;
    let context = data.context;
    if(context && context.getToken) {
        let token = context.getToken();
        if(token) {
            config.headers["Authorization"] = token;
        }
    }
});