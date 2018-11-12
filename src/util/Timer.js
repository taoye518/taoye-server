const Timer = function() {
    this.startTime = new Date().getTime();
};

Timer.prototype.end = function() {
    this.endTime = new Date().getTime();
    this.cost = this.endTime - this.startTime;
    return this.cost;
};

Timer.prototype.toString = function() {
    return this.cost + "ms";
};

Timer.start = function() {
    return new Timer();
};

module.exports = Timer;