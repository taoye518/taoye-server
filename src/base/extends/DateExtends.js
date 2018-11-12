/**
 * 日期格式化
 * @param _formatter yyyy MM dd HH|hh mm ss
 * @returns {string}
 */
Date.prototype.format = function(_formatter) {
    let formatter = _formatter || "yyyy-MM-dd";
    let year = this.getFullYear();
    let month = this.getMonth() + 1;
    let day = this.getDate();
    let hour = this.getHours();
    let minute = this.getMinutes();
    let second = this.getSeconds();
    formatter = formatter.replace("yyyy", year);
    formatter = formatter.replace("MM", (month < 10 ? "0" : "")+ month);
    formatter = formatter.replace("dd", (day < 10 ? "0" : "") + day);
    formatter = formatter.replace(/HH|hh/g, (hour < 10 ? "0" : "") + hour);
    formatter = formatter.replace("mm", (minute < 10 ? "0" : "") + minute);
    formatter = formatter.replace("ss", (second < 10 ? "0" : "") + second);
    return formatter;
};