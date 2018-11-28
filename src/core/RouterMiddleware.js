const fs = require("fs");
const path = require("path");
const getFnParamNames = require("get-parameter-names");
const chokidar = require("chokidar");

const Constants = require("../util/Constants");
const Timer = require("../util/Timer");
const Logger = require("./Logger");
const ActionContext = require("./ActionContext");

const RouterMiddleware = {};
RouterMiddleware._app = null;
RouterMiddleware.routes = {};

RouterMiddleware.install = function(App) {

    if(Config.CONTROLLER_DIR == null) {
        Logger.info("缺少配置项[CONTROLLER_DIR] 不加载ROUTER中间件");
        return;
    }

    let timer = Timer.start();
    Logger.info("开始加载路由中间件");

    this._app = App._app;

    App.extend("router", this);
    App.extend("get", this.get.bind(this));
    App.extend("put", this.put.bind(this));
    App.extend("post", this.post.bind(this));
    App.extend("delete", this.delete.bind(this));

    this.registerController(Config.CONTROLLER_DIR);
    this.listenControllerChange(Config.CONTROLLER_DIR);

    Logger.info("加载路由中间件结束", "耗时", timer.end(), "ms");
    this._app.use(errorHandler);
};

RouterMiddleware.registerController = function(ctrlDir) {
    let regCtrl = (_path) => {
        if(fs.existsSync(_path)) {
            let files = fs.readdirSync(_path);
            if(files != null) {
                files.forEach(fileName => {
                    let filePath = path.join(_path, "/", fileName);
                    let info = fs.statSync(filePath);
                    if(info.isDirectory()) {
                        regCtrl(filePath);
                    }else if(fileName.endsWith(".js")) {
                        require(filePath);
                        Logger.log("加载", filePath, "成功");
                    }
                });
            }
        }else {
            Logger.error("配置的CONTROLLER_PATH：", _path, "不存在");
        }
    };
    if(ctrlDir.constructor == String) {
        regCtrl(ctrlDir);
    }else if(ctrlDir.constructor == Array) {
        ctrlDir.forEach(dir => {
            regCtrl(dir);
        });
    }
};

RouterMiddleware.listenControllerChange = function(ctrlDir) {
    let listenCtrl = (_path) => {
        if(fs.existsSync(_path)) {
            let watcher = chokidar.watch(_path);
            watcher.on("change", (filePath) => {
                delete require.cache[filePath];
                require(filePath);
                Logger.log("重新加载", filePath, "成功");
            });
        }
    };
    if(ctrlDir.constructor == String) {
        listenCtrl(ctrlDir);
    }else if(ctrlDir.constructor == Array) {
        ctrlDir.forEach(dir => {
            listenCtrl(dir);
        });
    }
};

RouterMiddleware.get = function(url, options, action) {
    this.addRoute(Constants.METHOD_GET, url, options, action);
};

RouterMiddleware.put = function(url, options, action) {
    this.addRoute(Constants.METHOD_PUT, url, options, action);
};

RouterMiddleware.post = function(url, options, action) {
    this.addRoute(Constants.METHOD_POST, url, options, action);
};

RouterMiddleware.delete = function(url, options, action) {
    this.addRoute(Constants.METHOD_DELETE, url, options, action);
};

RouterMiddleware.addRoute = function(method, url, options, action) {
    if(method == null || url == null || (options == null && action == null)) {
        Logger.error(new BaseError("错误的路由参数"));
    }
    if(action == null && options instanceof Function) {
        action = options;
        options = {};
    }
    this._app[method.toLowerCase()].call(this._app, url, this._ROUTER_ACTION.bind(this));
    this._addRoute(method, url, action, options);
};

RouterMiddleware._getKey = function(method, url) {
    return method + " " + url;
};

RouterMiddleware._addRoute = function(method, url, action, options) {
    let key = this._getKey(method, url);
    this.routes[key] = new Route(method, url, action, options);
};

RouterMiddleware._getRoute = function(method, url) {
    let key = this._getKey(method, url);
    return this.routes[key];
};

RouterMiddleware._ROUTER_ACTION = function(request, response) {
    let method = request.method;
    let url = request.originalUrl.replace(/\?\S+/g, "");
    let context = new ActionContext(request, response);
    let route = this._getRoute(method, url);
    if(route && route.action) {
        let args = loadActionParameters(route.action, request, response);
        try {
            route.action.apply(context, args)
        }catch(error) {
            Logger.error(error);
            context.status(500).sendError(error);
        }
    }else {
        response.sendStatus(404);
    }
};

const Route = function(method, url, action, options) {
    this.method = method;
    this.url = url;
    this.action = action;
    this.options = options;
};

const loadActionParameters = function(action, request, response) {
    let query = request.query;
    let body = request.body;

    let param = [];
    let paramNames = getFnParamNames(action);

    for(let i = 0; i < paramNames.length; i++) {
        let key = paramNames[i];
        let value = null;
        if(key === "data") {
            value = body;
        }else if(key === "request" || key === "req") {
            value = request;
        }else if(key === "response" || key === "res") {
            value = response;
        }else if(query.hasOwnProperty(key)) {
            value = query[key];
        }else if(body != null && body.hasOwnProperty(key)) {
            value = body[key];
        }else {
            key = String.transformFromTF(key);
            if(query.hasOwnProperty(key)) {
                value = query[key];
            }else if(body != null && body.hasOwnProperty(key)) {
                value = body[key];
            }
        }
        param.push(value);
    }
    return param;
};

const errorHandler = function(error, request, response, next) {
    let code = error && error.code ? error.code : 500;
    Logger.error(error);
    response.status(code).send(error);
};

module.exports = RouterMiddleware;