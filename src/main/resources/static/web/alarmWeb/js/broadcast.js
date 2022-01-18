;!function(){
	var layer = layui.layer
	,form = layui.form;

	if(typeof parent.getDhWeb == "undefined"){
		location.href = "./alarmWeb.html";
		return;
	}
	var dhWeb = parent.getDhWeb();
	var deviceIds = [];
	var fielUrl;
	//开启广播
	$(".startBC").click(function(){
		if($(".startBC").hasClass("layui-btn-disabled")) return;
		deviceIds = [];
		$('input[name="bcDevice"]:checked').each(function(){  
		    deviceIds.push(parseInt($(this).attr("deviceid")));
		});

		if(deviceIds.length == 0){
			layer.msg("请选择设备");
			return;
		}
		var type = $('input[name="bcType"]:checked').val();
		if(type == 1){
			dhWeb.startBroadcast(sessionStorage.getItem('loginHandle'), deviceIds, 1);
		}else{
			var file = $(".audioFile").prop("files");
			if(file.length == ""){
				layer.msg("请选择音频文件");
				return;
			}
			if (window.createObjcectURL != undefined) { 
                fielUrl = window.createOjcectURL(file[0]); 
            } else if (window.URL != undefined) { 
                fielUrl = window.URL.createObjectURL(file[0]); 
            } else if (window.webkitURL != undefined) { 
                fielUrl = window.webkitURL.createObjectURL(file[0]); 
			}
			dhWeb.startBroadcast(sessionStorage.getItem('loginHandle'), deviceIds, 2,fielUrl);
		}
		$(".startBC").addClass("layui-btn-disabled");
		$(".stopBC").removeClass("layui-btn-disabled");
		$(".pauseBC").removeClass("layui-btn-disabled");
		$("input[name='bcType']").prop("disabled",true);
		$(".audioFile").prop("disabled",true);
		$(".disableBg").height($(".bcDevice").height());
		form.render();
	});

	//暂停广播
	$(".pauseBC").click(function(){
		if($(".pauseBC").hasClass("layui-btn-disabled")) return;
		if($(".pauseBC").hasClass("resumeBC")){
			$(".pauseBC").val("暂停播放");
			$(".pauseBC").removeClass("resumeBC");
			dhWeb.setBroadcastState("play");
		}else{
			$(".pauseBC").addClass("resumeBC");
			$(".pauseBC").val("继续播放");
			dhWeb.setBroadcastState("pause");
		}
		form.render();
		
	});
	
	//停止广播
	$(".stopBC").click(function(){
		if($(".stopBC").hasClass("layui-btn-disabled")) return;
		$(".startBC").removeClass("layui-btn-disabled");
		$(".stopBC").addClass("layui-btn-disabled");
		$(".pauseBC").addClass("layui-btn-disabled");
		$(".pauseBC").val("暂停播放");
		$(".pauseBC").removeClass("resumeBC");
		$("input[name='bcType']").prop("disabled",false);
		$(".audioFile").prop("disabled",false);
		$(".disableBg").height(0);
		form.render();
		if(deviceIds.length == 0) return;

		dhWeb.stopBroadcast(sessionStorage.getItem('loginHandle'));
		deviceIds = [];
	});
	$(".check").click(function(){
		if($('.check').prop('checked')){
			$('input[name="bcDevice"]').prop('checked',true);
		}else{
			$('input[name="bcDevice"]').prop('checked',false);
		}
	});
	form.on('checkbox(checkAll)', function(data){
		if(data.elem.checked){
			$('input[name="bcDevice"]').prop('checked',true);
		}else{
			$('input[name="bcDevice"]').prop('checked',false);
		}
		form.render();
	}); 
	form.on('radio(bcType)', function(data){
		if(data.value == 1){
			$(".audioFile").prop("disabled",true);
			$(".audition").addClass("layui-btn-disabled");
		}else{
			$(".audioFile").prop("disabled",false);
			$(".audition").removeClass("layui-btn-disabled");
		}
		form.render();
	}); 
	$(".audioFile").change(function(){
		var file = $(".audioFile").get(0).files;
		if(file.length == 0){
			$("#audio").attr("src", "");
			return;
		}
		var path = URL.createObjectURL(file[0]);
		$("#audio").attr("src", path);
	});
	$(".audition").click(function(){
		if($(".audition").hasClass("layui-btn-disabled")) return;
		if($("#audio").attr("src") == "" || $("#audio").attr("src") == undefined) return;
		var audio = document.getElementById("audio");
		if($(".audition").val() == "试听"){
			$(".audition").val("停止");
			audio.play();
		}else{
			$(".audition").val("试听");
			audio.pause();
		}

	});
	dhWeb.onPlayAudioFileEnd = function(){
		layer.msg("文件播放结束", {time:false,btn: ['知道了'],btnAlign: 'c'});
		setTimeout(function(){
			// dhWeb.updateBroadcastFile(fielUrl); //继续播放下一文件
		},500)
	}
	dhWeb.onStartBroadcast = function(msg){
		if(msg.error == "success"){
			layer.msg("广播开启成功");
		}else{
			layer.msg("广播开启失败");
		}
		
	}

	dhWeb.onBroadcastWsClosed = function(e){
		if(e.code !== 1000){
			layer.msg("广播异常关闭", {time:false,btn: ['知道了'],btnAlign: 'c'});
		}
	}
}();

