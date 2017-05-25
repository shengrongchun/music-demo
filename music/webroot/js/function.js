// 播放器本地存储信息
// 参数：键值、数据
function playerSavedata(key, data) {
    key = 'srcPlayer_' + key;    // 添加前缀，防止串用
    data = JSON.stringify(data);
    //存储，IE6~7 cookie 其他浏览器HTML5本地存储
    if (window.localStorage) {
        localStorage.setItem(key, data);    
    } else {
        Cookie.write(key, data);    
    }
}
// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function playerReaddata(key) {
    key = 'srcPlayer_' + key;
    return JSON.parse(window.localStorage? localStorage.getItem(key): Cookie.read(key));
}
// 向列表中加入列表头
function addListhead() {
    var html = '<div class="list-item list-head">' +
    '    <span class="music-album">' +
    '        专辑' +
    '    </span>' +
    '    <span class="auth-name">' +
    '        演唱者' +
    '    </span>' +
    '    <span class="music-name">' +
    '        歌曲' +
    '    </span>' +
    '</div>';
    srcObj.mainList.append(html);//歌曲列表
}
// 加载列表中的提示条
// 参数：类型（more、nomore、loading、nodata）
function addListbar(types) {
    var html;
    switch(types) {
        case "more":    // 还可以加载更多
            html = '<div class="list-item text-center list-loadmore" title="点击加载更多数据" id="list-foot">点击加载更多...</div>';
        break;
        
        case "nomore":  // 数据加载完了
            html = '<div class="list-item text-center" id="list-foot">没有更多数据了</div>';
        break;
        
        case "loading":
            html = '<div class="list-item text-center" id="list-foot">播放列表加载中...</div>';
        break;
        
        case "nodata":
            html = '<div class="list-item text-center" id="list-foot">未获取到列表数据</div>';
        break
    }
    srcObj.mainList.append(html);//歌曲列表
}
// 列表中新增一项
// 参数：编号、名字、歌手、专辑
function addItem(no, name, auth, album) {
    var html = '<div class="list-item" data-no="' + (no - 1) + '">' +
    '    <span class="list-num">' + no + '</span>' +
    '    <span class="music-album">' + album + '</span>' +
    '    <span class="auth-name">' + auth + '</span>' +
    '    <span class="music-name">' + name + '</span>' +
    '</div>'; 
    srcObj.mainList.append(html);
}
// 向列表中载入某个播放列表的数据整理
function loadMusicData(list) {
    musicList[srcPlayer.musicList].item = [];
    for(var i = 0,j=list.length; i<j; i++) {
        musicList[srcPlayer.musicList].item.push({
            musicName:list[i].name,
            artistsName:list[i].artists[0].name,
            albumName:list[i].album.name,
            albumPic:list[i].album.blurPicUrl,
            musicId:list[i].id,
            mp3Url:list[i].mp3Url

        }); 
    }
}
// 载入歌曲列表
function loadMusicList(list) {
    srcObj.listNo = list;
    srcObj.mainList.html(''); // 清空列表中原有的元素
    
    if(musicList[list].item.length == 0) {
        addListbar('nodata');
        return;
    }
    addListhead();      // 向列表中加入列表头
    //列表长度
    srcObj.listLength = musicList[list].item.length;
    // 逐项添加数据
    for(var i=0; i<srcObj.listLength; i++) {
        addItem(i + 1, musicList[list].item[i].musicName, musicList[list].item[i].artistsName, musicList[list].item[i].albumName);
    }
}
//加载sheet列表
function loadSheet(no) {
    //第一次执行回调
    srcObj.noDataId = 1;
    for(var i =0,j=musicList[no].item.length;i<j;i++) {
        ajaxSheetData(musicList[no].item[i].id,loadSheetList);
        //srcObj.sheetLength = j;//sheet的长度
    }
}
// 初始化播放列表
function initList() {
    //初始化播放列表
    loadMusicList(srcPlayer.musicList);
    //歌词显示 欢迎信息
    lyricTip(srcPlayer.tips);
    //循环加载sheet列表
    //sheet加载中提示
    srcObj.sheetList.html('<p class="sheetTips">数据加载中...</p>');
    loadSheet(srcPlayer.sheetList); 
}


