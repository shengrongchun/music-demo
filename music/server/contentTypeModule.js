'use strict'

    //路径解析模块
    var path = require("path");
    //配置信息
    var config = {
        mime:{
            html:"text/html",
            js:"text/javascript",
            css:"text/css",
            gif:"image/gif",
            jpg:"image/jpeg",
            png:"image/png",
            ico:"image/icon",
            txt:"text/plain",
            json:"application/json",
            default:"application/octet-stream"
        }
    }
    /**
     * 获取文档的内容类型
     * @param filePath
     * @returns {*}
     */
    function getContentType(filePath){
        var contentType = config.mime;
        var ext = path.extname(filePath).substr(1);
        if (contentType.hasOwnProperty(ext)){
            return contentType[ext];
        }else {
            return contentType.default;
        }
    }
    exports.getContentType = getContentType;