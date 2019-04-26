const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const busboy = require("connect-busboy");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

const historyFallback = require("connect-history-api-fallback");
const HttpMiddleware = require("./HttpMiddleware");
const RouterMiddleware = require("./RouterMiddleware");
// const MongoDBMiddleware = require("./MongoDBMiddleware");
const Logger = require("./Logger");

const Timer = require("../util/Timer");

const Frame = {};
Frame._app = null;

Frame.startup = function(config) {

    let timer = Timer.start();
    Logger.info("开始启动服务");

    //检查配置项
    Config.check(config);

    this._app = express();
    this._app.use(bodyParser.urlencoded({
        extended: false
    }));
    this._app.use(bodyParser.json());
    this._app.use(cookie());
    this._app.use(busboy());
    if(Config.HISTORY_API_FALLBACK) {
        this._app.use(historyFallback());
    }

    //使用Redis服务器管理Session会话
    if(Config.REDIS_SECRET && Config.REDIS_HOST && Config.REDIS_PORT) {
        this._app.use(session({
            secret: Config.REDIS_SECRET,
            store: new RedisStore({
                host: Config.REDIS_HOST,
                port: Config.REDIS_PORT,
                ttl: Config.REDIS_TTL || 7200,
                pass: Config.REDIS_PASSWORD,
                logErrors (error) {
                    Logger.error("连接Redis服务器出现异常", error);
                }
            }),
            cookie: 0,
            resave: true,
            saveUninitialized: false
        }));
    }else {
        Logger.warn("缺少配置项[REDIS_HOST] 不加载SESSION中间件");
    }

    let staticDir = Config.STATIC_DIR;
    if(staticDir) {
        if(staticDir.constructor === String) {
            staticDir = [staticDir];
        }
        staticDir.constructor === Array && staticDir.forEach(dir => {
            this._app.use(express.static(dir));
        })
    }

    this.use(RouterMiddleware);
    this.http = this.use(HttpMiddleware);
    // this.use(MongoDBMiddleware);

    this._app.listen(Config.NODE_PORT, error => {
        if(error) {
            Logger.error(error);
        }else {
            Logger.info("启动服务成功", "监听端口", config.NODE_PORT, "耗时", timer.end(), "ms");
        }
    });
};

Frame.use = function(middleware) {
    try {
        if(middleware.constructor === Function) {
            this._app.use(middleware);
        }else if(middleware.constructor === Object && middleware.install) {
            return middleware.install(this);
        }else {
            Logger.warn("加载中间件异常：", new BaseError("无效的中间件"));
        }
        return null;
    }catch(error) {
        Logger.error("加载中间件异常：", error);
    }
};

Frame.extend = function(prop, value) {
    this[prop] = value;
};

Frame.use(Logger);

global.App = Frame;

module.exports = Frame;