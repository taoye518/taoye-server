const path = require("path");

const config = {
    NODE_ENV: "DEVELOPMENT",
    NODE_PORT: 8080,

    // GATEWAY_HOST: "aob-dev.next2you.cn",
    GATEWAY_HOST: "localhost",
    GATEWAY_PORT: 8080,

    // REDIS_SECRET: "taoye-test",
    // REDIS_HOST: "192.168.200.107",
    // REDIS_PORT: 6379,
    // REDIS_TTL: 7200,

    CONTROLLER_DIR: path.join(__dirname, "..", "controller"),
    STATIC_DIR: path.join(__dirname, "..", "static"),

    MONGODB_HOST: "127.0.0.1",
    MONGODB_NAME: "fe_backbone"
};

module.exports = config;