const path = require("path");
const fs = require("fs");

App.get("/login.do", function() {
    this.post("/api/star/user/login", {
        loginName: "SysAdmin",
        password: "c4ca4238a0b923820dcc509a6f75849b"
    }, {}).then(data => {
        this.setToken(data.userToken);
        console.log(data);
        this.send(data);
    });
});
App.get("/test1.do", function() {
    this.get("/api/system/user", {
        keyword: null,
        orderBy: null,
        pageNum: 1,
        pageSize: 10
    }).then(data => {
        console.log(data);
        this.send(data);
    });
});

App.get("/test2.do", function() {
    let error = new BusinessError("姓名不能为空");
    this.sendError(error);
});

App.get("/test3.do", function() {
    this.post("/api/star/user/login", {
        loginName: "SysAdmin",
        password: "c4ca4238a0b923820dcc509a6f75849b"
    }, {}).then(data => {
        console.log(data);
    }, error => {
        // console.log(error);
    });
    this.send();
});

App.get("/test4.do", function() {
    this.send("data4");
});

App.get("/test.do", function() {
    let x = 1;
    // this.upload(path.join(__dirname, "..", "startup.js"));
    this.send("success");
});


App.get("/download.do", function() {
    let file = path.join(__dirname, "..", "static/upload", "cloud.png");
    this.download(file);
});

App.post("/upload.do", function(request, response) {
    if(request.busboy) {
        request.busboy.on("file", (fieldName, file, filename, encoding, mimeType) => {
            let saveTo = path.join(__dirname, "..", "static/upload", filename);
            file.pipe(fs.createWriteStream(saveTo));
            file.on("end", function() {
                response.end();
            });
        });
        request.pipe(request.busboy);
    }
});