// 播放正在播放列表中的歌曲
// 参数：歌曲在列表中的ID
function listClick(no,objThis) {
    //
    if(srcObj.this == objThis) {//表示现在是有播放状态,并且是同一首
        playOrPause();
        return;
    }
    //
    srcObj.this = objThis;//更新this
    srcObj.no = no;//更新no
    srcObj.play = true;//设置播放标志为 true
    music_bar.lock(false);//消除拖放条锁住
    //显示底部播放样式
    btnPlay();
    //显示播放 跑马灯等样式
    playShowImg(objThis);
    //播放事件
    play(musicList[srcObj.listNo].item[no]);
}
// 播放音乐
// 参数：要播放的音乐数组
function play(music) {
    // 遇到错误播放下一首歌
    if(music.mp3Url == "err" || !music.mp3Url) {
        audioErr(); // 调用错误处理函数
        return false;
    }
    changeCover(music.albumPic);// 更新封面展示
    ajaxLyric(music.musicId, lyricCallback);// ajax加载歌词
    $('audio').remove();    // 移除之前的audio
    var newAudio = $('<audio>').html('<source src="'+ music.mp3Url +'">').appendTo('html')[0];
        newAudio.play();
        srcObj.audio = newAudio;
        //播放的音乐放入播放历史记录中，musicList[0].item
        putDataHisList(music);
        //
        if(typeof playerReaddata('volume') == 'number') {
            srcObj.audio.volume = playerReaddata('volume');
        }else {
            srcObj.audio.volume = srcPlayer.volume;
        }
        // 绑定歌曲进度变化事件
        srcObj.audio.addEventListener('timeupdate', updateProgress);
        //srcObj.audio.addEventListener('play', audioPlay); // 开始播放了
        //srcObj.audio.addEventListener('pause', audioPause);   // 暂停
        srcObj.audio.addEventListener('ended', noBtnNextNusic);   // 播放结束
        $('audio source').on('error', audioErr);   // 播放器错误处理
}
//放入播放历史记录中
function putDataHisList(data) {
    var have = false;
    for(var i =0,j=musicList[0].item.length;i<j;i++) {
        if(musicList[0].item[i].musicId == data.musicId) {
            have = true;
            return;
        }
    }
    //如果没有，则push
    if(!have) {
        musicList[0].item.push(data);
    }
}
// 音频错误处理函数
function audioErr() {
    alert('当前歌曲播放失败，自动播放下一首');
    lyricTip('当前歌曲播放失败，自动播放下一首');
    srcObj.no++;
    noBtnNextNusic();
}
//非点击按钮 下一首事件
function noBtnNextNusic() {
    if((srcObj.no+1) == srcObj.listLength || (srcObj.no+1) > srcObj.listLength) {//最后一首歌
        //恢复初始状态
        srcObj.audio = undefined;
        //跑马灯消除
        playHideImg();
        //暂停样式
        btnPause();
        //进度条返回0
        music_bar.goto(0);
        //进度条禁止点击
        music_bar.lock(true);
        //歌词消失,显示欢迎信息
        lyricTip(srcPlayer.tips);
    }else {
        nextMusic();
    }
}
//更新进度事件
function updateProgress() {
    // 暂停状态不管
    if(!srcObj.play) return;
    // 同步进度条
    music_bar.goto(srcObj.audio.currentTime / srcObj.audio.duration);
    // 同步歌词显示   
    scrollLyric(srcObj.audio.currentTime);
}
//下一首
function nextMusic() {
    if((srcObj.no+1) == srcObj.listLength) {//最后一首歌,没有下一首
        return;
    }
    //跑马灯消除
    playHideImg();
    //暂停样式
    btnPause();
    //进度条返回0
    music_bar.goto(0);
    //播放
    listClick(srcObj.no+1,srcObj.this.next('.list-item'));
}
//上一首
function prevMusic() {
    if(srcObj.no == 0) {//第一首歌,没有上一首
        return;
    }
    //跑马灯消除
    playHideImg();
    //暂停样式
    btnPause();
    //进度条返回0
    music_bar.goto(0);
    //播放
    listClick(srcObj.no-1,srcObj.this.prev('.list-item'));
}
//显示 跑马灯和隐藏 播放图标
function playShowImg(ele) {
    if($('.list-playing')) {
        $('.list-playing').removeClass('list-playing')
    }
    ele.addClass('list-playing');
    
}
//隐藏 跑马灯和显示 播放图标
function playHideImg() {
    if($('.list-playing')) {
        $('.list-playing').removeClass('list-playing')
    }
}
// 点击播放或者暂停按钮的事件
function playOrPause() {
    if(!srcObj.play) {//如果是暂停，需要播放
        if(srcObj.audio) {
            srcObj.audio.play();
            btnPlay();//播放样式
            playShowImg(srcObj.this);//跑马灯显示
        }else {//第一次播放
            listClick(0,$('.list-item:eq(1)'));
        }
    }else {//暂停
        if(srcObj.audio) {
            srcObj.audio.pause();
        }
        //跑马灯消除
        playHideImg();
        //暂停样式
        btnPause();
    }   
}
//底部按钮播放样式
function btnPlay() {
    $(".btn-play").addClass("btn-state-paused");
    srcObj.play = true;
    //右侧图片样式旋转
    $(".cover").addClass("turn-on");
}
//底部按钮暂停样式
function btnPause() {
    $(".btn-play").removeClass("btn-state-paused");
    srcObj.play = false;
    //消除右侧图片样式旋转
    $(".cover").removeClass("turn-on");
}
//播放回调函数,根据拖动的位置计算响应 音乐播放的程度
function playCallback(newVal) {
    var newTime = srcObj.audio.duration * newVal;
    // 刷新 歌词
    refreshLyric(newTime);
    // 应用新的进度
    srcObj.audio.currentTime = newTime;
}
//音量回调函数
function volCallback(newVal) {
    if(srcObj.audio) {
        srcObj.audio.volume = newVal;
    }
    //如果点击以外或者0部分,加上静音
    if(newVal === 0) {
        $(".btn-quiet").addClass("btn-state-quiet");
    }else {
        // 当静音状态，你点击bar任何地方应该都是取消静音
        if($(".btn-quiet").is('.btn-state-quiet')) {
            $(".btn-quiet").removeClass("btn-state-quiet");
        }
    }
    //保存音量
    playerSavedata('volume', newVal);  
}
// 初始化滚动条
function initProgress(){
    // 初始化播放进度条
    music_bar = new mkpgb("#music-progress", 0, playCallback, true);
    // 初始化音量设定
    var tmp_vol = srcPlayer.volume;
    //tmp_vol = tmp_vol? tmp_vol: (isMobile.any()? 1: srcPlayer.volume);
    volume_bar = new mkpgb("#volume-progress", tmp_vol, volCallback, false);
};
// mk进度条插件
// 进度条框 id，初始量，回调函数
mkpgb = function(bar, percent, callback, locked){  
    this.bar = bar;
    this.percent = percent;
    this.callback = callback;
    this.locked = locked;
    this.init(this.locked);  
};
mkpgb.prototype = {
    // 进度条初始化
    init : function(locked){
        var ts = this,mdown = false;//不可拖动
        //锁住方法
        ts.lock(locked);
        // 加载进度条html元素
        $(ts.bar).html('<div class="mkpgb-bar"></div><div class="mkpgb-cur"></div><div class="mkpgb-dot"></div>');
        // 获取偏移量
        ts.minLength = $(ts.bar).offset().left;//第一个点的x坐标 
        ts.maxLength = $(ts.bar).width() + ts.minLength;//第二个点的x坐标
        // 窗口大小改变偏移量重置
        $(window).resize(function(){
            ts.minLength = $(ts.bar).offset().left; 
            ts.maxLength = $(ts.bar).width() + ts.minLength;
        });
        // 监听小点的鼠标按下事件
        $(ts.bar + " .mkpgb-dot").mousedown(function(e){
            e.preventDefault();    // 取消原有事件的默认动作
        });

        // 监听进度条整体的鼠标按下事件
        $(ts.bar).mousedown(function(e){
            if(!ts.locked) {//未锁住
                mdown = true;//设置可以拖动
            }
            barMove(e);
        });
        // 监听鼠标移动事件，用于拖动
        $("html").mousemove(function(e){
            barMove(e);
        });
        // 监听鼠标弹起事件，用于释放拖动
        $("html").mouseup(function(e){
            mdown = false;//不可拖动
        });
        //此方法主要是设置小球的移动位置，和播放或音量百分比显示
        function barMove(e) {
            //如果不给拖动，返回
            if(!mdown) {return;}
            var percent;
            if(e.clientX < ts.minLength) {
                percent = 0;
            }else if(e.clientX > ts.maxLength) {
                percent = 1;
            }else {
                percent = (e.clientX-ts.minLength)/(ts.maxLength-ts.minLength);
            }
            //执行回调
            ts.callback(percent);
            //
            ts.goto(percent);
            return true;
        }
        //初始化进度
        ts.goto(ts.percent);
        return true;
    },//跳转至某处
    goto: function(percent) {
        //又一次防止出界
        if(percent > 1) percent = 1;
        if(percent < 0) percent = 0;
        //重置this的percent
        this.percent = percent;
        //小球移动
        $(this.bar + " .mkpgb-dot").css("left", (percent*100) +"%");
        //进度条移动
        $(this.bar + " .mkpgb-cur").stop().animate({width: (percent*100)+"%"}, 20);
        return true;
    },
    // 锁定进度条
    lock : function(islock) {
        if(islock) {
            this.locked = true;
            $(this.bar).addClass("mkpgb-locked");
        } else {
            if(!this.locked) return;//防止多次执行下面的dom操作
            this.locked = false;
            $(this.bar).removeClass("mkpgb-locked");
        }
        return true;
    }
}; 
// 改变右侧封面图像
// 新的图像地址
function changeCover(img) {
    if(!img) img = "images/player_cover.png";
    var animate = false,imgload = false;
    img += "?param=200x200";    // 限制封面图为 186*186px
    $("#music-cover").attr("src", img);     // 改变右侧封面
    // 先隐藏图片
    $("#blur-canvas").fadeOut(1000);
    // 图像加载完成
    $("#music-cover").load(function(){
        if(animate) {   // 渐变动画也已完成
            blurCover();    // 替换图像并淡出
        } else {
            imgload = true;     // 告诉下面的函数，图片已准备好
        }
    });
    // 渐变动画
    $("#blur").animate({opacity: "0.7"}, 1000, function(){
        if(imgload) {   // 如果图片已经加载好了
            blurCover();    // 替换图像并淡出
        } else {
            animate = true;     // 等待图像加载完
        }
    });
}
// 背景更换特效
function blurCover() {
    var bCanvas = $("#blur-canvas")[0].getContext("2d");
    bCanvas.drawImage($("#music-cover")[0], 10, 10, 20, 20, 0, 0, $("body").width(), $("body").height());
    $("#blur-canvas").fadeIn(1000);
    $("#blur").animate({opacity:"0.6"}, 1500); // 背景更换特效
}
//歌词相关函数
var lyricArea = $("#lyric");    // 歌词显示容器
// 在歌词区显示提示语（如歌词加载中、无歌词等）
function lyricTip(str) {
    lyricArea.html("<li class='lyric-tip'>"+str+"</li>");     // 显示内容
}
// 歌曲加载完后的回调函数
// 参数：歌词源文件
function lyricCallback(str) {
    srcObj.lyric = parseLyric(str);    // 解析获取到的歌词
    if(srcObj.lyric === '') {
        lyricTip('未获取到歌词');
        return false;
    }
    lyricArea.html('');     // 清空歌词区域的内容
    lyricArea.scrollLeft(0);    // 滚动到顶部
    // 显示全部歌词
    var i = 0;
    for(var k in srcObj.lyric){
        var txt = srcObj.lyric[k];
        if(!txt) txt = "&nbsp;";
        var li = $("<li data-no='"+i+"' class='lrc-item'>"+txt+"</li>");
        lyricArea.append(li);
        i++;
    }
}
// 解析歌词
// 参数：原始歌词文件
function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}
// 强制刷新当前时间点的歌词
// 参数：当前播放时间（单位：秒）
function refreshLyric(time) {
    if(srcObj.lyric === '') return false;
    
    time = parseInt(time);  // 时间取整
    var refreshTime = 0;
    for(var ktime in srcObj.lyric){
        if(ktime >= time) break;
        refreshTime = ktime;// 记录上一句的
    }
    scrollLyric(refreshTime);
}
// 滚动歌词到指定句
// 参数：当前播放时间（单位：秒）
function scrollLyric(time) {
    if(srcObj.lyric === '') return false;
    
    time = parseInt(time);  // 时间取整
    
    if(srcObj.lyric === undefined || srcObj.lyric[time] === undefined) return false;  // 当前时间点没有歌词
    
    if(srcObj.lastLyric == time) return true;  // 歌词没发生改变
    
    var i = 0;  // 获取当前歌词是在第几行
    for(var k in srcObj.lyric){
        if(k == time) break;
        i ++;
    }
    srcObj.lastLyric = time;  // 记录方便下次使用
    $(".lplaying").removeClass("lplaying");     // 移除其余句子的正在播放样式
    $(".lrc-item[data-no='" + i + "']").addClass("lplaying");    // 加上正在播放样式
    
    var scroll = (lyricArea.children().height() * i) - ($(".lyric").height() / 2); 
    lyricArea.stop().animate({scrollTop: scroll}, 300);  // 平滑滚动到当前歌词位置
    
}



