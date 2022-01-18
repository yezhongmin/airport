
layui.use(['form','laydate','layer'], function () {
	var layer = layui.layer
	,form = layui.form,
  laydate = layui.laydate;
  
  if(typeof parent.parent.getDhWeb == "undefined"){
    location.href = "./alarmWeb.html";
    return;
  }
  var dhWeb = parent.parent.getDhWeb();
  var requestId = 1000;

  form.on('checkbox(expire)', function(data){
    if(data.elem.checked){
        $(".selectDate").show();
    }else{
        $(".selectDate").hide();
    }
  }); 
  form.on('radio(execMode)', function(data){
      if(data.value == "EveryWeek"){
          $(".selectDays").show();
      }else{
          $(".selectDays").hide();
      }
  });
  //任务类型切换 //次数times 时长seconds
  form.on('radio(taskType)', function(data){
    if(data.value == "seconds"){
        $(".seconds").prop("disabled", false);
        $(".times").prop("disabled", true);
        $(".seconds").css("background", "#fff");
        $(".times").css("background", "#eee");
        $(".seconds").removeClass("layui-disabled");
        $(".times").addClass("layui-disabled");
    }else{
        $(".seconds").prop("disabled", true);
        $(".times").prop("disabled", false);
        $(".seconds").css("background", "#eee");
        $(".times").css("background", "#fff");
        $(".seconds").addClass("layui-disabled");
        $(".times").removeClass("layui-disabled");
    }
  });  
  var loadingIndex = 0;
  $(".saveTask").on("click",function(){
      var taskId = $(".taskId").val();
      var taskName = $(".taskName").val();
      var volume = $(".volume").val();
      var expireEnable = $(".expire").prop("checked");
      var beginDate = $(".beginDate").val();
      var endDate = $(".endDate").val();
      var taskType = $("input[name='taskType']:checked").val();
      var seconds = $(".seconds").val();
      var time = seconds.split(":");
      seconds = parseInt(time[0]*60*60) + parseInt(time[1]*60) + parseInt(time[2]); //时间格式转为秒
      var times = $(".times").val();
      var startTimeOfDay = $(".startTimeOfDay").val();
      var execMode = $("input[name='execMode']:checked").val();
      var weekDay = [], expireObj = {}, modeContent = "";
      var enable = $(".enable").prop("checked");
      $('input[name="weekDays"]:checked').each(function(){
          weekDay.push($(this).val());
      });
      if(!taskName){
          layer.msg("请输入任务名称");
          return false;
      }
      if(!volume){
        layer.msg("请输入音量");
        return false;
     }
      if(expireEnable){
          if(!beginDate){
            layer.msg("请输入开始日期");
            return false;
          }
          if(!endDate){
            layer.msg("请输入结束日期");
            return false;
          }
          if(beginDate > endDate){
            layer.msg("请输入合法的日期范围");
            return false;
          }
          expireObj.enable = true;
          expireObj.beginDate = beginDate;
          expireObj.endDate = endDate;
      }else{
          expireObj.enable = false;
          expireObj.beginDate = "";
          expireObj.endDate = "";
      }
      if(taskType == "seconds"){
          if(!seconds){
            layer.msg("请输入任务时长");
            return false;
          }
          modeContent = seconds;
      }
      if(taskType == "times"){
        if(!times){
          layer.msg("请输入任务次数");
          return false;
        }
        modeContent = times;
      }
      if(!startTimeOfDay){
        layer.msg("请输入启动时间");
        return false;
      }
      if(execMode == "EveryWeek" && weekDay.length == 0){
          layer.msg("请选择周几播放任务");
          return false;
      }
      var deviceIds =  $('#deviceTree').jstree(true).get_selected();
      deviceIds = deviceIds.filter(function(item) {
         //过滤顶级节点
        return item != "devicetop";
      });
      if(deviceIds.length == 0 ){
        layer.msg("请选择设备");
        return false;
      }
      var fileIds =  [];
      for (var i = 0; i < $(".selectedData li").length; i++) {
        fileIds.push( $($(".selectedData li")[i]).attr("fileId"));
      }

      if(fileIds.length == 0 ){
          layer.msg("请选择音频文件");
          return false;
      }
      if(taskId > 0){
        dhWeb.editBCTask(requestId++, sessionStorage.getItem("loginHandle"), taskId, taskName, volume, deviceIds, fileIds,  enable, execMode, weekDay, startTimeOfDay, expireObj, taskType, modeContent );
      }else{
        dhWeb.uploadBCTask(requestId++, sessionStorage.getItem("loginHandle"), taskName, volume, deviceIds, fileIds,  enable, execMode, weekDay, startTimeOfDay, expireObj, taskType, modeContent );
      }
      loadingIndex = layer.msg('正在上传，请稍候',{icon: 16,time:false,shade:0.8});
      setTimeout(function(){
        if(loadingIndex > 0){
          layer.close(loadingIndex);
          loadingIndex = 0;
          layer.msg("上传失败");
        }	
      },10000);

     return false;
  });

  dhWeb.onGetAudioFileList = function(msg){
    if(msg.error == "success"){
      var files = msg.params.files;
      if(!files || files.length == 0) files = [];
      var selFileIds = $(".fileIds").val().split(",");
      var seletedDataDomArr = new Array(selFileIds.length),unseletDataDom = "";
        for(var i=0; i< files.length; i++){
          var index = selFileIds.indexOf(files[i].id+""); 
          if(index > -1){
            var dom = '<li fileId='+files[i].id+'><i class="layui-icon layui-icon-list dragIcon"></i>'+files[i].name+'</li>';
            seletedDataDomArr.splice(index, 1 ,dom); //按数组顺序替换空数组
          }else{
            unseletDataDom += '<li fileId='+files[i].id+'><i class="layui-icon layui-icon-list dragIcon"></i>'+files[i].name+'</li>';
          }
      }
      for(var i in seletedDataDomArr){
        $(".selectedData").append(seletedDataDomArr[i]);
      }
      $(".unselectData").append(unseletDataDom);
    }
  }

  $(document).on("click", ".selectedData li",function(){
      $(this).remove();
      $(".unselectData").append(this);
  });

  $(document).on("click", ".unselectData li",function(){
    $(this).remove();
    $(".selectedData").append(this);
});

  //添加任务回应
  dhWeb.onUploadBCTask = function(msg){
    layer.close(loadingIndex);
    loadingIndex = 0;
    if(msg.error == "success"){
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭 
        parent.layer.msg("添加成功");
        dhWeb.getBCTaskList(requestId++, sessionStorage.getItem('loginHandle'));
    }else{
        layer.msg("添加失败");
    }
  }
  //修改广播任务回应
  dhWeb.onEditBCTask = function(msg){
    layer.close(loadingIndex);
    loadingIndex = 0;
    if(msg.error == "success"){
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭 
        parent.layer.msg("修改成功");
        dhWeb.getBCTaskList(requestId++, sessionStorage.getItem('loginHandle'));
    }else{
        layer.msg("修改失败");
    }
  }

  setTimeout(function(){
      dhWeb.getAudioFileList(requestId++, sessionStorage.getItem('loginHandle'));
  },1000);

  //设备列表tree
  $('#deviceTree').jstree({
    "core" : {
    "animation" : 0,
    "check_callback" : true,
    "themes" : { "stripes" : true},
    "data" : [{"id" : "devicetop", "parent" : "#", "text" : "设备列表",icon: "", "state" : {"opened" : true,"selected": false},"type": "top"}],
    },
    "types" : {
    "#" : {
      "max_children" : 1,
      "max_depth" : 2,
      "valid_children" : ["top"]
    },
    "top" : {
      "valid_children" : ["device"]
    }
  },
  "plugins" : ["types", "sort","wholerow", "checkbox"]
  }).on("loaded.jstree", function (e, data) {
    var deviceRef = $("#deviceTree").jstree(true);
    var deviceData =  deviceRef.get_json("#", {"flat": true});
    parent.parent.$('.deviceLi[devicetype="Alarm"]').each(function(i,val){
        var treeNode = {};
        treeNode.id = $(this).attr("deviceid");
        treeNode.text = $(this).text();
        treeNode.parent = "devicetop";
        treeNode.type = "device";
        treeNode.icon = "images/alarm.Normal_16.png";
        treeNode.state = {"opened" : false};
        if(!deviceRef.get_node($(this).attr("deviceid"))){
            deviceData.push(treeNode);
        }
    });
    deviceRef.settings.core.data = deviceData;
    deviceRef.refresh();
  }).on("refresh.jstree", function (e, data) {
      var selDeviceIds = $(".deviceIds").val().split(",");
      data.instance.select_node(selDeviceIds);
  });

    //音频文件拖动排序
    var ops = {
        animation: 1000,
        group: {name: "file", pull: true, put: false},
        //拖动结束
        onEnd: function (evt) {
        },
    };
    Sortable.create($(".selectedData")[0], ops);
    

    jeDate(".beginDate",{
      format:"YYYY-MM-DD",
      isTime:false,
    })
    jeDate(".endDate",{
      format:"YYYY-MM-DD",
      isTime:false,
    })
    jeDate(".startTimeOfDay",{
      format:"hh:mm:ss",
      isTime:true,
    })
    jeDate(".seconds",{
      format:"hh:mm:ss",
      isTime:true,
    })

})