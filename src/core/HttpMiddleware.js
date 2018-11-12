const axios = require("axios");

require("../base/index");
const Logger = require("./Logger");
const Timer = require("../util/Timer");
const Constants = require("../util/Constants");
const ActionContext = require("./ActionContext");

/**
 * 应用服务器返回异常代码：
 * 302 重定向
 * 200 成功
 * 210 合法业务异常
 * 211 需要登陆
 * 220 业务服务器异常
 * 401 权限认证失败
 * 403 资源不可用/无权限
 * 404 无法定位的资源
 * 500 代码异常
 */

/**
 * 业务服务器返回异常代码：
 * 200 成功，直接返回响应数据
 * 210 合法业务异常，返回{message}
 * 211 需要登陆，返回{message}
 * 302 重定向，不用返回，响应头里有重定向的地址
 * 400 请求语法错误，不用返回
 * 401 权限认证失败，返回{message}
 * 403 资源不可用/无权限，返回{message}
 * 404 无法定位的资源，不用返回
 * 500 代码异常，返回{message, stack}
 * 510 参数错误，返回{message}
 */

const DEFAULT_CONFIG = {
    url: null,
    method: Constants.METHOD_GET,
    timeout: 10000,
    responseType: "json",
    headers: {
        "Content-Type": "application/json; charset=UTF-8"
    },
    validateStatus (status) {
        return status === 200;
    }
};
DEFAULT_CONFIG.baseURL = "http://localhost:8080";
const EVENTS = {};
const BEFORE_SEND_EVENT = "beforeSendEvent";

const STATUS_PENDING = 0;
const STATUS_FULFILLED = 1;
const STATUS_REJECTED = 2;
const MODE_SINGLE = 0;
const MODE_MULTI = 1;

const HttpRequest = function(config, context) {
    this._context = (context && context.constructor === ActionContext ? context : null);
    this._config = null;
    this._status = STATUS_PENDING;
    this._requestMode = MODE_SINGLE;
    this._resultValue = null;
    this._onResolve = null;
    this._onReject = null;
    this._error = null;

    if(!this._check(config)) {
        return;
    }

    if(this._requestMode === MODE_SINGLE) {
        this._singleRequest();
    }else if(this._requestMode === MODE_MULTI) {
        this._multiRequest();
    }
};
HttpRequest.prototype.then = function(onResolve, onReject) {
    this._onResolve = onResolve;
    this._onReject = onReject;
    this._done();
};
HttpRequest.prototype._check = function(config) {
    let checkResult = true;
    if(config.constructor === Object) {
        config = Object.assign({}, DEFAULT_CONFIG, config);
        this._requestMode = MODE_SINGLE;
        if(String.isNullOrBlank(config.url)) {
            checkResult = false;
            this._reject(new HttpRequestError(100, "异步请求参数不合法，url不能为空"));
        }

    }else if(config.constructor === Array) {
        this._requestMode = MODE_MULTI;
        for(let i = 0; i < config.length; i++) {
            let request = config[i];
            if(request.constructor !== HttpRequest) {
                this._reject(new HttpRequestError(100, "异步请求参数不合法，request方法入参类型为HttpRequest：", request));
                checkResult = false;
                break;
            }
        }
    }
    this._config = config;
    return checkResult;
};
HttpRequest.prototype._singleRequest = function() {
    let config = this._config;
    let beforeSendHandler = EVENTS[BEFORE_SEND_EVENT];
    beforeSendHandler && beforeSendHandler({
        config: config,
        context: this._context
    });
    this._timer = Timer.start();
    Logger.info("发送请求", config.method, config.baseURL + config.url,
        (config.params ? "params:" + JSON.stringify(config.params) : ""), (config.data ? "data:" + JSON.stringify(config.data) : ""));
    axios(config).then(response => {
        this._response = response;
        let data = response.data;
        this._resolve(data);
    }).catch(error => {
        let response = error.response;
        if(response == null) {
            let httpRequestError = new HttpRequestError(error.code, error.message, null);
            this._reject(httpRequestError);
            return;
        }
        let status = response.status;
        let data = response.data;
        if(status === 210) {
            let businessError = new BusinessError(data ? data.message : null);
            this._reject(businessError);
        }else if(status === 211) {
            this._reject(new AuthorizationError(data ? data.message : "需要登陆"));
        }else {
            let httpRequestError = new HttpRequestError(response.status, data && data.message ? data.message : response.statusText, data ? data.stack : null);
            this._reject(httpRequestError);
        }
    });
};