//sheet函数部分
// 选择要显示哪个数据区
// 参数：要显示的数据区（list、sheet）
function dataBox(choose) {
    switch(choose) {
        case "list": // 显示播放列表
            $("#main-list").fadeIn();
            $("#sheet").fadeOut();
        break;
        case "sheet":   // 显示专辑
            $("#sheet").fadeIn();
            $("#main-list").fadeOut();
        break;
    }
}
// 添加一个歌单
// 参数：编号、歌单名字、歌单封面
function addSheet(no, name, cover) {
    if(!cover) cover = "img/player_cover.png";
    if(!name) name = "读取中...";
    cover += "?param=200x200";  // 限制封面图像大小
    var html = '<div class="sheet-item" data-no="' + no + '">' +
    '    <img class="sheet-cover" src="' +cover+ '">' +
    '    <p title='+name+' class="sheet-name">' +name+ '</p>' +
    '</div>'; 
    srcObj.sheetList.append(html);
}
//载入sheet列表
function loadSheetList(sheetObject) {
    if(srcObj.noDataId == 1) {//第一次回调的时候，要把播放历史加进去
        srcObj.sheetList.html('');
        var playHistory = {
            no:'00000000',
            name: '播放历史',
            cover: null
        };
        addSheet(playHistory.no,playHistory.name,playHistory.cover);
    }
    if(sheetObject.name) {
        sheetMusicList.push(sheetObject);
        addSheet(sheetObject.no,sheetObject.name,sheetObject.cover);
    }
    //执行一次回调就加一
    srcObj.noDataId++;
}
//搜索函数
function search(wd) {
    srcPlayer.wd = wd;
    ajaxSearchData({
        key: srcPlayer.wd,
        offset: srcPlayer.offset,
        limit: srcPlayer.limit,
        type: srcPlayer.type
    },searchCallback);
}
//搜索音乐回调函数
function searchCallback(list) {
    loadMusicData(list);
    loadMusicList(srcPlayer.musicList);
}