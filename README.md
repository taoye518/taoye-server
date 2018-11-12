#taoye
a node middleware frame like springMVC, but not complete yet, please don't download.

##说明
目前中间件还处于开发阶段，文档也未完善。。。

##依赖

###Node.js
npm install taoye

##使用
```js
const taoye = require("taoye");
const config = require("your_config_file");

taoye.startup(config);
```

##配置
```js
{
	//必填项，环境参数，会放入process.env.NODE_ENV
	NODE_ENV: "DEVELOPMENT",
	
	//非必填，Web中间件启动监控端口号，默认值为8080，
	NODE_PORT: 8080,

    //非必填，如果需要从第三方系统获取数据，请设置域名或IP+端口
    GATEWAY_HOST: "192.168.0.1",
    GATEWAY_PORT: 9090,

    //非必填，如果需要使用Redis服务器管理Session会话，请设置系统标识，IP，端口，超时时间(默认值7200）
    REDIS_SECRET: "taoye-test",
    REDIS_HOST: "192.168.0.1",
    REDIS_PORT: 6379,
    REDIS_TTL: 7200,
	
	//必填项，业务层文件夹根路径
	CONTROLLER_DIR: path.join(__dirname, "controller"),
	
	//必填项，静态资源文件夹根路径
	STATIC_DIR: path.join(__dirname, "static")
}
```

##添加路由
###GET方法
```js
//Web端调用
axios.get("/test.do?param1=1&param2=2");
//SomeOneController.js
App.get("/test.do", function(param1, param2) {
    //param1 = 1
    //param2 = 2
    this.send();
});
```
###POST方法
```js
//Web端调用
axios.post("/test.do", {
    param1: 1,
    param2: 2
});
//SomeOneController.js
App.get("/test.do", function(data, param1, param2) {
    //data = {param1: 1, param2: 2}
    //param1 = 1
    //param2 = 2
    this.send();
});
```