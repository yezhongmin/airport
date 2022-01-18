//ajax封装

var Ajax = {
	"post" : function(ajaxParms) {
		Logger.SHOWPROGRESS("", "请稍后，系统正在处理.....");
		$.ajax({
			timeout : 1500000,
			type : "POST",
			async : true,
			url : ajaxParms.url,
			data : JSON.stringify(ajaxParms.parms),
			dataType : "json",
			contentType : "application/json",
			success : function(data) {
				Logger.CLOSEPROGRESS();
				ajaxParms.success(data);
			},
			error : function(jqXHR) {
				Logger.CLOSEPROGRESS();
				if (ajaxParms.error) {
					ajaxParms.error();
				} else {
					// Logger.INFO("服务器整顿，请稍后重试或联系工作人员", function(){});
				}
			}
		});
	},
	"get" : function(ajaxParms) {
		Logger.SHOWPROGRESS("", "请稍后，系统正在处理.....");
		$.ajax({
			timeout : 1500000,
			type : "POST",
			async : true,
			url : ajaxParms.url,
			data : ajaxParms.parms,
			dataType : "json",
			success : function(data) {
				Logger.CLOSEPROGRESS();
				ajaxParms.success(data);
			},
			error : function(jqXHR) {
				Logger.CLOSEPROGRESS();
				if (ajaxParms.error) {
					ajaxParms.error();
				} else {
					Logger.CLOSEPROGRESS();
					Logger.INFO("程序错误", function() {
					});
					/*
					 * var json = eval("(" + jqXHR.responseText + ")");
					 * if(json.code != "300")
					 */
					// Logger.INFO("服务器整顿，请稍后重试或联系工作人员", function(){});
				}
			}
		});
	},
	"get2" : function(ajaxParms) {
		$.ajax({
			timeout : 1500000,
			type : "POST",
			async : true,
			url : ajaxParms.url,
			data : ajaxParms.parms,
			dataType : "json",
			success : function(data) {
				ajaxParms.success(data);
			},
			error : function() {
				if (ajaxParms.error) {
					ajaxParms.error();
				} else {
				}
			}
		});
	},
	"getAesText" : function(ajaxParms) {
		ajaxParms["term"] = "admin";
		var paramsStr = JSON.stringify(ajaxParms.parms); //可以将json对象转换成json对符串 
		var data = {"params" : Ajax.encryptText(paramsStr)};
		$.ajax({
			timeout : 15000,
			type : "POST",
			async : true,
			url : ajaxParms.url,
			data : data,
			dataType : "text",
			success : function(data) {
				var d = Ajax.decryptText(data);
				var r = JSON.parse(d); //可以将json字符串转换成json对象 
				ajaxParms.success(r);
			},
			error : function() {
				ajaxParms.error();
			}
		});
	},
	"AES_KEY" : "leadingtv0000000",
	"encryptText" : function(str) {
		var key = CryptoJS.enc.Utf8.parse(this.AES_KEY);

		var srcs = CryptoJS.enc.Utf8.parse(str);
		var encrypted = CryptoJS.AES.encrypt(srcs, key, {
			mode : CryptoJS.mode.ECB,
			padding : CryptoJS.pad.Pkcs7
		});
		return encrypted.toString();
	},
	"decryptText" : function(str){
		 var key = CryptoJS.enc.Utf8.parse(this.AES_KEY);	
		 var decrypt = CryptoJS.AES.decrypt(str, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
		 return CryptoJS.enc.Utf8.stringify(decrypt).toString();
	}
};

var AjaxParm = function(parms, url, success, error) {
	return {
		"parms" : parms,
		"url" : url,
		"success" : success,
		"error" : error
	};
};