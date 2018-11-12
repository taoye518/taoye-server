/**
 * 判断对象是否不为空
 * @param expression
 * @returns {boolean}
 */
Object.notNull = function(expression) {
    return expression != null;
};

/**
 * 判断对象是否为空
 * @param expression
 * @returns {boolean}
 */
Object.isNull = function(expression) {
    return expression == null;
};

/**
 * 判断对象是否有成员属性（不包括原型属性）
 * 如果对象是数组，则判断数组长度是否大于0
 * @param expression
 * @returns {boolean}
 */
Object.notEmpty = function(expression) {
    let result = false;
    result = Object.notNull(expression) &&
        (
            (expression.constructor === Array && expression.length > 0) ||
            (expression.constructor === Object && Object.keys(expression).length > 0)
        );
    return result;
};

/**
 * 判断对象是否没有成员属性（不包括原型属性）
 * 如果对象是数组，则判断数组长度是否为0
 * @param expression
 * @returns {boolean}
 */
Object.isEmpty = function(expression) {
    let result = false;
    result = Object.isNull(expression) ||
        (expression.constructor === Array && expression.length === 0) ||
        (expression.constructor === Object && Object.keys(expression).length === 0);
    return result;
};

Object.currencyToString = function(value) {
    let result = "";
    let precision = 2;
    if(value != null && (value.constructor === String || value.constructor === Number)) {
        let text = String(value);
        text = text.replace(/[^\d.]/g, "");
        let text1 = text.split(".")[0];
        let text2 = text.split(".")[1] || "";
        while(text1.length > 1 && text1[0] === "0" && text1[1] !== ".") {
            text1 = text1.slice(1);
        }
        while(text1.length > 3) {
            result = "," + text1.slice(-3) + result;
            text1 = text1.slice(0, text1.length - 3);
        }
        if(text1 && text1.length > 0) {
            result = text1 + result;
        }
        if(text2.length > precision) {
            text2 = text2.slice(0, precision);
        }else {
            while(text2.length < precision) {
                text2 = text2 + "0";
            }
        }
        if(text2 && text2.length > 0) {
            result = result + "." + text2;
        }
    }else {
        result = null;
    }

    return result;
};

Object.stringToCurrency = function(value) {
    let result = null;
    if(value != null && value !== "") {
        if(value.constructor === String) {
            let reg = /[^\d.]/g;
            let text = value.replace(reg, "");
            // console.log("text:", text);
            reg = /[1-9][\d]{0,8}\.[\d]{1,2}|0\.[\d]{1,2}|[1-9][\d]{0,8}/g;
            let matchResult = text.match(reg);
            // console.log("match result:", matchResult);
            if(matchResult != null && matchResult.length > 0) {
                text = matchResult[0];
            }
            if(!isNaN(text)) {
                result = Number(text);
            }
        }else if(value.constructor === Number) {
            result = value;
        }
    }
    // console.log("result:", result);
    return result;
};

Object.isCurrency = function(value) {
    let result = false;
    if(value != null) {
        let text = String(value);
        let reg = /^(([1-9][0-9]{0,8}(\.\d{2})*)|(0\.[\d]{1,4}))$/g;
        result = reg.test(text);
    }
    return result;
};
