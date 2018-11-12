const Logger = require("./Logger");

const CURRENT_USER = "currentUser";
const CURRENT_ORGANIZATION = "currentOrganization";
const MODULES = "modules";
const MENUS = "menus";
const RESOURCES = "resources";
const TOKEN = "token";

const ActionContext = function(request, response) {
    this._request = request;
    this._response = response;
    this.session = request.session;
};

ActionContext.extend = function(prop, value) {
    this.prototype[prop] = value;
};

//自定义缓存数据
ActionContext.prototype.setProperty = function(key, value) {
    this.session[key] = value;
    this.session.save(this.saveSessionError);
};
ActionContext.prototype.getProperty = function(key) {
    return this.session[key];
};
ActionContext.prototype.extend = ActionContext.extend.bind(ActionContext);

//缓存当前登录用户
ActionContext.prototype.setCurrentUser = function(item) {
    this.session[CURRENT_USER] = item;
    this.session.save(this.saveSessionError);
};
//获取当前登录用户
ActionContext.prototype.getCurrentUser = function() {
    return this.session[CURRENT_USER];
};

//缓存当前登录组织
ActionContext.prototype.setCurrentOrganization = function(item) {
    this.session[CURRENT_ORGANIZATION] = item;
    this.session.save(this.saveSessionError);
};
//获取当前登录组织
ActionContext.prototype.getCurrentOrganization  = function() {
    return this.session[CURRENT_ORGANIZATION];
};

//缓存有权限的模块列表
ActionContext.prototype.setModules = function(items) {
    this.session[MODULES] = items;
    this.session.save(this.saveSessionError);
};
//获取有权限的模块列表
ActionContext.prototype.getModules  = function() {
    return this.session[MODULES];
};

//缓存有权限的菜单列表
ActionContext.prototype.setMenus = function(items) {
    this.session[MENUS] = items;
    this.session.save(this.saveSessionError);
};
//获取有权限的菜单列表
ActionContext.prototype.getMenus  = function() {
    return this.session[MENUS];
};

//缓存有权限的资源列表
ActionContext.prototype.setResources = function(items) {
    this.session[RESOURCES] = items;
    this.session.save(this.saveSessionError);
};
//获取有权限的资源列表
ActionContext.prototype.getResources  = function() {
    return this.session[RESOURCES];
};

//缓存有权限的资源列表
ActionContext.prototype.setToken = function(item) {
    this.session[TOKEN] = item;
    this.session.save(this.saveSessionError);
};
//获取有权限的资源列表
ActionContext.prototype.getToken  = function() {
    return this.session[TOKEN];
};

//注销，清除所有缓存数据
ActionContext.prototype.logout = function() {
    let session = this.session;
    session[CURRENT_USER] = null;
    session[CURRENT_ORGANIZATION] = null;
    session[MODULES] = null;
    session[MENUS] = null;
    session[RESOURCES] = null;
    this.session.save(this.saveSessionError);
};

ActionContext.prototype.saveSessionError = function(error) {
    if(error) {
        Logger.error("保存session信息失败", error);
    }
};

ActionContext.prototype.send = function(result) {
    if(result && result.constructor === Number) {
        result = String(result);
    }
    this._response.send(result);
};

ActionContext.prototype.sendError = function(error) {
    let code = error.code || 500;
    let responseData = {
        message: error.message,
        stack: error.stack
    };
    this._response.status(code).send(responseData);
};

ActionContext.prototype.status = function(status) {
    this._response.status(status);
    return this;
};

ActionContext.prototype.sendStatus = function(status) {
    this._response.sendStatus(status);
};

ActionContext.prototype.append = function(key, value) {
    this._response.append(key, value);
};

ActionContext.prototype.set = function(key, value) {
    this._response.set(key, value);
};

ActionContext.prototype.get = function(key) {
    return this._response.get(key);
};

ActionContext.prototype.cookie = function(key, value, options) {
    this._response.cookie(key, value, options);
};

ActionContext.prototype.clearCookie = function(key, options) {
    this._response.clearCookie(key, options);
};

ActionContext.prototype.download = function(path, filename, callback) {
    this._response.download(path, filename, callback);
};

ActionContext.prototype.end = function() {
    this._response.end();
};

ActionContext.prototype.json = function(result) {
    this._response.json(result);
};

ActionContext.prototype.location = function(path) {
    this._response.location(path);
};

ActionContext.prototype.redirect = function(path) {
    this._response.redirect(path);
};

ActionContext.prototype.sendFile = function(path, options, callback) {
    this._response.sendFile(path, options, callback);
};

ActionContext.prototype.type = function(type) {
    this._response.type(type);
};

module.exports = ActionContext;