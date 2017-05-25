// ajax加载歌词
// 参数：音乐ID，回调函数
function ajaxLyric(mid, callback) {
    //歌词加载中提示
    lyricTip('歌词加载中...');
    if(!mid) {callback('');}  // 没有音乐ID，直接返回
    $.ajax({
        type:"GET",
        url:"ajaxLyric.do?id="+mid,
        dataType: "json",
        success: function(jsonData) {
            var data = '';
            if(jsonData.uncollected) {
                console.log("请求参数不正确");
            }else {
                if(jsonData.lrc && jsonData.lrc.lyric) {
                    data = jsonData.lrc.lyric;
                }
            }
            callback(jsonData.lrc.lyric);
        },
        error: function(err) {
            console.log("ajax请求错误");
        }

    });
}
//ajax 加载sheet数据
function ajaxSheetData(ids,callback) {
    $.ajax({
        type:"GET",
        url:"/sheet.do?id="+ids,
        dataType: "json",
        success: function(jsonData) {
            if(jsonData.msg == 'no resource' || jsonData.code == 404) {
                callback('');
            }else {
               callback({
                    "name":jsonData.result.name?jsonData.result.name:null,
                    "no":jsonData.result.id?jsonData.result.id:null,
                    "cover": jsonData.result.coverImgUrl?jsonData.result.coverImgUrl:null,
                    "subList": jsonData.result.tracks?jsonData.result.tracks:null
                }); 
            }  
        },
        error: function(err) {
            console.log("ajax请求错误");
            srcObj.sheetList.html('<p class="sheetTips">数据加载失败...</p>');
        }

    });
}
//ajax 搜索歌曲数据
function ajaxSearchData(params,callback) {
    $.ajax({
        type:"GET",
        url:"/search.do?key="+params.key+"&offset="+params.offset+"&type="+params.type+"&limit="+params.limit,
        dataType: "json",
        success: function(jsonData) {
            if(jsonData.code == 200) {
                srcPlayer.songCount = jsonData.result.songCount;
                callback(jsonData.result.songs);
            }
            //console.log(jsonData);
        },
        error: function(err) {
            console.log("ajax请求错误");
        }

    });
}