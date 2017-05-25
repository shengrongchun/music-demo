/**
 */
var srcPlayer = {
    // 播放器功能配置
    wd: "张国荣",   // 显示在搜索栏的搜索词
    volume: 0.5,        // 默认音量值(0~1之间)
    tips: "欢迎使用骚贱音乐",
    limit: 20,  // 搜索结果一次加载多少条
    type: 1,  // 搜索类型
    offset: 0,  // 偏移,
    musicList:2, //歌曲列表
    sheetList:1 //sheet列表
};
// 存储全局变量
var srcObj = [];
//sheet数组
var sheetMusicList = [];
$(function () {
    
    // 顶部按钮点击处理
    $(".btn").click(function(){
        switch($(this).data("action")) {
            case "search":  // 搜索
                $("#btn-area").hide();
                $("#search-area").fadeIn();
                $("#search-wd").val(srcPlayer.wd);
                $("#search-wd").focus();
                $("#search-wd").select();
            break;
            case "list":  // 播放界面
                if(!$(this).hasClass("active")) {
                    $(".btn").removeClass("active");
                    $(this).addClass("active")
                }
                //切换界面
                dataBox('list');
            break;
            case "sheet":  // 音乐表格界面
                if(!$(this).hasClass("active")) {
                    $(".btn").removeClass("active");
                    $(this).addClass("active");
                }
                //切换界面
                dataBox('sheet');
            break;   
        }
    });
    // 关闭搜索框
    $(".search-close").click(function(){
        $("#btn-area").fadeIn();
        $("#search-area").hide();
    });
    // 搜索框回车搜索
    $("#search-wd").bind('keydown',function(event){ 
        if(event.keyCode==13){ 
            $(".search-submit").click(); 
        }
    });
    // 搜索
    $(".search-submit").click(function(){
        var wd = $("#search-wd").val();
        if(!wd) {
            alert("搜索内容不能为空");
            return false;
        }
        search(wd);
        //切换界面
        $(".btn").removeClass("active");
        $(".btn[data-action='list']").addClass("active");       
        dataBox('list');
        //alert("搜索内容为"+wd);

    });
    // 列表鼠标移过显示对应的操作按钮
    $(".music-list").on("mousemove",".list-item", function() {
        var num = parseInt($(this).data("no"));
        //移动在header上
        if(isNaN(num)) return false;
        // 还没有追加菜单则加上菜单
        if(!$(this).data("loadmenu")) {
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' + 
            target.html() + 
            '</span>' +
            '<div class="list-menu" data-no="' + num + '">' +
                '<span class="list-icon icon-play" data-function="play" title="点击播放这首歌"></span>' +
                '<span class="list-icon icon-download" data-function="download" title="点击下载这首歌"></span>' +
                '<span class="list-icon icon-share" data-function="share" title="点击分享这首歌"></span>' +
            '</div>';
            target.html(html);
            $(this).data("loadmenu", true);
        }
    });

    // 列表项双击播放
    $(".music-list").on("dblclick",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;
        listClick(num,$(this));
    });
    // 列表中的菜单点击
    $(".music-list").on("click",".icon-play,.icon-download,.icon-share", function() {
        var num = parseInt($(this).parent().data("no"));
        if(isNaN(num)) return false;
        switch($(this).data("function")) {
            case "play":    // 播放
                listClick(num,$(this).closest('.list-item'));// 调用列表点击处理函数
            break;
            case "download":    // 下载
                //ajaxUrl(musicList[srcObj.dislist].item[num], download);
            break;
            case "share":   // 分享
                // ajax 请求数据
                //ajaxUrl(musicList[srcObj.dislist].item[num], ajaxShare);
            break;
        }
        return true;
    });

    //前一首，后一首，播放暂停按钮事件
    // 播放、暂停按钮的处理
    $(".btn-play").click(function(e){
        playOrPause();
    });
    // 上一首歌
    $(".btn-prev").click(function(){
        prevMusic();
    });
    
    // 下一首
    $(".btn-next").click(function(){
        nextMusic();
    });
    // 静音按钮点击事件
    $(".btn-quiet").click(function(){

        if(volume_bar.percent == 0) {//静音状态
            if(typeof srcObj.defaultVol != 'number') {
                srcObj.defaultVol = srcPlayer.volume;
            }
            volCallback(srcObj.defaultVol);
            volume_bar.goto(srcObj.defaultVol);
        }else {
            if(typeof playerReaddata('volume') == 'number') {
                srcObj.defaultVol = playerReaddata('volume');
            }else {
                srcObj.defaultVol = srcPlayer.volume;
            } 
            volCallback(0);
            volume_bar.goto(0);
        }
    });

    // 滚动条初始化
    $("#main-list,#sheet").mCustomScrollbar({
        theme:"minimal",//相关主题
        advanced:{
            updateOnContentResize: true // 数据更新后自动刷新滚动条
        }
    });
    // 加了滚动条插件和没加滚动条插件所操作的对象是不一样的
    srcObj.sheetList = $("#sheet .mCSB_container");
    srcObj.mainList = $("#main-list .mCSB_container");
    //sheet点击事件
    // 点击专辑显示专辑歌曲
    $("#sheet").on("click",".sheet-cover,.sheet-name", function() {
        //切换到正在播放列表
        $(".btn[data-action='sheet']").removeClass('active');
        $(".btn[data-action='list']").addClass('active');
        dataBox('list');
        //
        var num = parseInt($(this).parent().data("no"));
        if(num == 00000000) {//点击的是播放历史
            $(".btn[data-action='list']")[0].innerText = '播放历史';
            loadMusicList(0);
            return;
        }
        $(".btn[data-action='list']")[0].innerText = '歌曲列表';
        // 寻找数据
        for(var i =0,j=sheetMusicList.length;i<j;i++) {
            if(sheetMusicList[i].no == num) {
                loadMusicData(sheetMusicList[i].subList);
                loadMusicList(srcPlayer.musicList);
                return;
            }
        }
        
    });
    //列表加载中
    addListbar("loading");
    //初始化播放列表
    initList();
    // 初始化play,volumn滚动条
    initProgress(); 
});



            





        












