Number.prototype.add = function(value, digit) {
    let m = digit ? Math.pow(10, digit) : 100;
    value = !isNaN(value) ? Number(value) : 0;
    return Math.round((this + value) * m) / m;
};

Number.prototype.minus = function(value, digit) {
    let m = digit ? Math.pow(10, digit) : 100;
    value = !isNaN(value) ? Number(value) : 0;
    return Math.round((this - value) * m) / m;
};

Number.prototype.multiply = function(value, digit) {
    let m = digit ? Math.pow(10, digit) : 100;
    value = !isNaN(value) ? Number(value) : 0;
    return Math.round((this * value) * m) / m;
};

Number.prototype.divide = function(value, digit) {
    let m = digit ? Math.pow(10, digit) : 100;
    value = !isNaN(value) ? Number(value) : 0;
    return Math.round((this / value) * m) / m;
};

String.prototype.add = function(value, digit) {
    let result = !isNaN(this) ? parseFloat(this) : 0;
    return result.add(value, digit);
};

String.prototype.minus = function(value, digit) {
    let result = !isNaN(this) ? parseFloat(this) : 0;
    return result.minus(value, digit);
};

String.prototype.multiply = function(value, digit) {
    let result = !isNaN(this) ? parseFloat(this) : 0;
    return result.multiply(value, digit);
};

String.prototype.divide = function(value, digit) {
    let result = !isNaN(this) ? parseFloat(this) : 0;
    return result.divide(value, digit);
};

Math.add = function() {
    let args = Array.prototype.slice.call(arguments);
    let result = 0;
    args.forEach(arg => {
        result = result.add(arg);
    });
    return result;
};

Math.minus = function() {
    let args = Array.prototype.slice.call(arguments);
    let result = !isNaN(args[0]) ? parseFloat(args[0]) : 0;
    args.forEach((arg, index) => {
        if(index > 0) {
            result = result.minus(arg);
        }
    });
    return result;
};

Math.multiply = function() {
    let args = Array.prototype.slice.call(arguments);
    let result = !isNaN(args[0]) ? parseFloat(args[0]) : 0;
    args.forEach((arg, index) => {
        if(index > 0) {
            result = result.multiply(arg);
        }
    });
    return result;
};

Math.divide = function(a, b, digit) {
    let result = !isNaN(a) ? parseFloat(a) : 0;
    result = result.divide(b, digit);
    return result;
};

