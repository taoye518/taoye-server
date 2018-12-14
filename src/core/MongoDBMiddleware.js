/**
 * @author: TaoYe
 * @date: 2018/12/6
 * @Description: 
 */

const Constants = require("../util/Constants");
const Timer = require("../util/Timer");
const Logger = require("./Logger");
const ActionContext = require("./ActionContext");

const mongoose = require("mongoose");

const MongoDBMiddleware = {};

MongoDBMiddleware.install = function(App) {

    if(Config.MONGODB_HOST == null) {
        Logger.warn("缺少配置项[MONGODB_HOST] 不加载MONGODB中间件");
        return;
    }else if(Object.notNull(Config.MONGODB_HOST) && Object.isNull(Config.MONGODB_NAME)) {
        Logger.warn("缺少配置项[MONGODB_NAME] 不加载MONGODB中间件");
        return;
    }

    const timer = Timer.start();
    Logger.info("开始加载【数据库】中间件");

    let connection = connect();

    this.db = ActionContext.prototype.$db = connection;

    Logger.info("加载【数据库】中间件结束", "耗时", timer.end(), "ms");

};

const connect = function() {
    //mongodb链接路径示例：mongodb://127.0.0.1/fe-backbone
    let connectPath = `mongodb://${Config.MONGODB_HOST}/${Config.MONGODB_NAME}`;

    mongoose.connect(connectPath);
    let connection = mongoose.connection;

    connection.once("open", successHandler);
    connection.on("error", errorHandler);
    return connection;
};

const successHandler = function() {
    Logger.info(`MongoDB连接成功，${Config.MONGODB_HOST}/${Config.MONGODB_NAME}`);
};

const errorHandler = function(error) {
    Logger.error("MongoDB连接异常", error);
};

module.exports = MongoDBMiddleware;