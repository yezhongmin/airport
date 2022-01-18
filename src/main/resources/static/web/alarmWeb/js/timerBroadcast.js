;!function(){
	var layer = layui.layer,
	table = layui.table;
    
    if(typeof parent.getDhWeb == "undefined"){
        location.href = "./alarmWeb.html";
        return;
    }
    var dhWeb = parent.getDhWeb();
    var requestId = 1000, loadingIndex = 0;

    var tableIns = table.render({
        elem: '.bcTaskTable'
        ,cols: [[ 
            {field: 'name',  title: '任务名称'}
            ,{field: 'execMode',title: '播放模式',templet:function(d){
               if(d.execMode == "EveryWeek"){
                    return "每周";
               }else if(d.execMode == "EveryDay"){
                    return "每天";
               }else if(d.execMode == "Single"){
                    return "单次";
               }else{
                   return "未知";
               }
            }},
            ,{field: 'startTimeOfDay',title: '启动时间'}
            ,{title: '定时模式', templet:function(d){
                if(d.duration && d.duration.enable == true){
                     return formatSeconds(d.duration.seconds);
                }else if(d.loop && d.loop.enable == true){
                    return d.loop.times+"次";
                }
             }},
            ,{field: 'volume',title: '音量'}
            ,{ title: '操作',width: 180, templet:function(d){
                var enableBtn = "";
                if(d.enable){
                    enableBtn = '<a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="enable">已启用</a>';
                }else{
                    enableBtn = '<a class="layui-btn layui-btn-xs layui-btn-warm" lay-event="enable">已禁用</a>';
                }
                return enableBtn + '<a class="layui-btn layui-btn-xs" lay-event="edit">修改</a>'+
                        '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="delete">删除</a>';
            }},
        ]],
        limit: 20,
        page: {layout: ["prev", "page", "next", "count"]},
        data: [],
        even: true,
        id: "bcTaskList"
      });
    table.on('tool(bcTaskTable)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        if(layEvent == "delete"){
            layer.confirm('确定删除此任务？',{icon:3, title:'提示信息'},function(index){
                dhWeb.deleteBCTask(requestId++, sessionStorage.getItem('loginHandle'), data.id);
                loadingIndex = layer.msg('正在删除，请稍候',{icon: 16,time:false,shade:0.8});
                setTimeout(function(){
                    if(loadingIndex > 0){
                        layer.close(loadingIndex);
                        loadingIndex = 0;
                        layer.msg("删除失败");
                    }	
                },10000);
            });
            
        }else if(layEvent == "edit"){
            var docWidth = $(document).width();
            var width = docWidth > 1200 ? 1200 : docWidth - 40;
            layer.open({
                title : "修改任务",
                type : 2,
                id: "taskOpe",
                area : [width+"px", "calc(100% - 80px)"],
                btn: ['确定', '取消'],
                // shade: 0,
                content : "addBroadcastTask.html",
                success : function(layero, index){
                    var body = layui.layer.getChildFrame('body', index);
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                   
                    body.find(".taskId").val(data.id);
                    body.find(".taskName").val(data.name);
                    body.find(".volume").val(data.volume);
                    body.find(".expire").prop("checked", data.expire.enable);
                    if(data.expire.enable){
                        body.find(".selectDate").show();
                        body.find(".beginDate").val(data.expire.beginDate);
                        body.find(".endDate").val(data.expire.endDate);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                    }                                                                                                                                                                                                                                                                                   
                    if(data.duration.enable){
                        body.find("input[name='taskType'][value='seconds']").prop("checked", true);
                        body.find(".seconds").val(formatSeconds(data.duration.seconds));

                        body.find(".seconds").prop("disabled", false);
                        body.find(".times").prop("disabled", true);
                        body.find(".seconds").css("background", "#fff");
                        body.find(".times").css("background", "#eee");
                        body.find(".seconds").removeClass("layui-disabled");
                        body.find(".times").addClass("layui-disabled");
                    }
                    if(data.loop.enable){
                        body.find("input[name='taskType'][value='times']").prop("checked", true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                        body.find(".times").val(data.loop.times);

                        body.find(".seconds").prop("disabled", true);
                        body.find(".times").prop("disabled", false);
                        body.find(".seconds").css("background", "#eee");
                        body.find(".times").css("background", "#fff");
                        body.find(".seconds").addClass("layui-disabled");
                        body.find(".times").removeClass("layui-disabled");
                    }
                    body.find(".startTimeOfDay").val(data.startTimeOfDay);
                    body.find(".enable").prop("checked", data.enable);
                    body.find("input[name='execMode'][value="+data.execMode+"]").prop("checked", true);
                    if(data.execMode == "EveryWeek"){
                        body.find(".selectDays").show();
                        body.find("input[name='weekDays']").prop('checked', false);
                        for(var i in data.weekDays){
                            body.find("input[name='weekDays'][value="+data.weekDays[i]+"]").prop('checked', true);
                        }
                    }
                    body.find(".deviceIds").val(data.deviceIds);
                    body.find(".fileIds").val(data.fileIds);
                    iframeWin.layui.form.render();
                },yes: function(index, layero){
                    var body = layui.layer.getChildFrame('body', index);
                    body.find(".saveTask").click();
                },end: function(){
                    dhWeb.onEditBCTask = function(msg){
                        onEditBCTask(msg);
                    };
                }
            })
        }else if(layEvent == "enable"){
            var enable = "";
            var taskType = "";
            var modeContent = "";
            if(data.loop.enable){
                taskType = "times";
                modeContent = data.loop.times;
            }else if(data.duration.enable){
                taskType = "seconds";
                modeContent = data.duration.seconds;
            }
            var enableText = "";
            if(data.enable){
                enableText = "确定禁用此任务";
                enable = false;
            }else{
                enableText = "确定启用此任务";
                enable = true;
            }
            layer.confirm( enableText,{icon:3, title:'提示信息'},function(index){
                dhWeb.editBCTask(requestId++, sessionStorage.getItem("loginHandle"), data.id, data.name, data.volume, data.deviceIds, data.fileIds,  enable, data.execMode, 
                                data.weekDays, data.startTimeOfDay, data.expire, taskType, modeContent );
                loadingIndex = layer.msg('正在提交，请稍候',{icon: 16,time:false,shade:0.8});
                setTimeout(function(){
                    if(loadingIndex > 0){
                        layer.close(loadingIndex);
                        loadingIndex = 0;
                        layer.msg("提交失败");
                    }	
                },10000);
            });
           
        }
    });
    dhWeb.onEditBCTask = function(msg){
        onEditBCTask(msg);
    };

    function onEditBCTask(msg){
        layer.close(loadingIndex);
        loadingIndex = 0;
        if(msg.error == "success"){
            parent.layer.msg("提交成功");
            dhWeb.getBCTaskList(requestId++, sessionStorage.getItem('loginHandle'));
        }else{
            layer.msg("提交失败");
        }
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    dhWeb.onGetBCTaskList = function(msg){
        if(msg.error == "success"){
            var tasks = msg.params.tasks;
            if(!tasks || tasks.length == 0) tasks = [];
            tableIns.reload({data: []}); //清空数据
            tableIns.reload({data: tasks});
        }
    }
    dhWeb.onDeleteBCTask = function(msg){
        layer.close(loadingIndex);
        loadingIndex = 0;
        if(msg.error == "success"){
            layer.msg("删除成功");
            dhWeb.getBCTaskList(requestId++, sessionStorage.getItem('loginHandle'));
        }else{
            layer.msg("删除失败");
        }
    }

    setTimeout(function(){
        dhWeb.getBCTaskList(requestId++, sessionStorage.getItem('loginHandle'));
    },1000)

    $(".addTask").on("click",function(){
        var docWidth = $(document).width();
        var width = docWidth > 1200 ? 1200 : docWidth - 80;
        layer.open({
            title : "添加任务",
            type : 2,
			area : [width+"px", "calc(100% - 40px)"],
			shade: 0,
            id: "taskOpe",
            content : "addBroadcastTask.html",
            btn: ['确定', '取消'],
            success : function(layero, index){
				var body = layui.layer.getChildFrame('body', index);
				var iframeWin = window[layero.find('iframe')[0]['name']];

            },yes: function(index, layero){
                var body = layui.layer.getChildFrame('body', index);
                body.find(".saveTask").click();
            },end: function(){
                dhWeb.onEditBCTask = function(msg){    //重新注册回调
                    onEditBCTask(msg);
                };
            }
        })
	});
    $(".mediaBtn").on("click",function(){
        var docWidth = $(document).width();
		var docHeight = $(document).height();
		var width = docWidth > 800 ? 800 : docWidth;
		var height = docHeight > 600 ? 600 : docHeight;
        layer.open({
            title : "媒体资源管理",
            type : 2,
			area : [width+"px", "calc(100% - 20px)"],
			// shade: 0,
            content : "mediaResource.html",
            success : function(layero, index){

            },cancel: function(index, layero){ 
                
			} 
        })
	});
  
    function formatSeconds(time){
        let hour = parseInt(time/3600) < 10 ? '0' + parseInt(time/3600) : parseInt(time/3600) ;
        let minite = parseInt(time/60%60) < 10 ? '0' + parseInt(time/60%60):parseInt(time/60%60);
        let seconds = time%60 < 10 ? '0' + time%60 : time%60;
        let  newTime = hour + ':' + minite + ':' + seconds;
        
        return newTime;
    }
   
}();