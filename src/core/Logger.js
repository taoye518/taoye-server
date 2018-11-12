require("../base/extends/DateExtends");
const Timer = require("../util/Timer");

const LEVEL_LOG = "LOG";
const LEVEL_INFO = "INFO";
const LEVEL_WARN = "WARN";
const LEVEL_ERROR = "ERROR";
const LEVEL_COLOR = {
    DEFAULT: "\x1b[30m",
    LOG: "\x1b[1;30m",
    INFO: "\x1b[1;34m",
    WARN: "\x1b[1;33m",
    ERROR: "\x1b[1;31m",
};

const Logger = {};

Logger.install = function(frame) {

    let timer = Timer.start();
    this.info("开始加载日志中间件");

    frame.extend("log", this.log.bind(this));
    frame.extend("info", this.info.bind(this));
    frame.extend("warn", this.warn.bind(this));
    frame.extend("error", this.error.bind(this));

    this.info("加载日志中间件结束", "耗时", timer.end(), "ms");
};

Logger.log = function() {
    this._log(LEVEL_LOG, Array.prototype.slice.call(arguments));
};

Logger.info = function() {
    this._log(LEVEL_INFO, Array.prototype.slice.call(arguments));
};

Logger.warn = function() {
    this._log(LEVEL_WARN, Array.prototype.slice.call(arguments));
};

Logger.error = function() {
    this._log(LEVEL_ERROR, Array.prototype.slice.call(arguments));
};

Logger._log = function(level, args) {
    let time = new Date().format("yyyy-MM-dd HH:mm:ss");
    let errors = [];
    args.forEach(arg => {
        if(arg instanceof Error) {
            errors.push(arg);
            args[args.indexOf(arg)] = arg.message;
        }
    });
    args = [
        LEVEL_COLOR[level] + "####",
        time,
        level,
        "####"
    ].concat(args).concat(LEVEL_COLOR.DEFAULT);
    console.log.apply(console, args);
    errors.length > 0 && errors.forEach(arg => {
        let stack = arg.stack;
        if(stack && stack.constructor == Array && stack.length > 5) {
            stack = stack.slice(0, 5);
        }
        stack && console.log(stack);
    });
};

module.exports = Logger;