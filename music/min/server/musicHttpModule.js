'use strict'
//http协议模块
var http = require('http');
var querystring = require('querystring');
//歌词
function httpLyric(id,response) {
    http.get('http://music.163.com/api/song/lyric?os=pc&id='+id+'&lv=-1&kv=-1&tv=-1',function(res) {
        var resData = '';
        res.on('data',function(data) {
            resData += data.toString();
        });
        res.on('end',function() {
            response.writeHead(res.statusCode, {"content-type": "text/plain;charset=utf-8"});
            response.end(resData,"utf-8");
        });
    }).on('error',function(e) {
        console.error(e);
    });
            
}
//歌词
function httpSheet(id,response) {
    http.get('http://music.163.com/api/playlist/detail?id='+id+'&updateTime=-1',function(res) {
        var resData = '';
        res.on('data',function(data) {
            resData += data.toString();
        });
        res.on('end',function() {
            response.writeHead(res.statusCode, {"content-type": "text/plain;charset=utf-8"});
            response.end(resData,"utf-8");
        });
    }).on('error',function(e) {
        console.error(e);
    });
            
}
//搜索歌曲
function httpSearch(arg,response) {
    var data = querystring.stringify({
        s:arg.key,
        offset:arg.offset,
        limit:arg.limit,
        type:arg.type
    });
    var options = {
        host: 'music.163.com',
        path:'/api/search/pc',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function(res) {
        //res.setEncoding('utf8');
        var resData = '';
        res.on('data', function (data) {
            resData += data;
        });
        res.on('end',function(){//数据加载完成后
            response.writeHead(res.statusCode, {"content-type": "text/plain;charset=utf-8"});
            response.end(resData,"utf-8");
        })
    });
    req.write(data);
    req.end();          
}
//
function switchType(pathName,arg,response) {
    if(pathName == '/ajaxLyric.do') {
        httpLyric(arg.id,response);
    }else if(pathName == '/sheet.do') {
        httpSheet(arg.id,response);
    }else if(pathName == '/search.do') {
        httpSearch(arg,response);
    }
}
exports.switchType = switchType;