HttpRequest.prototype._multiRequest = function() {
    let config = this._config;
    let total = config.length;
    let completeNum = 0;
    let resultValue = new Array(total);
    let health = true;
    config.forEach((request, index) => {
        if(request.constructor !== HttpRequest) {
            completeNum++;
            return;
        }
        request.then(data => {
            resultValue[index] = data;
            completeNum++;
            if(health && completeNum === total) {
                this._resolve(resultValue);
            }
        }, error => {
            health = false;
            this._reject(error);
        });
    });
};
HttpRequest.prototype._resolve = function(resultValue) {
    if(this._status !== STATUS_PENDING) {
        return;
    }
    this._status = STATUS_FULFILLED;
    this._resultValue = resultValue;
    this._done();
};
HttpRequest.prototype._reject = function(error) {
    if(this._status === STATUS_REJECTED) {
        return;
    }
    this._status = STATUS_REJECTED;
    this._error = error;
    this._done();
};
HttpRequest.prototype._done = function() {
    let config = this._config;
    if(this._status === STATUS_FULFILLED) {
        let resultValue = this._resultValue;
        this._requestMode == MODE_SINGLE && Logger.info("发送请求", config.method, config.baseURL + config.url, "成功，耗时", this._timer.end(), "ms，", "接收数据：", resultValue ? JSON.stringify(resultValue) : null);
        if(this._onResolve) {
            try {
                if(this._requestMode === MODE_MULTI) {
                    this._onResolve.apply(global, resultValue);
                }else {
                    this._onResolve(resultValue);
                }
            }catch(error) {
                this._reject(new BaseError(error.message, error.stack));
            }
        }else {
            this._context && this._context.send(resultValue);
        }
    }else if(this._status === STATUS_REJECTED) {
        let error = this._error;
        if(error.constructor === BusinessError || error.constructor === HttpRequestError) {
            this._requestMode == MODE_SINGLE && Logger.error("发送请求", config.method, config.baseURL + config.url, "异常，", this._timer ? "耗时 " + this._timer.end() + " ms，" : "", error);
        }else {
            Logger.error(error);
        }
        if(this._onReject) {
            this._onReject(error);
        }else {
            this._context && this._context.sendError(error);
        }
    }
};

const HttpMiddleware = {};

HttpMiddleware.get = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_GET,
            url: arguments[0],
            params: arguments[1]
        };
    }
    return new HttpRequest(config, this);
};

HttpMiddleware.getAsync = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_GET,
            url: arguments[0],
            params: arguments[1]
        };
    }
    return new Promise((resolve, reject) => {
        new HttpRequest(config, this).then(data => {
            resolve(data);
        });
    });
};

HttpMiddleware.put = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_PUT,
            url: arguments[0],
            data: arguments[1]
        };
    }
    return new HttpRequest(config, this);
};

HttpMiddleware.putAsync = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_PUT,
            url: arguments[0],
            data: arguments[1]
        };
    }
    return new Promise((resolve, reject) => {
        new HttpRequest(config, this).then(data => {
            resolve(data);
        });
    });
};

HttpMiddleware.post = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        let params = arguments[1];
        let data = arguments[2];
        if(params != null && data == null) {
            data = params;
            params = null;
        }
        config = {
            method: Constants.METHOD_POST,
            url: arguments[0],
            params: params,
            data: data
        };
    }
    return new HttpRequest(config, this);
};

HttpMiddleware.postAsync = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        let params = arguments[1];
        let data = arguments[2];
        if(params != null && data == null) {
            data = params;
            params = null;
        }
        config = {
            method: Constants.METHOD_POST,
            url: arguments[0],
            params: params,
            data: data
        };
    }
    return new Promise((resolve, reject) => {
        new HttpRequest(config, this).then(data => {
            resolve(data);
        });
    });
};

HttpMiddleware.delete = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_DELETE,
            url: arguments[0],
            params: arguments[1]
        };
    }
    return new HttpRequest(config, this);
};

HttpMiddleware.deleteAsync = function() {
    let config = arguments[0];
    if(config.constructor === String) {
        config = {
            method: Constants.METHOD_DELETE,
            url: arguments[0],
            params: arguments[1]
        };
    }
    return new Promise((resolve, reject) => {
        new HttpRequest(config, this).then(data => {
            resolve(data);
        });
    });
};

HttpMiddleware.request = function() {
    let config = Array.prototype.slice.call(arguments);
    return new HttpRequest(config, this);
};

HttpMiddleware.beforeSend = function(handler) {
    EVENTS[BEFORE_SEND_EVENT] = handler;
};

HttpMiddleware.install = function(App) {

    let timer = Timer.start();
    if(Config.GATEWAY_HOST == null) {
        Logger.info("缺少配置项[GATEWAY_HOST] 不加载HttpRequest中间件");
        return;
    }
    Logger.info("开始加载HttpRequest中间件");

    DEFAULT_CONFIG.baseURL = "http://" + Config.GATEWAY_HOST + (Config.GATEWAY_PORT ? ":" + Config.GATEWAY_PORT : "");
    Logger.info("HttpRequest：", "baseURL =", DEFAULT_CONFIG.baseURL);

    ActionContext.extend("request", this.request);
    ActionContext.extend("get", this.get);
    ActionContext.extend("put", this.put);
    ActionContext.extend("post", this.post);
    ActionContext.extend("delete", this.delete);
    ActionContext.extend("getAsync", this.getAsync);
    ActionContext.extend("putAsync", this.putAsync);
    ActionContext.extend("postAsync", this.postAsync);
    ActionContext.extend("deleteAsync", this.deleteAsync);

    Logger.info("加载HttpRequest中间件结束", "耗时", timer.end(), "ms");

    return this;
};

module.exports = HttpMiddleware;

