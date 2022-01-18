;!function(){
	var layer = layui.layer
	,form = layui.form,
     table = layui.table;

    if(typeof parent.parent.getDhWeb == "undefined"){
        location.href = "./alarmWeb.html";
        return;
    }
    var requestId = 1000, loadingIndex = 0;
    var dhWeb = parent.parent.getDhWeb();
    var upTimeout = 0;
     //上传文件
    $(".uploadBtn").click(function(){
        var file = $(".uploadFile").prop("files");
        if(file.length == ""){
            layer.msg("请选择音频文件");
            return;
        }
        if(file.size > 10 * 1024 * 1024){
            layer.msg("请选择小于10M的文件");
            return;
        }
        var fileName = file[0].name;
        if (window.createObjcectURL != undefined) { 
            fielUrl = window.createOjcectURL(file[0]); 
        } else if (window.URL != undefined) { 
            fielUrl = window.URL.createObjectURL(file[0]); 
        } else if (window.webkitURL != undefined) { 
            fielUrl = window.webkitURL.createObjectURL(file[0]); 
        }
        dhWeb.uploadAudioFile(requestId++, sessionStorage.getItem('loginHandle'), fileName, fielUrl);
        loadingIndex = layer.msg('正在上传，请稍候',{icon: 16,time:false,shade:0.8});
        upTimeout = setTimeout(function(){
            if(loadingIndex > 0){
                layer.close(loadingIndex);
                loadingIndex = 0;
                layer.msg("上传失败");
            }	
        },30000);
    });
    var tableIns = table.render({
        elem: '.audioList'
        ,cols: [[
            {field: 'name',  title: '文件名称'}
            ,{field: 'seconds',title: '时长', templet:function(d){
                return formatSeconds(d.seconds);
            }},
            ,{ title: '操作',width: 120, templet:function(d){
                return '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="delete">删除</a>';
            }},
        ]],
        data:[],
        even: true,
        limit: 20,
        page: {layout: ["prev", "page", "next", "count"]}
      });
    table.on('tool(audioList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        if(layEvent == "delete"){
            layer.confirm('确定删除此文件？',{icon:3, title:'提示信息'},function(index){
                dhWeb.deleteAudioFile(requestId++, sessionStorage.getItem('loginHandle'), data.id);
                loadingIndex = layer.msg('正在删除，请稍候',{icon: 16,time:false,shade:0.8});
                setTimeout(function(){
                    if(loadingIndex > 0){
                        layer.close(loadingIndex);
                        loadingIndex = 0;
                        layer.msg("删除失败");
                    }	
                },10000);
            });
        }
    });
  
    dhWeb.onGetAudioFileList = function(msg){
        if(msg.error == "success"){
            var files = msg.params.files;
            if(!files || files.length == 0) files = [];
            tableIns.reload({data: files});
        }
    }
    var progressTimer = 0;
    //文件上传回应
    dhWeb.onUploadAudioFile = function(msg){
        if(msg.error !="success"){
            layer.close(loadingIndex);
            loadingIndex = 0;
            layer.msg("上传失败");
        }else{
           clearTimeout(upTimeout);
           if(progressTimer > 0) return;
           progressTimer = setTimeout(function(){
               if(progressTimer > 0){
                    layer.close(loadingIndex);
                    loadingIndex = 0;
                    clearTimeout(progressTimer);
                    progressTimer = 0;
                    layer.msg("上传超时");
               }
           },5000);
        }
    }
    //文件上传进度回应
    dhWeb.onUploadAudioFileProgress = function(progress){
        clearTimeout(progressTimer);
        progressTimer = 0;
        if(progress == 1){
            loadingIndex = 0;
            layer.close(loadingIndex);
            layer.msg("上传完成");
            dhWeb.getAudioFileList(requestId++, sessionStorage.getItem('loginHandle'));
        }else{
            $('.layui-layer-msg .layui-layer-content').html('<i class="layui-layer-ico layui-layer-ico16"></i>正在上传，进度：'+ (progress*100).toFixed(2)+"%");
            progressTimer = setTimeout(function(){
                if(progressTimer > 0){
                    layer.close(loadingIndex);
                    loadingIndex = 0;
                    clearTimeout(progressTimer);
                    progressTimer = 0;
                    layer.msg("上传超时");
                }
            },10000);
        }
       
    }
    //音频文件解码失败
    dhWeb.onDecodeAudioError = function(msg){
        console.log(msg);
        layer.msg("文件不正确");
        layer.close(loadingIndex);
        loadingIndex = 0;
    }
    //删除回调
    dhWeb.onDeleteAudioFile = function(msg){
        layer.close(loadingIndex);
        loadingIndex = 0;
        if(msg.error == "success"){
            layer.msg("删除成功");
            dhWeb.getAudioFileList(requestId++, sessionStorage.getItem('loginHandle'));
            tableIns.reload({data: []});
        }else{
            layer.msg("删除失败");
        }
    }
    setTimeout(function(){
        dhWeb.getAudioFileList(requestId++, sessionStorage.getItem('loginHandle'));
    },1000)

    function formatSeconds(time){
        let hour = parseInt(time/3600) < 10 ? '0' + parseInt(time/3600) : parseInt(time/3600) ;
        let minite = parseInt(time/60%60) < 10 ? '0' + parseInt(time/60%60):parseInt(time/60%60);
        let seconds = time%60 < 10 ? '0' + time%60 : time%60;
        let  newTime = hour + ':' + minite + ':' + seconds;
        
        return newTime;
    }
   

}();