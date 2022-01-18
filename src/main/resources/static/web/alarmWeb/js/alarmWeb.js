var dhWeb = new DHAlarmWeb();
;!function(){
	  var layer = layui.layer
	  ,form = layui.form;

	//页面加载时判断左侧菜单是否显示
	//通过顶部菜单获取左侧菜单
	$(".topLevelMenus li,.mobileTopLevelMenus dd").click(function(){
		if($(this).parents(".mobileTopLevelMenus").length != "0"){
			$(".topLevelMenus li").eq($(this).index()).addClass("layui-this").siblings().removeClass("layui-this");
		}else{
			$(".mobileTopLevelMenus dd").eq($(this).index()).addClass("layui-this").siblings().removeClass("layui-this");
		}
		$(".layui-layout-admin").removeClass("showMenu");
        // $("body").addClass("site-mobile");
		var menu = $(this).data("menu");
		if(menu == "broadcast"){
			openRealtimeBC();
		}else if(menu == "timerBroadcast"){
			openTimerBC();
		}

	});
	//隐藏左侧导航
	$(".hideMenu").click(function(){
		if($(".topLevelMenus li.layui-this a").data("url")){
			layer.msg("此栏目状态下左侧菜单不可展开");  //主要为了避免左侧显示的内容与顶部菜单不匹配
			return false;
		}
		$(".layui-layout-admin").toggleClass("showMenu");
	})
	
	layer.config({
		extend: 'myskin/style.css' //同样需要加载新皮肤
	});

	//手机设备的简单适配
    $('.site-tree-mobile').on('click', function(){
		$('body').addClass('site-mobile');
	});
    $('.site-mobile-shade').on('click', function(){
		$('body').removeClass('site-mobile');
	});
	$(".notice").click(function(){
		// $(".layui-side-right").css("right", "0");
		layer.open({
		  type: 1, 
		  title: "待处理列表",
		  skin: ['layer-ext-myskin'],
		    // skin: 'layui-layer-nobg layer_bg',
		  offset: "rb",
		  area:["300px", "calc(100% - 50px)"],
		  shade: 0.1,
		  shadeClose: true,
		  content: "<div class='noticeLayer'>"+$(".noticeContent").html()+"</div>"
		});
	  });
	//关闭所有视频
	$(".closeAll").click(function(){
	   for(var i=0;i<$('video').length;i++){
			var id = $("video")[i].id;
			var deviceId = id.split("_")[1];
			dhWeb.stopRT(deviceId,sessionStorage.getItem('loginHandle'));
		}
		$(".playDiv").removeClass("anim-scaleSpring").addClass("anim-fadeout");
		setTimeout(function(){
			$(".playDiv").remove()
			$(".closeAll").hide();;
			setVideoSize();
		},1000);
	});
  $(".layui-side-right").click(function(){
	//$(".layui-side-right").css("right", "-260px");
  });

	
	var touchtime = new Date().getTime();
	var touchElement = "";
	
	//呼叫列表双击（兼容移动端没有dblclick）
    $(document).on("click", ".li_notify", function(){
		if( new Date().getTime() - touchtime < 500 && touchElement === this){
            var deviceId= $(this).attr("deviceid");
			playVideo(deviceId, true);
			layer.closeAll("page");
        }else{
            touchtime = new Date().getTime();
			touchElement = this;
        }
	});
	//设备列表双击
	$(document).on('click', '.deviceLi', function() { 
		if( new Date().getTime() - touchtime < 500 && touchElement === this){
            var deviceStatus = $(this).attr("deviceStatus");
			var deviceId = $(this).attr("deviceid");
			if(deviceStatus == "Offline"){
				layer.msg("设备离线，无法观看");
				return;
			}
			if(deviceStatus == "Dealing"){
				layer.msg("正在处理中，无法观看");
				return;
			}
			var callStaus = deviceStatus == "Start" ? true : false;
			playVideo(deviceId, callStaus);
        }else{
            touchtime = new Date().getTime();
			touchElement = this;
        }
	});
	//视频双击全屏
	$(document).on('click', '.videoboxDiv', function() { 
		if(new Date().getTime() - touchtime < 500 && touchElement === this){
            launchFullscreen($(this).parent(".playDiv")[0]);
        }else{
            touchtime = new Date().getTime();
			touchElement = this;
        }
	});
	
	//播放视频
	function playVideo(deviceId, callStatus){
		removeMusic();
		var deviceType = $(".deviceLi[deviceid="+deviceId+"]").attr("devicetype");
		var opeHtml = "";
		if(deviceType == "Alarm"){
			opeHtml = '<div class="operateDiv">'+
						'<button class="talk" title="对讲"></button>'+
						'<button class="unlock" title="开闸"></button>'+
						'<button class="locked" title="关闸"></button>'+
						'<button class="close" title="关闭"></button>'+
					'</div>';
		}else{
			opeHtml = '<div class="operateDiv">'+
						'<button class="close" title="关闭"></button>'+
					'</div>';
		}
		var html = '<div class="playDiv anim-scaleSpring" deviceid="'+deviceId+'">'+
						'<div class="videoboxDiv">'+
							'<video id="play_'+deviceId+'"></video><span>'+$(".deviceLi[deviceid='"+deviceId+"'] .deviceName").text()+'</span>'+
							'<img class="loading" src="images/loading.gif"/><img style="display:none;" class="micImg" src="./images/micmute.png"/>'+
						'</div>'+ opeHtml+
					'</div>';
		if(!$("#play_"+deviceId)[0]) $(".mainContent").append(html);
		if(callStatus) $(".playDiv[deviceid="+deviceId+"] .talk").addClass("talking");
		selectVideo($(".playDiv[deviceid="+deviceId+"] .videoboxDiv")); //选中该设备
		dhWeb.playDeviceAudio(deviceId);
		dhWeb.playRT($('#play_'+deviceId)[0],deviceId,sessionStorage.getItem('loginHandle'),callStatus);
		if(callStatus){
			 //播放联动设备
			var parentId = $(".deviceLi[deviceid="+deviceId+"]").attr('parentId');
			var groupDevices = $('li[parentId = '+parentId+']');
			for(var i =0; i<groupDevices.length;i++){
				var deviceId = $(groupDevices[i]).attr("deviceid");
				if($('#play_'+deviceId)[0]) continue;
				var deviceType = $(groupDevices[i]).attr("devicetype");
				var deviceStatus = $(groupDevices[i]).attr("devicestatus");
				if(deviceType == 'Alarm') continue;
				if(deviceStatus== 'Offline') continue;
				var html = '<div class="playDiv anim-scaleSpring" deviceid="'+deviceId+'">'+
								'<div class="videoboxDiv">'+
									'<video id="play_'+deviceId+'"></video><span>'+$(".deviceLi[deviceid='"+deviceId+"'] .deviceName").text()+'</span>'+
									'<img class="loading" src="images/loading.gif"/><img style="display:none;" class="micImg" src="./images/micmute.png"/>'+
								'</div>'+ 
								'<div class="operateDiv">'+
									'<button class="close" title="关闭"></button>'+
								'</div>'+
							'</div>';
				$('.mainContent').append(html);
				dhWeb.playRT($('#play_'+deviceId)[0],deviceId,sessionStorage.getItem('loginHandle'),false);
			}
	    }
		setVideoSize();	
	}
	
	$(".mainContent").resize(function(){
		setVideoSize();
	})
	//关闭
	$(document).on("click", ".playDiv .close", function(){
		var deviceId = $(this).parent().parent().attr("deviceid");
		dhWeb.stopRT(deviceId,sessionStorage.getItem('loginHandle'));
		$(this).parent().parent().removeClass("anim-scaleSpring").addClass("anim-fadeout");
		//切换默认设备
		if($(this).parent().parent().hasClass("selectVideo") && $("video").length > 1){
			selectVideo($(".selectVideo").siblings(":first").children(".videoboxDiv"));//选择第一个视频
		}
		var thisObj = $(this);
		setTimeout(function(){
			thisObj.parent().parent().remove();
			playMusic();
			setVideoSize();
		},1000);

		// saveData();
	});
	//对讲
	$(document).on("click", ".playDiv .talk",function(){
		selectVideo($(this).parent());
		if($(this).hasClass("talking")) return;
		$(this).addClass("talking");
		var deviceId = $(this).parent().parent().attr("deviceid");
		if($(this).parent().parent().hasClass("selectVideo")){
			dhWeb.startTalk(deviceId);
		}
	});
	//开闸
	$(document).on("click", ".playDiv .unlock",function(){
		var deviceId = $(this).parent().parent().attr("deviceid");
		dhWeb.doControl(deviceId,sessionStorage.getItem('loginHandle'),1);
		layer.msg("开闸成功",{
			offset: [$(this).offset().top - 100, $(this).offset().left - 40]
		});
	});
	//关闸
	$(document).on("click", ".playDiv .locked",function(){
		var deviceId = $(this).parent().parent().attr("deviceid");
		dhWeb.doControl(deviceId,sessionStorage.getItem('loginHandle'), 2);
		layer.msg("关闸成功",{
			offset: [$(this).offset().top - 100, $(this).offset().left - 40]
		});
	});
	$(document).on("click", ".videoboxDiv",function(){
		selectVideo(this);
	});
	
	
	var socketLoginCount = timeoutLoginCount = dataTimeoutCount = repeatLoginCount = 0;
	
	if(sessionStorage.getItem("dhUname")){
		$('#uname').val(sessionStorage.getItem("dhUname"));
	}else if(localStorage.getItem("dhUname")){
		$('#uname').val(localStorage.getItem("dhUname"));
	}
	if(sessionStorage.getItem("dhPwd")){
		$('#pwd').val(sessionStorage.getItem("dhPwd"));
	}else if(localStorage.getItem("dhPwd")){
		$('#pwd').val(localStorage.getItem("dhPwd"));
	}
	if(sessionStorage.getItem("dhServerIp")){
		$('#serverIp').val(sessionStorage.getItem("dhServerIp"));
	}else if(localStorage.getItem("dhServerIp")){
		$('#serverIp').val(localStorage.getItem("dhServerIp"));
	}
	if(sessionStorage.getItem("dhPort")){
		$('#port').val(sessionStorage.getItem("dhPort"));
	}else if(localStorage.getItem("dhPort")){
		$('#port').val(localStorage.getItem("dhPort"));
	}
	var loginIndex = 0;
	form.on('submit(loginForm)', function(data){
		loginIndex = top.layer.msg('正在登录，请稍候',{icon: 16,time:false,shade:0.8});
		login();
	 });
	 
	 var dhUname = sessionStorage.getItem("dhUname");
	 var dhPwd = sessionStorage.getItem("dhPwd");
	 var dhServerIp = sessionStorage.getItem("dhServerIp");
	 var dhPort = sessionStorage.getItem("dhPort");
	 if(sessionStorage.getItem('isLogin') === "true" && dhUname != "" && dhPwd != ""){
		 $('.loginDiv').hide();
		 $('.indexDiv').show();
		 $(".username").text(dhUname);
	 }else{
		$('.indexDiv').hide();
		$('.loginDiv').show();
	 }
	 //刷新重登
	// if (window.performance.navigation.type == 1){
		if(sessionStorage.getItem('isLogin') === "true" && sessionStorage.getItem("dhUname")!= "" && sessionStorage.getItem("dhPwd") != ""){
			login();
		}
	// }
	//退出登录
	$('.logout').click(function(){
		dhWeb.logout(sessionStorage.getItem('loginHandle'));
		sessionStorage.setItem('loginHandle',null);
		sessionStorage.setItem('isLogin',false);
		$(".closeAll").hide();
		$('.indexDiv').hide();
		$('.loginDiv').show();
		removeMusic();
		$(window).resize(); 
	});
	//刷新页面
	$('.refresh').click(function(){
		location.reload();
	});
	//回调处理
	dhWeb.onLogin = function(message){
		if(loginIndex > 0) {
			layer.close(loginIndex);
			loginIndex = 0;
		}
		onLogin(message);
		socketLoginCount = 0;
		timeoutLoginCount = 0;
	} 
	dhWeb.onDeviceList = function(message){
		dataTimeoutCount = 0;
		onDeviceList(message);
	} 
	dhWeb.onNotify = function(message){
		onNotify(message);
	} 
	dhWeb.onPlayRT = function(data){
		if(data.error != "success"){
			layer.msg("播放失败！" , {
				time: 5000,
				btn: ['知道了'],
				btnAlign: 'c'
			});
			$(".playDiv[deviceid="+data.params.deviceId+"] .close").click();
		}
	}
	function onLogin(data){
		var params = data.params;
		if(data.error == "success"){
			if(sessionStorage.getItem("dhUname") == "mainalc"){
				//超级账号登录
				location.href = "./systemCfg.html";
				return;
			}
			setState("在线");
			sessionStorage.setItem('loginHandle',params.loginHandle);
			sessionStorage.setItem('isLogin', true);
			$('.loginDiv').hide();
			$('.indexDiv').show();
			$(".username").text(sessionStorage.getItem("dhUname"));
			$(".device").html("");
			console.log("onLogin success");
		}else if(data.error == "repeat"){
			if(sessionStorage.setItem('isLogin') != "true"){
				layer.msg("账号重复登录");
				return;
			}
			repeatLoginCount++;
			if(repeatLoginCount > 5) {
				repeatLoginCount = 0;
				layer.msg("账号重复登录");
				setState("账号重复登录");
				return;
			}
			setTimeout(function(){
				login();
			},5000);
		}else if(data.error == "authfail"){
			layer.msg("账号或密码错误");
			setState("账号或密码错误");
		}else{
			layer.msg("登录失败");
			setState("登录失败");
		}
	}
	function onDeviceList(data){
		var deviceList = data.params.list;
		for(var i in deviceList){
			if($(".deviceLi[deviceid="+deviceList[i]['deviceId']+"]")[0]) return;
            var icon = getStatusIcon(deviceList[i]['action'], deviceList[i]['deviceType']);
			var deviceHtml = "<li class='layui-nav-item deviceLi' lay-unselect deviceid='"+deviceList[i]['deviceId']+"' parentid='"+deviceList[i]['parentId']
								+"' devicestatus='"+deviceList[i]['action']+"' devicetype='"+deviceList[i]['deviceType']+"'><a href='javascript:;'>"+
			"<img src='"+icon+"' alt='' class='statusImg'></img><cite class='deviceName'>"+deviceList[i]['deviceName']+"</cite></a></li>";
			$('.device').append(deviceHtml);
		}
		dataCount();
	
	}
	
	function onNotify(data){
		var params = data.params;
		if(params.code == "DeviceStatus"){
			var did = params.deviceId;
			$(".deviceLi[deviceid="+did+"]").attr("devicestatus",params.action);
			var icon = getStatusIcon(params.action, $(".deviceLi[deviceid="+did+"]").attr("deviceType"));
			$(".deviceLi[deviceid="+did+"] img").attr("src",icon);
			removeNotice(did);
			if(params.action == "Offline" || params.action == "Normal" ){
				if($("play_"+did)) $(".playDiv[deviceid="+did+"] .close").click(); //设备正在观看视频时自动挂断
			}else if(params.action == "Start"){
				var thStr = "<li class='li_notify' deviceid='"+did+"'>"+$(".deviceLi[deviceid='"+did+"'] .deviceName").text()+ "("+did+")</li>";
				$(".noticeContent,.noticeLayer").append(thStr);
				if($(".noticeLayer").length == 0)  $(".notice").click();
			}else if(params.action == "Dealing"){	
			}
			if((params.action == "Start" || $(".noticeContent .li_notify").length > 0) && $(".playDiv").length == 0){
				playMusic();
			}else{
				removeMusic();
			}
			$(".notice a span").remove();
			//通知列表
			if($(".noticeContent .li_notify").length > 0){
				$(".notice a").append("<span class='layui-badge layui-bg-red'>"+$(".noticeContent .li_notify").length+"</span> ");
			}
			dataCount();
		}
	
	}
	function removeNotice(deviceId){
		//移除呼叫通知类容
		$(".noticeContent .li_notify[deviceid="+deviceId+"]").remove();
		//移除呼叫弹出层
		$(".noticeLayer .li_notify[deviceid="+deviceId+"]").remove();
	}
	
	dhWeb.onParseMsgError = function(message){
		console.log(message);
		if(message.error.indexOf("alarmServer offline") != -1){
			setState("报警服务器不在线");
		}else{
			setState("坐席异常！");
		}
	} 
	dhWeb.onAlarmServerClosed = function(){
		console.log("onAlarmServerClosed");
		if(loginIndex > 0) {
			layer.close(loginIndex);
			loginIndex = 0;
			layer.msg("登录失败" , {
				time: false,
				btn: ['知道了'],
				btnAlign: 'c'
			});
		};
		$(".deviceLi li").attr("devicestatus", "Offline");
		$(".noticeLayer .li_notify").remove();
		$(".noticeContent .li_notify").remove();
		$(".notice a span").remove();
		socketLoginCount++;
		if(socketLoginCount > 1000) {
			socketLoginCount = 0;
			setState("服务器连接断开！");
			return;
		}
		if(sessionStorage.getItem('isLogin') === "true" ){
			setTimeout(function(){
				setState("正在重新登录...");
				login();
			},5000)
		}
		
	}
	dhWeb.onDHAlarmWebError = function(data){
		console.log(data);
		if(data.msg.error=="loginTimeout"){
			if(sessionStorage.getItem('isLogin') !== "true") {
				if(loginIndex > 0){
					layer.close(loginIndex);
					loginIndex = 0;
				}
				layer.msg("登录超时" , {
					time: false, //5s后自动关闭
					btn: ['知道了'],
					btnAlign: 'c'
				});
				return;
			}
			setState("登录超时");
			timeoutLoginCount++;
			if(timeoutLoginCount > 100) {
				timeoutLoginCount = 0;
				return;
			}
			setState("正在重新登录...");
			login();
		}else if(data.msg.error=="dataTimeout"){
			setState("数据获取超时或该账号无设备");
			setTimeout(function(){
				dataTimeoutCount++;
				if(timeoutLoginCount > 5) {
					dataTimeoutCount = 0;
					return;
				}
				setState("正在重新登录...");
				login();
			},5000)
		}
	}
	
	function selectVideo(thisObj){
		if($(thisObj).parent().hasClass("selectVideo")) return;
		var preDeviceId = 0; //上一个选中的deviceId
		if($(".selectVideo").find(".talking").length > 0){ //关闭前一个对讲
			preDeviceId = $(".selectVideo").attr("deviceid");
			dhWeb.stopTalk(preDeviceId);
		}
		$(".selectVideo").removeClass("selectVideo");
		$(thisObj).parent().addClass("selectVideo");
		//切换对讲设备
		var deviceId = $(thisObj).parent().attr("deviceid");
		dhWeb.playDeviceAudio(deviceId);
		if($(thisObj).parent().find(".talking").length > 0 && preDeviceId > 0){
			dhWeb.startTalk(deviceId);
		}
	}
	
	
	function login(){
		var uname = trim($('#uname').val());
		var pwd = trim($('#pwd').val());
		var ip = trim($('#serverIp').val());
		var port = trim($('#port').val());
		port = port == "" ? 8088 : port;
		dhWeb.setWebsocketPort({dataWsPort: port,mediaWsPort: port});
		dhWeb.login(uname, pwd, ip);
		sessionStorage.setItem("dhUname", uname);
		sessionStorage.setItem("dhPwd", pwd);
		sessionStorage.setItem("dhServerIp", ip);
		sessionStorage.setItem("dhPort", port);

		localStorage.setItem("dhUname", uname);
		localStorage.setItem("dhPwd", pwd);
		localStorage.setItem("dhServerIp", ip);
		localStorage.setItem("dhPort", port);
		setState("正在登录，请稍候");
	}
	
	//设置视频框宽和高
	function setVideoSize(){
		var videoDivWidth = $('.mainContent').width();
		var videoDivHeight = $('.mainContent').height();
		var videoCount = $('video').length;
		if(videoDivWidth >= 1080){
			if(videoCount == 1){
				$('.playDiv').width(videoDivWidth-100);
				$('.playDiv').height(videoDivHeight-100);
			}else if(videoCount == 2){
				$('.playDiv').width(videoDivWidth/2-100);
				$('.playDiv').height($('.playDiv').width()*9/16);
			}else if(videoCount > 2){
				if(videoDivWidth/videoDivHeight > 16/9){
					$('.playDiv').height(videoDivHeight/2 - 50);
					$('.playDiv').width($('.playDiv').height()*16/9);
				}else{
					$('.playDiv').width(videoDivWidth/2-100);
					$('.playDiv').height($('.playDiv').width()*9/16);
				}
				
			}
		}else if(videoDivWidth < 1080 && videoDivHeight <= 400){
			$('.playDiv').width(videoDivWidth-50);
			$('.playDiv').height(videoDivHeight-50);
		}else{
			if(videoCount == 1){
				$('.playDiv').width(videoDivWidth-50);
				$('.playDiv').height(videoDivHeight-100);
			}else{
				if(videoDivWidth/videoDivHeight > 9/16){
					$('.playDiv').height(videoDivHeight/2 - 50);
					$('.playDiv').width($('.playDiv').height()*16/9);
				}else{
					$('.playDiv').width(videoDivWidth-50);
					$('.playDiv').height($('.playDiv').width()*9/16);
				}
			}
			
		}
		
		if($("video").length >= 1){
			$(".closeAll").css({"display": "inline-block"});
		}else{
			$(".closeAll").hide();
		}
	}
	//進入全屏
	function launchFullscreen(element) 
	{
		if(isFullscreen()){
			exitFullscreen();
			return;
		}
		if(element.requestFullscreen) {
			element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.msRequestFullscreen){ 
			element.msRequestFullscreen(); 
		} else if(element.oRequestFullscreen){
			element.oRequestFullscreen();
		}else if(element.webkitRequestFullscreen){
			element.webkitRequestFullscreen(); 
		}
	}

	//退出全屏
	function exitFullscreen()
	{
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.oRequestFullscreen){
			document.oCancelFullScreen();
		}else if (document.webkitExitFullscreen){
			document.webkitExitFullscreen();
		}else{
			var docHtml = document.documentElement;
			var docBody = document.body;
			var videobox = document.getElementById('videobox');
			docHtml.style.cssText = "";
			docBody.style.cssText = "";
			videobox.style.cssText = "";
			document.IsFullScreen = false;
		}
	}
	function isFullscreen(){
		return document.fullscreenElement    ||
			   document.msFullscreenElement  ||
			   document.mozFullScreenElement ||
			   document.webkitFullscreenElement || false;
	}
	dhWeb.onDeviceVideoData = function(data, deviceId){
		$("#play_"+deviceId).siblings('.loading').hide();
	}
	//获取设备状态图标
	function getStatusIcon(action, type){
		var icon = "";
		if(type == "Alarm"){
			if(action == "Normal"){
				icon = "./images/alarm.Normal.png";
			}else if(action == "Offline"){
				icon = "./images/alarm.Offline.png";
			}else if(action == "Start"){
				icon = "./images/alarm.Start.png";
			}else if(action == "Dealing"){
				icon = "./images/alarm.Dealing.png";
			}
		}else{
			if(action == "Normal"){
				icon = "./images/linkage.Normal.png";
			}else if(action == "Offline"){
				icon = "./images/linkage.Offline.png";
			}else if(action == "Start"){
				icon = "./images/linkage.Start.png";
			}else if(action == "Dealing"){
				icon = "./images/linkage.Dealing.png";
			}
		}
		return icon;
	}
	function setState(str){
		$(".state b").text(str);
	}
	$(document).click(function(){
       if($('#callMusic')[0]){
			$('#callMusic')[0].play();
		}
    });
	//播放铃声
	function playMusic(){
		if($(".noticeContent .li_notify").length == 0 || $(".playDiv").length > 0) return;
		$('audio').remove(); 
		$('body').append('<audio id="callMusic" src="./raw/alarm.wav" autoplay hidden="true" loop="true"></audio>');
	}
	//移除播放
	function removeMusic(){
		$('audio').remove(); 
	}
	//数据统计
	function dataCount(){
		$(".totalCount").text($(".device").children("li").length);
		$(".onlineCount").text($(".device li[devicestatus!='Offline']").length);
	}
	function trim(s){
       return s.replace(/(^\s*)|(\s*$)/g, "");
	}

	// var victor = new Victor("container", "output");

	var granimInstance = new Granim({
		element: '#canvas',
		direction: 'diagonal', // 'diagonal', 'top-bottom', 'radial', 'left-right'
		isPausedWhenNotInView: true,
		opacity: [1, 1],
		stateTransitionSpeed: 200,
		states : {
			"default-state": {
				gradients: [
					['#0223DB', '#9EFC61'],
					['#5FA54E', '#56A9FC'],
					['#237D8D', '#9AB0FC']
				],
				transitionSpeed: 2000
			}
		}
	});
	$("#canvas").resize(function() {
		if(!granimInstance) return;
		granimInstance.setSizeAttributes();
	  });
	window.onerror = function (message, url, lineNo, columnNo, error){
		layer.closeAll();
		layer.msg("网页异常,异常信息："+message,{
				time: false,
				btn: ['知道了'],
				btnAlign: 'c'
			});
	}
	var broadcastIndex = 0;
	//实时广播
	function openRealtimeBC(){
		if(sessionStorage.getItem('isLogin') != "true"){
			layer.msg("请先登录");
			return;
		}
		var docWidth = $(document).width();
		var docHeight = $(document).height();
		var width = docWidth > 500 ? 500 : docWidth;
		var height = docHeight > 600 ? 600 : docHeight;
		if(broadcastIndex > 0) return;
		broadcastIndex = layer.open({
            title : "实时广播",
            type : 2,
			area : [width+"px",height+"px"],
			shade: 0,
            content : "broadcast.html",
			maxmin: true,
            success : function(layero, index){
				var body = layui.layer.getChildFrame('body', index);
				var iframeWin = window[layero.find('iframe')[0]['name']];
				$('.deviceLi[devicetype="Alarm"][devicestatus="Normal"]').each(function(i,val){
					body.find(".bcDevice").append('<li ><input type="checkbox" deviceid="'+$(this).attr("deviceid")+'" name="bcDevice" title='+$(this).text()+' lay-skin="primary"> </li>');
				});
				iframeWin.layui.form.render(); 
            },cancel: function(index, layero){ 
				var body = layui.layer.getChildFrame('body', index);
				if(body.find(".startBC").hasClass("layui-btn-disabled")){
					layer.msg("请先停止广播");
					return false;
				}
				layer.close(index);
				broadcastIndex = 0;
				return false; 
			}  
        })
	}
	//定时广播
	function openTimerBC(){
		if(sessionStorage.getItem('isLogin') != "true"){
			layer.msg("请先登录");
			return;
		}
		broadcastIndex = layer.open({
            title : "定时广播",
            type : 2,
			area : ["calc(100% - 10px)", "calc(100% - 10px)"],
            content : "timerBroadcast.html",
            success : function(layero, index){
				var body = layui.layer.getChildFrame('body', index);
				var iframeWin = window[layero.find('iframe')[0]['name']];
				
				iframeWin.layui.form.render(); 
            },cancel: function(index, layero){ 
				layer.close(index);
				broadcastIndex = 0;
				return false; 
			}  
        })
	}
}();
function getDhWeb() {
	return dhWeb;
}