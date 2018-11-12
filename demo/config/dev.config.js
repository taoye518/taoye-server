const path = require("path");

const config = {
    NODE_ENV: "DEVELOPMENT",
    NODE_PORT: 8080,

    GATEWAY_HOST: "aob-dev.next2you.cn",
    // GATEWAY_HOST: "localhost",
    GATEWAY_PORT: 9090,

    REDIS_SECRET: "taoye-test",
    REDIS_HOST: "192.168.200.107",
    REDIS_PORT: 6379,
    REDIS_TTL: 7200,

    CONTROLLER_DIR: [
        path.join(__dirname, "..", "controller"),
        path.join(__dirname, "..", "controller2")
    ],
    STATIC_DIR: path.join(__dirname, "..", "static")
};

module.exports = config;