/**
 * 判断字符串是否不为空字符串
 * @param expression
 * @returns {boolean}
 */
String.notBlank = function(expression) {
    return Object.notNull(expression) && expression !== "";
};

/**
 * 判断字符串是否为空字符串
 * @param expression
 * @returns {boolean}
 */
String.isBlank = function(expression) {
    return Object.notNull(expression) && expression === "";
};

/**
 * 判断字符串是否为空或空字符串
 * @param expression
 * @returns {boolean}
 */
String.isNullOrBlank = function(expression) {
    return Object.isNull(expression) || expression === "";
};

/**
 * 将字符串转变为驼峰规则
 * @param str
 * @returns {string}
 */
String.transform2TF = function(text) {
    if(Object.isNull(text) || String.isBlank(text) || text.indexOf("-") == -1) {
        return "";
    }
    text = text.replace(/\-(\w)/g, _test => {
        return _test.slice(1).toUpperCase();
    });
    return text;
};

/**
 * 将字符串转转变为-规则
 * @param str
 * @returns {string}
 */
String.transformFromTF = function(text) {
    if(Object.isNull(text) || String.isBlank(text) || !/([A-Z])/g.test(text)) {
        return "";
    }
    text = text.replace(/([A-Z])/g, "-$1").toLowerCase();
    return text;
};