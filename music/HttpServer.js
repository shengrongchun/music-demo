module.exports = (function(){
    "use strict";

    console.time('[HttpServer][Start]');
    //http协议模块
    var http = require('http');
    //url解析模块
    var url = require('url');
    //字符串解析模块
    //var querystring=require("querystring");
    //httpModule模块
    var httpModule = require("./server/httpModule.js");
    //musicHttpModule模块
    var musicHttpModule = require("./server/musicHttpModule.js");

    return {
        ///配置信息
        config:{
            port: 9898,
            ip:'127.0.0.1',
        },
        //启动服务
        start:function(){
            var port = this.config.port;
            var ip = this.config.ip;
            //创建一个服务
            var httpServer = http.createServer(this.processRequest.bind(this));
            //在指定的端口监听服务
            httpServer.listen(port,function(){
                console.log("[HttpServer][Start]","runing at http://"+ip+":"+port+"/");
                console.timeEnd("[HttpServer][Start]");
            });
            //服务创建
            httpServer.on("error", function(error) {
                console.error(error);
            });
        },
        /**
         * 请求处理
         * @param request
         * @param response
         */
        processRequest:function(request,response){
            var requestUrl = request.url;
            var pathName = url.parse(requestUrl).pathname;
            //var arg = querystring.parse(url.parse(requestUrl).query);
            var arg = url.parse(requestUrl,true).query;
            //对请求的路径进行解码，防止中文乱码
            pathName = decodeURI(pathName);
            if(pathName.length > 3 && pathName.substr(pathName.length-3,3) == '.do') {
                musicHttpModule.switchType(pathName,arg,response);
            }else {
                httpModule.processRequest(pathName,request,response);
            }
            
        }

    }
})();