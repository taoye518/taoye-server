const path = require("path");
const fs = require("fs");

const Logger = require("../core/Logger");
const Timer = require("../util/Timer");

const DEFAULT_CONFIG = {
    NODE_ENV: {
        defaultValue: ENV_DEVELOPMENT,
        required: true
    },
    NODE_PORT: {
        defaultValue: 8080,
        required: true
    },

    GATEWAY_HOST: {
        defaultValue: null
    },
    GATEWAY_PORT: {
        defaultValue: null
    },

    REDIS_SECRET: {
        defaultValue: null
    },
    REDIS_HOST: {
        defaultValue: null
    },
    REDIS_PORT: {
        defaultValue: null
    },
    REDIS_PASSWORD: {
        defaultValue: null
    },
    REDIS_TTL: {
        defaultValue: 7200
    },

    CONTROLLER_DIR: {
        defaultValue: null,
        required: true
    },
    STATIC_DIR: {
        defaultValue: null,
        required: true
    },

    MONGODB_HOST: {
        defaultValue: null
    },
    MONGODB_PORT: {
        defaultValue: 21017
    },
    MONGODB_NAME: {
        defaultValue: null
    }
};

const Config = {};

Config.check = function(_config) {

    Logger.info("开始检查配置项");

    let timer = Timer.start();
    if(_config == null) {
        Logger.error("配置项不能为空：", _config);
        process.exit(1);
    }

    let config = Object.assign({}, this.getDefaultConfig(), _config);
    process.env.NODE_ENV = config.NODE_ENV;

    let checkResult = [];
    Object.keys(DEFAULT_CONFIG).forEach(key => {
        let item = DEFAULT_CONFIG[key];
        if(item.required && config[key] == null) {
            checkResult.push(key);
        }
    });
    if(checkResult.length > 0) {
        Logger.error("配置项 " + checkResult + " 不能为空");
        process.exit(1);
    }

    Object.assign(this, config);
    Logger.info("检查配置项结束", "耗时", timer.end(), "ms");

    return config;
};

Config.getDefaultConfig = function() {
    let config = {};
    Object.keys(DEFAULT_CONFIG).forEach(prop => {
        let _defaultConfig = DEFAULT_CONFIG[prop];
        if(_defaultConfig.defaultValue) {
            config[prop] = _defaultConfig.defaultValue.constructor === Function ? _defaultConfig.defaultValue() : _defaultConfig.defaultValue;
        }
    });
    return config;
};

global.Config = Config;

module.exports = Config;