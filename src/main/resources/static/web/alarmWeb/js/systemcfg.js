;!function(){
	  var layer = layui.layer
	  ,form = layui.form;
	  
	  //手机设备的简单适配
    $('.site-tree-mobile').on('click', function(){
		$('body').addClass('site-mobile');
	});
    $('.site-mobile-shade').on('click', function(){
		$('body').removeClass('site-mobile');
	});
	
	var requestId = 10000;
	
	var dhWeb = new DHAlarmWeb();
	var dhUname = sessionStorage.getItem("dhUname");
	var dhPwd = sessionStorage.getItem("dhPwd");
	var dhServerIp = sessionStorage.getItem("dhServerIp");
	var dhPort = sessionStorage.getItem("dhPort");
	if(dhUname !="" && dhPwd != "" && dhServerIp != "" && dhPort != "" && dhUname == "mainalc"){
		 dhWeb.setWebsocketPort({dataWsPort: dhPort,mediaWsPort: dhPort});
		 dhWeb.login(dhUname, dhPwd, dhServerIp);
	}else{
		location.href = "./alarmWeb.html";
		return;
	}
	dhWeb.onDHAlarmWebError = function(data){
		if(data.msg.error=="loginTimeout"){
			layer.msg("登录超时,请重新登录！" , {
				time: false, 
				btn: ['知道了'],
				btnAlign: 'c'
			});
		}else if(data.msg.error=="dataTimeout"){
		}
	}
	dhWeb.onAlarmServerClosed = function(){
		layer.msg("服务器连接断开,请重新登录！" , {
			time: false, 
			btn: ['知道了'],
			btnAlign: 'c'
		});
		
	}
	dhWeb.onLogin = function(data){
		var params = data.params;
		if(data.error == "success"){
			sessionStorage.setItem('loginHandle',params.loginHandle);
			requestId++;
			dhWeb.getUsers(requestId,params.loginHandle);
		}else if(data.error == "authfail"){
			layer.msg("登录账号或密码错误！" , {
				time: false, 
				btn: ['知道了'],
				btnAlign: 'c'
			});
		}else{
			layer.msg("登录失败,请重新登录" , {
				time: false, 
				btn: ['知道了'],
				btnAlign: 'c'
			});
		}
	} 
	dhWeb.onGroupList = function(data){
		var groupList = data.params.list;
		 showGroupTree(groupList);
	}
	dhWeb.onDeviceList = function(data){
		var deviceList = data.params.list;
		showDeviceTree(deviceList);
		dataCount();
	}
	dhWeb.onNotify = function(data){
		var params = data.params;
		if(params.code == "DeviceStatus"){
			var did = params.deviceId;
			var action = params.action; //Offline Normal Start Dealing
			var type = $("#devicetree").jstree(true).get_type(did);
			if(action == "Offline"){
				$("#devicetree").jstree(true).get_node(data.params.deviceId).li_attr.status = 'Offline';
				$("#"+data.params.deviceId).attr("status", "Offline");
				if(type == "Alarm"){
					$("#devicetree").jstree(true).set_icon(did, "images/alarm.Offline_16.png");
				}else{
					$("#devicetree").jstree(true).set_icon(did, "images/linkage.Offline_16.png");
				}
			}else if(action == "Normal"){
				$("#devicetree").jstree(true).get_node(data.params.deviceId).li_attr.status = 'Normal';
				$("#"+data.params.deviceId).attr("status", "Normal");
				if(type == "Alarm"){
					$("#devicetree").jstree(true).set_icon(did, "images/alarm.Normal_16.png");
				}else{
					$("#devicetree").jstree(true).set_icon(did, "images/linkage.Normal_16.png");
				}
			}else if(action == "Start"){
				$("#devicetree").jstree(true).get_node(data.params.deviceId).li_attr.status = 'Start';
				$("#"+data.params.deviceId).attr("status", "Start");
				if(type == "Alarm"){
					$("#devicetree").jstree(true).set_icon(did, "images/alarm.Start_16.png");
				}else{
					$("#devicetree").jstree(true).set_icon(did, "images/linkage.Start_16.png");
				}
			}else if(action == "Dealing"){
				$("#devicetree").jstree(true).get_node(data.params.deviceId).li_attr.status = 'Dealing';
				$("#"+data.params.deviceId).attr("status", "Dealing");
				if(type == "Alarm"){
					$("#devicetree").jstree(true).set_icon(did, "images/alarm.Dealing_16.png");
				}else{
					$("#devicetree").jstree(true).set_icon(did, "images/linkage.Dealing_16.png");
				}
			}
			dataCount();
		}
	
	}
	var userGroup_uids = []; //待获取分组的用户ID
	dhWeb.onUserList = function(data){
		var userList = data.params.list;
		for(var i=0;i< userList.length;i++){
			if(userGroup_uids.indexOf(userList[i].userId) == -1){
				userGroup_uids.push(userList[i].userId);
			}
		}
		showUserTree(userList);
		//获取用户分组,当前用户获取成功后再获取下一用户
		getNextUserGroups();
	}
	//用户分组回调
	dhWeb.onUserGroups = function(data){
		showUserGroupTree(data.params);
		getNextUserGroups();
	}
	//获取下个用户分组列表
	function getNextUserGroups(){
		if(userGroup_uids.length > 0){
			requestId++;
			var uid = userGroup_uids.splice(0,1);
			dhWeb.getUserGroups(requestId, sessionStorage.getItem('loginHandle'), uid[0]);
		}
	}
	//退出登录
	$('.logout').click(function(){
		dhWeb.logout(sessionStorage.getItem('loginHandle'));
		sessionStorage.setItem('loginHandle',null);
		window.location.href = "./alarmWeb.html";
	});
	$('#grouptree').jstree({
			  "core" : {
				"animation" : 0,
				"check_callback" : true,
				"multiple": false,
				"themes" : { "stripes" : true},
				"data" : [{"id" : "grouptop", "parent" : "#", "text" : "顶级分组",icon: "", "state" : {"opened" : true,"selected": true},"type": "top"}],
			  },
			  "types" : {
				"#" : {
				  "max_children" : 1,
				  "max_depth" : 5,
				  "valid_children" : ["top"]
				},
				"top" : {
				  "valid_children" : ["normal","linkage","defense"]
				},
				"normal" : {
				  "icon" : "images/ngroup.png",
				  "valid_children" : ["normal","linkage","defense"]
				},
				"linkage" : {
				  "icon" : "images/lgroup.png",
				  "valid_children" : []
				},
				"defense" : {
				  "icon" : "images/defense.png",
				 "valid_children" : []
				}	
			  },
			  "contextmenu":{
					select_node:false,
					show_at_node:true,
					items : function (o, cb) {
						var items = {
							create :{  
								"label":"新建菜单",  
								"icon": "glyphicon glyphicon-plus",
								"action":function(data){
									var inst = $.jstree.reference(data.reference),
									// obj = inst.get_selected(true);
									obj = inst.get_node(data.reference);
									console.log(obj);
								}
							},
							update:{
								"separator_before"	: false,
								"separator_after"	: false,
								"_disabled"			: false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
								"label"				: "修改设备",
								"icon"				: "glyphicon glyphicon-leaf",
								"action"			: function (data) {
									var inst = $.jstree.reference(data.reference),
									obj = inst.get_node(data.reference);
									console.log(obj);
									
								}
							}
						}
						return items;
					}
				},
			  "plugins" : ["state", "types", "sort","wholerow"]
			}).on("changed.jstree", function (e, data) {
					if(data.selected.length) {
						var selectObj = data.instance.get_node(data.selected[0]);
						if(selectObj.type == "top"){
							$(".addGroup").show();
							$(".updateGroup,.delGroup").hide();
							$(".groupId").val(0);
							$(".groupType input[value=normal]").prop("checked", true);
							$(".groupType input[name=group]").prop("disabled", false);
							$(".groupName,.groupContact,.groupPhone").val("");
						}else{
							$(".addGroup").hide();
							$(".updateGroup,.delGroup").show();
							$(".groupId").val(selectObj.data.groupId);
							$(".groupType input[value="+selectObj.data.groupType+"]").prop("checked", true);
							$(".groupType input[name=group]").prop("disabled", true);
							$(".groupName").val(selectObj.data.groupName);
							$(".groupContact").val(selectObj.data.groupContact);
							$(".groupPhone").val(selectObj.data.groupPhone);
						}
						form.render();
					}
			});
			
	function showGroupTree(groupList){
		var groupref = $("#grouptree").jstree(true);
		var deviceref = $("#devicetree").jstree(true);
		for(var i=0;i< groupList.length;i++){
			var treeNode = {};
			treeNode.id = groupList[i].groupId;
			treeNode.text = groupList[i].groupName;
			treeNode.parent = groupList[i].parentId == 0 ? "grouptop" : groupList[i].parentId;
			treeNode.type = groupList[i].groupType;
			treeNode.state = {"opened": true};
			treeNode.data = groupList[i];
			if(groupref.get_node(groupList[i].groupId)){
				groupref.delete_node(groupList[i].groupId);
			}
			groupref.create_node(treeNode.parent, treeNode);
			if(deviceref.get_node(groupList[i].groupId)){
				deviceref.rename_node(groupList[i].groupId, groupList[i].groupName);//重命名节点
				deviceref.get_node(groupList[i].groupId).data.groupName = groupList[i].groupName;
				continue;
			}
			treeNode.parent = groupList[i].parentId == 0 ? "devicetop" : groupList[i].parentId;
			deviceref.create_node(treeNode.parent, treeNode);
			
		}

	}

	var loadingIndex = 0;
	form.on('submit(addGroup)', function(data){
		requestId++;
		var groupType = $('input:radio[name="group"]:checked').val();
		var groupName = trim($(".groupName").val());
		var groupContact = trim($(".groupContact").val());
		var groupPhone = trim($(".groupPhone").val());
		var loginHandle = sessionStorage.getItem("loginHandle");
		dhWeb.addGroup(requestId,loginHandle, groupType, groupName, groupContact, groupPhone);
		loadingIndex = layer.msg('正在添加，请稍候',{icon: 16,time:false,shade:0.8});
		setTimeout(function(){
			if(loadingIndex > 0){
				layer.close(loadingIndex);
				loadingIndex = 0;
				layer.msg("添加失败");
			}	
		},10000);
		return false;
	});
	form.on('submit(updateGroup)', function(data){
		requestId++;
		var selectObj = $("#grouptree").jstree(true).get_selected(true);
		if(selectObj.length == 0){
			layer.msg("请先选择分组！");
			return false;
		}
		var groupId = selectObj[0].id;
		var groupName = trim($(".groupName").val());
		var groupContact = trim($(".groupContact").val());
		var groupPhone = trim($(".groupPhone").val());
		dhWeb.editGroup(requestId, sessionStorage.getItem("loginHandle"), groupId, groupName, groupContact, groupPhone);
		loadingIndex = layer.msg('正在修改，请稍候',{icon: 16,time:false,shade:0.8});
		setTimeout(function(){
			if(loadingIndex > 0){
				layer.msg("修改失败");
				layer.close(loadingIndex);
				loadingIndex = 0;
			}
		},10000);
		return false;
	});
	$(".delGroup").click(function(){
		layer.confirm('确定要删除分组?', {icon: 3, title:'提示'}, function(index){
			requestId++;
			var selectObj = $("#grouptree").jstree(true).get_selected(true);
			if(selectObj.length == 0){
				layer.msg("请先选择分组！");
				return false;
			}
			var groupId = selectObj[0].id;
			dhWeb.delGroup(requestId, sessionStorage.getItem("loginHandle"), groupId);
			loadingIndex = layer.msg('正在删除，请稍候',{icon: 16,time:false,shade:0.8});
			setTimeout(function(){
				if(loadingIndex > 0){
					layer.msg("删除失败");
					layer.close(loadingIndex);
					loadingIndex = 0;
				}
			},10000);
			layer.close(index);
		});
	});
	dhWeb.onAddGroup = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.msg("添加成功");
		}else{
			layer.msg("添加失败");
		}
		
	}
	dhWeb.onEditGroup = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		var groupref = $("#grouptree").jstree(true);
		var userref = $("#usertree").jstree(true);
		var deviceref = $("#devicetree").jstree(true);
		loadingIndex = 0;
		if(data.error == "success"){
			//重置分组配置页面分组名称
			groupref.rename_node(data.params.groupId, data.params.groupName);
			groupref.get_node(data.params.groupId).data.groupName = data.params.groupName;
			//重置用户配置页面分组名称
			var usertreeJson = userref.get_json("usertop");
			for(var i = 0; i < usertreeJson.children.length; i++){
				var id = usertreeJson.children[i].id + "_" + data.params.groupId;
				userref.rename_node(id, data.params.groupName);
			}
			//重置设备配置页面分组名称
			deviceref.rename_node(data.params.groupId, data.params.groupName);
			deviceref.get_node(data.params.groupId).data.groupName = data.params.groupName;
			layer.msg("修改成功");
		}else{
			layer.msg("修改失败");
		}
	}
	dhWeb.onDelGroup = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.msg("删除成功");
			var groupId = data.params.groupId;
			$("#grouptree").jstree(true).delete_node(groupId);
			var usertreeJson = $("#usertree").jstree(true).get_json("usertop");
			for(var i = 0; i < usertreeJson.children.length; i++){
				var id = usertreeJson.children[i].id + "_" + data.params.groupId;
				$("#usertree").jstree(true).delete_node(id);
			}
			$("#devicetree").jstree(true).delete_node(groupId);
		}else{
			layer.msg("删除失败");
		}
	}
	
	
	//用户配置
	$('#usertree').jstree({
		  "core" : {
			"animation" : 0,
			"check_callback" : true,
			"multiple": false,
			"themes" : { "stripes" : true },
			'data' : [{"id" : "usertop", "parent" : "#", "text" : "远程账号",icon: "", "state" : {"opened" : true, "selected": true},"type": "top"}]
		  },
		  "types" : {
			"#" : {
			  "max_children" : 1,
			  "max_depth" : 3,
			  "valid_children" : ["top"]
			},
			"top" : {
			  "valid_children" : ["user"]
			},
			"user" : {
			  "icon" : "images/user.png",
			  "valid_children" : ["normal","linkage","defense"]
			},
			"normal" : {
			  "icon" : "images/ngroup.png",
			  "valid_children" : []
			},
			"linkage" : {
			  "icon" : "images/lgroup.png",
			  "valid_children" : []
			},
			"defense" : {
			   "icon" : "images/defense.png",
			 "valid_children" : []
			}
		  },

		  "plugins" : [
			  "state", "types","sort","wholerow"
		  ]
	}).on("changed.jstree", function (e, data) {
		if(data.selected.length) {
			var selectObj = data.instance.get_node(data.selected[0]);
			$(".userName,.password,.verifyPwd").val("");
			$(".userName,.password,.verifyPwd").attr("disabled", false);
			$(".userId").val(0);
			if(selectObj.type == "top"){
				$(".addUser").show();
				$(".editPwd,.delUser,.authorizeGroup").hide();
			}else if(selectObj.type == "user"){
				$(".addUser").hide();
				$(".editPwd,.delUser,.authorizeGroup").show();
				$(".userName").attr("disabled", true);
				$(".userName").val(selectObj.data.userName);
				$(".userId").val(selectObj.data.userId);
			}else{
				$(".userName,.password,.verifyPwd").attr("disabled", true);
				data.instance.deselect_node(selectObj);
				$(".addUser,.editPwd,.delUser,.authorizeGroup").hide();
				layer.msg("请选择用户！");
			}
			form.render();
		}
	});
	
	function showUserTree(userList){
		var ref = $("#usertree").jstree(true);
		for(var i=0;i< userList.length;i++){
			var treeNode = {};
			treeNode.id = userList[i].userId;
			treeNode.text = userList[i].userName;
			treeNode.parent = "usertop";
			treeNode.type = "user";
			treeNode.icon = "images/user.png";
			treeNode.data = userList[i];
			treeNode.state = {"opened" : false};
			if(ref.get_node(userList[i].groupId)){
				// ref.delete_node(userList[i].groupId);
				continue;
			}
			ref.create_node(treeNode.parent, treeNode);
		}	
	}
	function showUserGroupTree(data){
		var usertree = $("#usertree").jstree(true);
		var grouptree = $("#grouptree").jstree(true);
		var userId = data.userId;
		//删除原先用户分组
		usertree.delete_node(usertree.get_node(userId).children);
		//添加新分组
		for(var i=0;i< data.groupIds.length;i++){
			var groupId = data.groupIds[i];
			var groupData = grouptree.get_node(groupId).data;
			if(!groupData) continue;
			var treeNode = {};
			treeNode.parent = userId;
			treeNode.id = userId+"_"+groupId;
			treeNode.type = groupData.groupType;
			treeNode.text = groupData.groupName;
			
			if(!usertree.get_node(treeNode.id)){
				usertree.delete_node(treeNode.id);
			}
			usertree.create_node(treeNode.parent, treeNode);
		}
		
	}
	
	form.on('submit(addUser)', function(data){
		requestId++;
		var userName = trim($(".userName").val());
		var password = trim($(".password").val());
		var verifyPwd = trim($(".verifyPwd").val());
		if(userName == ""){
			layer.msg("用户名称不能为空！");
			return false;
		}
		if(password == ""){
			layer.msg("密码不能为空！");
			return false;
		}
		if(verifyPwd == ""){
			layer.msg("确认密码不能为空！");
			return false;
		}
		if(password != verifyPwd){
			layer.msg("两次密码不相同！");
			return false;
		}
		
		dhWeb.addUser(requestId, sessionStorage.getItem("loginHandle"), userName, password);
		loadingIndex = layer.msg('正在添加，请稍候',{icon: 16,time:false,shade:0.8});
		setTimeout(function(){
			if(loadingIndex > 0){
				loadingIndex = 0;
				layer.msg("添加失败");
				layer.close(loadingIndex);
			}
		},10000);
		return false;
	});
	form.on('submit(editPwd)', function(data){
		var selectObj = $("#usertree").jstree(true).get_selected(true);
		if(selectObj.length == 0){
			layer.msg("请先选择用户！");
			return false;
		}
		var userId = selectObj[0].id;
		var password = trim($(".password").val());
		var verifyPwd = trim($(".verifyPwd").val());
		if(password == ""){
			layer.msg("密码不能为空！");
			return false;
		}
		if(verifyPwd == ""){
			layer.msg("确认密码不能为空！");
			return false;
		}
		if(password != verifyPwd){
			layer.msg("两次密码不相同！");
			return false;
		}
		requestId++;
		dhWeb.editPassword(requestId, sessionStorage.getItem("loginHandle"), userId, password);
		loadingIndex = layer.msg('正在修改，请稍候',{icon: 16,time:false,shade:0.8});
		setTimeout(function(){
			if(loadingIndex > 0){
				loadingIndex = 0;
				layer.msg("修改失败");
				layer.close(loadingIndex);
			}
		},10000);
		return false;
	});
	$(".delUser").click(function(){
		layer.confirm('确定要删除改用户?', {icon: 3, title:'提示'}, function(index){
			var selectObj = $("#usertree").jstree(true).get_selected(true);
			if(selectObj.length == 0){
				layer.msg("请先选择用户！");
				return false;
			}
			var userId = selectObj[0].id;
			requestId++;
			dhWeb.delUser(requestId, sessionStorage.getItem("loginHandle"), userId);
			loadingIndex = layer.msg('正在删除，请稍候',{icon: 16,time:false,shade:0.8});
			setTimeout(function(){
				if(loadingIndex > 0){
					loadingIndex = 0;
					layer.msg("删除失败");
					layer.close(loadingIndex);
				}
			},10000);
			layer.close(index);
		});
		
	});
	dhWeb.onAddUser = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		var userref = $("#usertree").jstree(true);;
		loadingIndex = 0;
		if(data.error == "success"){
			var treeNode = {};
			treeNode.id = data.params.userId;
			treeNode.text = data.params.userName;
			treeNode.parent = "usertop";
			treeNode.type = "user";
			treeNode.icon = "images/user.png";
			treeNode.data =  data.params;
			treeNode.state = {"opened" : true};
			userref.create_node(treeNode.parent, treeNode);
			layer.msg("添加成功");
		}else{
			layer.msg("添加失败");
		}
		
	}
	dhWeb.onEditPassword = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.msg("修改成功");
		}else{
			layer.msg("修改失败");
		}
		
	}
	dhWeb.onDelUser = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.msg("删除成功");
			var userId = data.params.userId;
			$("#usertree").jstree(true).delete_node(userId);
		}else{
			layer.msg("删除失败");
		}
		
	}
	dhWeb.onAuthorizeGroup = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.closeAll();
			layer.msg("授权分组成功");
			dhWeb.getUserGroups(requestId++, sessionStorage.getItem("loginHandle"), data.params.userId);
		}else{
			layer.msg("授权分组失败");
		}
		
	}
	//授权分组
	$(".authorizeGroup").click(function(){
		var html = "<div>"+
						"<div id='authtree'></div>"+
					"</div>";
		var selectObj = $("#usertree").jstree(true).get_selected(true);
		if(selectObj.length == 0){
			layer.msg("请先选择用户！");
			return false;
		}
		var authorizeUid = selectObj[0].id;
		layer.open({
		  type: 1, 
		  title: "授权列表",
		  area:["300px", "80%"],
		  shadeClose: true,
		  content: html,
		  btn: ["确定"],
		  btnAlign: 'c',
		  yes: function(index, layero){
				var checkIds = $('#authtree').jstree(true).get_checked();
				var groupTopIndex = $.inArray('grouptop',checkIds);
				if(groupTopIndex > -1) checkIds.splice(groupTopIndex,1);//移除顶级分组
				loadingIndex = layer.msg('正在授权，请稍候',{icon: 16,time:false,shade:0.8});
				requestId++;
				dhWeb.authorizeGroup(requestId, sessionStorage.getItem("loginHandle"), authorizeUid, checkIds.map(Number));
				setTimeout(function(){
					if(loadingIndex > 0){
						layer.msg("授权失败");
						layer.close(loadingIndex);
						layer.close(index);
						loadingIndex = 0;
					}
				},10000);
		  },
		  success: function(){
			var selectChilds= $('#usertree').jstree(true).get_selected(true)[0].children; 
			var userGroupIds = [];
			for(i in selectChilds){
				userGroupIds.push(selectChilds[i].split("_")[1]);
			}
			var groupTree = $("#grouptree").jstree(true);
			var groupJson = groupTree.get_json(groupTree.get_node("#grouptop"), {"flat": true});
			for (var i = 0; i < groupJson.length; i++) {
				groupJson[i].state = {"selected": userGroupIds.indexOf(groupJson[i].id)> -1 ? true : false,"opened": true};
			}
			$('#authtree').jstree({
				  "core" : {
					"animation" : 0,
					"check_callback" : true,
					"themes" : { "stripes" : true },
					'data' : groupJson
				  },
				  "types" : {
					"#" : {
					  "max_children" : 2,
					  "max_depth" : 3,
					  "valid_children" : ["root"]
					},
					"root" : {
					  "valid_children" : ["default"]
					},
					"default" : {
					  "valid_children" : ["default","file"]
					},
					"file" : {
					  "icon" : "glyphicon glyphicon-file",
					  "valid_children" : []
					}
				  },
				"checkbox" : {
					'cascade_to_disabled': false,
				 },
				  "plugins" : [
					   "types",  "checkbox","wholerow"
				  ]
				});
		  }
		});
	});
	 var trdMovingObj, trPasteObj;
	//设备配置
	 $('#devicetree').jstree({
	  "core" : {
		"animation" : 0,
		"check_callback" : true,
		'multiple': true,
		"themes" : { "stripes" : true },
		'data' :  [{ "id" : "devicetop", "parent" : "#", "text" : "顶级分组", "state" : {"opened" : true, "selected": true},"type": "top"}]
	  },
	  'sort' : function(a, b) {
			return a === "unGroupDev" ? 1 : -1;
		 },
		"search" : {
			"show_only_matches": true,
			"show_only_matches_children": true
		 } ,
	  "types" : {
		"#" : {
		  "max_children" : 1,
		  "max_depth" : 5,
		  "valid_children" : ["top"]
		},
		"top" : {
		  "valid_children" : ["normal","linkage","defense"]
		},
		"normal" : {
		  "icon" : "images/ngroup.png",
		  "valid_children" : ["Ipc", "Alarm","normal","linkage","defense"]
		},
		"linkage" : {
		  "icon" : "images/lgroup.png",
		  "valid_children" : ["Ipc", "Alarm"]
		},
		"defense" : {
		   "icon" : "images/defense.png",
		 	"valid_children" :["Ipc", "Alarm"]
		},
		"Ipc" : {
		  "icon" : "images/linkage.Offline_16.png",
		  "valid_children" : []
		},
		"Alarm" : {
		 "icon" : "images/alarm.Offline_16.png",
		 "valid_children" :[]
		}
	  }, 
	  "contextmenu":{
	    	select_node:false,
	    	show_at_node:true,
			items : function (node, cb) {
				var items = {
					remove:{  
						"label":"移动设备",  
						"icon": "glyphicon glyphicon-plus",
						"action":function(data){
							var inst = $.jstree.reference(data.reference),
							obj = inst.get_selected(true);
							obj1 = inst.get_node(data.reference);
							trdMovingObj = obj;
							for (var i = 0; i < trdMovingObj.length; i++) {
								if (trdMovingObj[i].type == 'normal' || trdMovingObj[i].type == 'linkage' || trdMovingObj[i].type == 'defense') {
									trdMovingObj.splice(i, 1);
									i--;
								}
							}
							if(trdMovingObj.length > 10){
								layer.msg("一次最多移动10台！");
								return;
							}
							inst.cut(trdMovingObj);
							$('#devicetree').jstree("deselect_all");
							top.layer.msg("请右击分组进行移动！", { time: 2000 });
						}
					},
					paste:{
						"separator_before"	: false,
						"separator_after"	: false,
						"_disabled"			: function (data) {
								return !$.jstree.reference(data.reference).can_paste();
						},
						"label"				: "粘贴设备",
						"icon"				: "glyphicon glyphicon-leaf",
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
							if (obj.type != 'normal' && obj.type != 'linkage'&& obj.type != 'defense') {
                                 return;
							}
							if (trdMovingObj == null) {
								return;
							}
							for (var i = 0; i < trdMovingObj.length; i++) {
								requestId++;
								dhWeb.moveDevice(requestId, sessionStorage.getItem("loginHandle"), trdMovingObj[i].id, obj.id);
							}
							trPasteObj = obj;
							inst.clear_buffer();	//清除右键剪切缓存
							trdMovingObj.splice(0, trdMovingObj.length);
						}
					}
				}
				if (node.type == 'Alarm' || node.type == "Ipc") {
					delete items.paste;
				} else if((node.type == 'top')) {
					return "";
				}else{
					delete items.remove;
				}
				return items;
			}
		},

	  "plugins" : [
		  "contextmenu","state", "types","sort","search","wholerow"
	  ]
	}).on("changed.jstree", function (e, data) {
		if(data.selected.length) {
			$(".deviceName,.deviceId,.deviceContact,.devicePhone").val("");
			$(".deviceName,.deviceContact,.devicePhone").attr("disabled", false);
			$(".deviceId").attr("disabled", true);
			$(".moveDevice,.editDevice,.setPush").hide();
			var selectObj = data.instance.get_selected(true);
			if(selectObj.length == 1 && selectObj[0].type != "top" && selectObj[0].type != "Ipc" && selectObj[0].type != "Alarm"){
				data.instance.deselect_node(selectObj[0]);
				return;
			}
			for(var i in selectObj){
				if(selectObj[i].type != "Ipc" && selectObj[i].type != "Alarm"){
					data.instance.deselect_node(selectObj[i]);
				}
			}
			var selectDevObj = data.instance.get_selected(true);
			if(selectDevObj.length == 1){
				$(".editDevice").show();
				$(".moveDevice").show();
				$(".setPush").show();
				$(".deviceId").val(selectObj[0].data.deviceId);
				$(".deviceName").val(selectObj[0].data.deviceName);
				$(".deviceContact").val(selectObj[0].data.deviceContact);
				$(".devicePhone").val(selectObj[0].data.devicePhone);
			}else if(selectDevObj.length > 1){
				$(".moveDevice").show();
				$(".deviceName,.deviceContact,.devicePhone").attr("disabled", true);
			}
			form.render();
		}
	});
	
	function showDeviceTree(deviceList){
		var deviceref = $("#devicetree").jstree(true);
		//创建未分组节点
		if(!deviceref.get_node("unGroupDev")){
			var unGroupTree = {};
			unGroupTree.id = "unGroupDev";
			unGroupTree.text = "未分组设备";
			unGroupTree.parent = "devicetop";
			unGroupTree.type = "normal";
			unGroupTree.state = {"opened" : true};
			deviceref.create_node(unGroupTree.parent, unGroupTree);
		}
		//创建设备列表节点
		for(var i=0;i< deviceList.length;i++){
			var treeNode = {};
			treeNode.id = deviceList[i].deviceId;
			treeNode.text = deviceList[i].deviceName;
			treeNode.parent = deviceList[i].parentId;
			treeNode.type = deviceList[i].deviceType;
			var action = deviceList[i].action;
			var type = deviceList[i].type;
			var icon = "images/alarm.Offline_16.png";
			if(action == "Offline"){
				if(type == "Alarm"){
					icon = "images/alarm.Offline_16.png";
				}else{
					icon = "images/linkage.Offline_16.png";
				}
			}else if(action == "Normal"){
				if(type == "Alarm"){
					icon = "images/alarm.Normal_16.png";
				}else{
					icon = "images/linkage.Normal_16.png";
				}
			}else if(action == "Start"){
				if(type == "Alarm"){
					icon = "images/alarm.Start_16.png";
				}else{
					icon = "images/alarm.Start_16.png";
				}
			}else if(action == "Dealing"){
				if(type == "Alarm"){
					icon = "images/alarm.Dealing_16.png";
				}else{
					icon = "images/alarm.Dealing_16.png";
				}
			}
			treeNode.icon = icon;
			treeNode.li_attr = {status: action};
			treeNode.data = deviceList[i];
			if(deviceref.get_node(deviceList[i].deviceId)){
				deviceref.delete_node(deviceList[i].deviceId);
			}
			if(deviceList[i].parentId == 0 || deviceList[i].parentId == ""){
				treeNode.parent = "unGroupDev";
			}
			deviceref.create_node(treeNode.parent, treeNode, "last");
		}
	}
	dhWeb.onEditDevice = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		var devref = $("#devicetree").jstree(true);
		loadingIndex = 0;
		if(data.error == "success"){
			devref.rename_node(data.params.deviceId, data.params.deviceName);
			devref.get_node(data.params.deviceId).data.deviceName = data.params.deviceName;
			layer.msg("修改成功");
		}else{
			layer.msg("修改失败");
		}
	}
	dhWeb.onMoveDevice = function(data){
		if(loadingIndex > 0 && data.id == requestId) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.closeAll();
			layer.msg("移动成功");
		}else{
			layer.msg("移动失败");
		}
	}
	form.on('submit(editDevice)', function(data){
		var selectObj = $("#devicetree").jstree(true).get_selected(true);
		if(selectObj.length == 0){
			layer.msg("请先选择设备！");
			return false;
		}
		var deviceId = selectObj[0].id;
		var deviceName = trim($(".deviceName").val());
		var deviceContact = trim($(".deviceContact").val());
		var devicePhone = trim($(".devicePhone").val());
		requestId++;
		dhWeb.editDevice(requestId, sessionStorage.getItem("loginHandle"), deviceId, deviceName, deviceContact, devicePhone);
		loadingIndex = layer.msg('正在修改，请稍候',{icon: 16,time:false,shade:0.8});
		setTimeout(function(){
			if(loadingIndex > 0){
				layer.msg("修改失败");
				layer.close(loadingIndex);
				loadingIndex = 0;
			}
		},10000);
		return false;
	});
	//移动设备
	$(".moveDevice").click(function(){
		var inst = $.jstree.reference("#devicetree"),
		obj = inst.get_selected(true);
		for (var i = 0; i < obj.length; i++) {
			if (obj[i].type != 'Alarm' && obj[i].type != 'Ipc') {
				obj.splice(i, 1);
				i--;
			}
		}
		if(obj.length == 0){
			layer.msg("请选择要移动的设备！");
			return;
		}
		if(obj.length > 10){
			layer.msg("一次最多移动10台！");
			return;
		}
		var html = "<div>"+
						"<div id='movetree'></div>"+
					"</div>";
		layer.open({
		  type: 1, 
		  title: "分组列表",
		  area:["300px", "80%"],
		  shadeClose: true,
		  content: html,
		  btn: ["确定"],
		  btnAlign: 'c',
		  yes: function(index, layero){
				var selectObj = $("#movetree").jstree(true).get_selected(true);
				if(selectObj.length == 0){
					layer.msg("请先选择分组！");
					return false;
				}
				var groupId = selectObj[0].id;
				loadingIndex = layer.msg('正在移动，请稍候',{icon: 16,time:false,shade:0.8});
				for (var i = 0; i < obj.length; i++) {
					requestId++;
					dhWeb.moveDevice(requestId, sessionStorage.getItem("loginHandle"), obj[i].id, groupId);
				}
				setTimeout(function(){
					if(loadingIndex > 0){
						layer.msg("移动失败");
						layer.close(loadingIndex);
						layer.close(index);
						loadingIndex = 0;
					}
				},10000);
		  },
		  success: function(){
			var groupTree = $("#grouptree").jstree(true);
			var groupJson = groupTree.get_json(groupTree.get_node("#grouptop"), {"flat": true});
			for (var i = 0; i < groupJson.length; i++) {
				groupJson[i].state = {"opened": true};
			}
			$('#movetree').jstree({
				  "core" : {
					'multiple': false,
					"animation" : 0,
					"themes" : { "stripes" : true },
					'data' : groupJson
				  },
				  "types" : {
					"#" : {
					  "max_children" : 2,
					  "max_depth" : 3,
					  "valid_children" : ["root"]
					},
					"root" : {
					  "valid_children" : ["default"]
					},
					"default" : {
					  "valid_children" : ["default","file"]
					},
					"file" : {
					  "icon" : "glyphicon glyphicon-file",
					  "valid_children" : []
					}
				  },
				"checkbox" : {
					'cascade_to_disabled': false,
				 },
				  "plugins" : [
					   "types","wholerow"
				  ]
				});
		  }
		});
	});

	//消息推送设置
	$(".setPush").click(function(){
		var inst = $.jstree.reference("#devicetree"),
		obj = inst.get_selected(true)[0];
		if(obj.li_attr.status == "Offline"){
			layer.msg("请选择在线设备");
			return;
		}
		var deviceId = obj.id;
		layer.open({
			type: 1, 
			title: "消息推送设置",
			area:["480px", "520px"],
			shadeClose: true,
			content: $(".pushSetting").html(),
			btn: ["确定"],
			btnAlign: 'c',
			yes: function(index, layero){
				var pushUrl = trim($(".layui-layer-content .pushUrl").val());
				var context = trim($(".layui-layer-content .context").val());
				var isAuth = $('.layui-layer-content .isAuth').is(':checked') === true ? 1 : 0;
				var authUname = trim($(".layui-layer-content .authUname").val());
				var authUpwd = trim($(".layui-layer-content .authUpwd").val());
				if(pushUrl == "" || pushUrl == undefined){
					layer.tips('url不能为空', '.layui-layer-content .pushUrl', {
						tips: [2, '#000'],
						time: 3000
					});
					return;
				}
				dhWeb.editWebPush(requestId++, sessionStorage.getItem("loginHandle"), deviceId, pushUrl, context, isAuth, authUname, authUpwd);
				loadingIndex = layer.msg('正在提交，请稍候',{icon: 16,time:false,shade:0.8});
				setTimeout(function(){
					if(loadingIndex > 0){
						layer.msg("提交失败");
						layer.close(loadingIndex);
						layer.close(index);
						loadingIndex = 0;
					}
				},10000);
			},
			success: function(layero, index){
				form.render();
				dhWeb.getWebPush(requestId++, sessionStorage.getItem("loginHandle"), deviceId);
			}

		})
	})
	dhWeb.onEditWebPush = function(data){
		if(loadingIndex > 0) layer.close(loadingIndex);
		loadingIndex = 0;
		if(data.error == "success"){
			layer.closeAll();
			layer.msg("提交成功");
		}else{
			layer.msg("提交失败");
		}
	}
	dhWeb.onGetWebPush = function(data){
		if(data.error == "success"){
			$(".layui-layer-content .pushUrl").val(data.params.url);
			$(".layui-layer-content .context").val(data.params.context);
			$(".layui-layer-content .isAuth").prop("checked", data.params.isAuth);
			$(".layui-layer-content .authUname").val(data.params.userName);
			$(".layui-layer-content .authUpwd").val(data.params.password);
			showAuthInfo(data.params.isAuth);
			form.render();
		}
	}
	form.on('checkbox(isAuth)', function(data){
		showAuthInfo(data.elem.checked);
		form.render();
	}); 

	function showAuthInfo(isAuth){
		$(".showAuthInfo").removeClass("layui-disabled");
		if(isAuth){
			$(".showAuthInfo,.authUname,.authUpwd").attr("disabled", false);
		}else{
			$(".showAuthInfo,.authUname,.authUpwd").attr("disabled", true);
			$(".showAuthInfo").addClass("layui-disabled")
		}
	}

	//数据统计
	function dataCount(){
		var onlineCount = $("#devicetree li[status = 'Normal']").length + $("#devicetree li[status = 'Start']").length + $("#devicetree li[status = 'Dealing']").length;
		var offlineCount = $("#devicetree li[status = 'Offline']").length;
		$(".onlineCount").text(onlineCount);
		$(".offlineCount").text(offlineCount);
	}
	
	//设备配置搜索
	var to =false;
	$('#search_input').keyup(function () {
		if(to) {
			clearTimeout(to);
		}
		to = setTimeout(function () {
			$('#devicetree').jstree(true).search($('#search_input').val());
		}, 250);
	});
	function trim(s){
       return s.replace(/(^\s*)|(\s*$)/g, "");
	}

	form.verify({
		name: function(value, item){ 
		  if(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5]/g.test(value)){
			return '只能输入中文、字母和数字';
		  }
		},
		number: function(value, item){ 
			if(/[^0-9]/g.test(value)){
			  return '只能输入数字';
			}
		  }
	  }); 
}();
