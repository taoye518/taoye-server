class BaseError extends Error {
    constructor(message, stack) {
        super();
        this.code = 500;
        this.name = "BaseError";
        this.message = message || "Internal Server Error";
        if(stack) {
            this.stack = stack;
        }
    }
}
global.BaseError = BaseError;

class InvalidConfigError extends BaseError {
    constructor(message) {
        super();
        this.code = 500;
        this.name = "InvalidConfigError";
        this.message = message || "Config Error";
    }
}
global.InvalidConfigError = InvalidConfigError;

//合法业务错误提示
class BusinessError extends BaseError {
    constructor(message) {
        super();
        this.code = 210;
        this.name = "BusinessError";
        this.message = message || "Business Error";
    }
}
global.BusinessError = BusinessError;

class AuthorizationError extends  BaseError {
    constructor(message) {
        super();
        this.code = 211;
        this.name = "AuthorizationError";
        this.message = message || "Authorization Error";
    }
}
global.AuthorizationError = AuthorizationError;

//Http请求异常
class HttpRequestError extends BaseError {
    constructor(code, message, stack) {
        super();
        this.code = 220;
        this.name = "HttpRequestError";
        this.message = code + ": " + message || "Http Request Error";
        if(stack) {
            this.stack = stack;
        }
    }
}
global.HttpRequestError = HttpRequestError;