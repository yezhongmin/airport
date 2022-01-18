layui.use(['element', 'layer','jquery','form','table','upload'], function() {
    Layui.$ = layui.jquery;
    Layui.element = layui.element;
    Layui.layer = layui.layer;
    Layui.form = layui.form;
    Layui.table = layui.table;
    Layui.upload = layui.upload;
    Page.init();
});

var Layui = {
    "$" : "",
    "element" : "",
    "layer" : "",
    "form" : "",
    "table" : "",
    "upload" : ""
};

var Page = {
    "areaid" : 1,
    "countInfo" : {},
    "devicePoints" : [
        {"id":"988323", "name": "入境旅客分流大厅6", "top":"323", "left":"325"},
        {"id":"988300", "name": "入境旅客分流大厅三明海沧", "top":"353", "left":"400"},
        {"id":"988268", "name": "涉疫垃圾存储间", "top":"433", "left":"370"}
    ],
    "colors" : ['#FFC21C', '#6D6BBE', '#FF896B', '#0CD390', '#FF75D4', '#0DC7F8'],
    "init" : function () {
        Page.queryByAreaid();
        Page.bindEvents();
        Page.changeUpdateModel();

        DhWeb.initDhWeb();
        /*Layui.$("#middleimg").on("click", function () {
            Page.openDevicePanel("984531");
        });*/
    },
    "queryByAreaid" : function () {
        var ajaxParms = {
            "url" : "../countInfo/queryByAreaid"
            ,"parms":{
                "areaid": Page.areaid
            }
            ,"success":function(data){
                console.log(data);
                if(data.code == "000"){
                    Page.countInfo = data.data;
                    Page.loadLeftitem0(JSON.parse(data.data.leftitem0));
                    Page.loadLeftitem1(JSON.parse(data.data.leftitem1));
                    Page.loadLeftitem2(JSON.parse(data.data.leftitem2));
                    Page.loadMiddleitem0(JSON.parse(data.data.middleitem0));
                    Page.loadMiddleitem1(JSON.parse(data.data.middleitem1));
                    Page.loadMiddleitem2(JSON.parse(data.data.middleitem2));
                    Page.loadRightitem0(JSON.parse(data.data.rightitem0));
                    Page.loadRightitem1(JSON.parse(data.data.rightitem1));
                    Page.loadRightitem2(JSON.parse(data.data.rightitem2));

                }else{
                    Layui.layer.msg("获取信息失败，" + data.msg, {
                        icon: 2 // 图标类型
                        ,time: 5000 // 消失时间(毫秒)
                        ,shift: 6 // 抖动
                        ,offset: 't'
                    });
                }
            },"error":function(){}
        };
        Ajax.get2(ajaxParms);
    },
    "loadLeftitem0" : function (itemdata) {
        var title = itemdata.title;
        var content = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        Layui.$("#left-item0-title").html(title);
        Layui.$("#left-item0-content").html(content);
    },
    "openLeftitem0" : function () {
        var itemdata = Page.countInfo.leftitem0;
        itemdata = JSON.parse(itemdata);
        var title = itemdata.title;
        var content = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        Layui.$("#leftitem0Title").val(title);
        Layui.$("#leftitem0Content").val(content);
    },
    "loadLeftitem1": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#left-item1-title").html(title);

        var echartsDatas = [];
        var datas = itemdata.datas;

        for(var i=0;i<datas.length;i++){
            var data = datas[i];
            if(data.isshow == "yes"){
                data["itemStyle"] = {color: Page.colors[i]};
                echartsDatas.push(data);
            }
        }

        var html = Page.getEchartsItemHtml(echartsDatas, itemdata.total);
        Layui.$("#left-item1-echarts-item").html(html);

        var myChart=echarts.init(document.getElementById("left-item1-echarts"));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}:  {c}"
            },
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },

                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: true
                    },
                    data: echartsDatas
                }
            ]
        };
        myChart.clear();
        myChart.setOption(option);
    },
    "openLeftitem1": function () {
        var item = JSON.parse(Page.countInfo.leftitem1);
        Layui.$("#leftitem1Title").val(item.title);

        var datas = item.datas;
        if(!datas || datas.length<6){
            datas = new Array(6);
        }
        var html = "";

        for(var i=0;i<datas.length;i++){
            html += Page.getTrHtml(datas[i], i);
        }
        Layui.$("#leftitem1Table tbody").html(html);
    },
    "loadLeftitem2": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#left-item2-title").html(title);

        var values = [];
        var names = [];
        var colors = [];
        for(var i=0;i<itemdata.datas.length;i++){
            var data = itemdata.datas[i];
            if(data.isshow == "yes"){
                values.push(data.value);
                names.push(data.name);
                colors.push(Page.colors[i]);
            }
        }

        var myChart=echarts.init(document.getElementById("left-item2-echarts"));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}:  {c}"
            },
            xAxis: {
                type: 'category',
                axisLine: {  //这是x轴文字颜色
                    lineStyle: {
                        color: "#fff"
                    }
                },
                data: names
            },
            yAxis: {
                type: 'value',
                axisLine: {//这是y轴文字颜色
                    lineStyle: {
                        color: "#fff"
                    }
                }
            },
            series: [{
                name: '数量',
                itemStyle: {
                    normal: {
                        color: function(params) {
                            /*var colorList = [
                              '#FFC21C','#6D6BBE','#FF896B','#0CD390','#FF75D4',
                               '#0DC7F8'
                            ];*/
                            return colors[params.dataIndex]
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}'
                        }
                    }
                },

                //设置柱的宽度，要是数据太少，柱子太宽不美观~

                barWidth:50,
                data: values,
                type: 'bar'
            }]
        };
        myChart.clear();
        myChart.setOption(option);
    },
    "openLeftitem2": function () {
        var item = JSON.parse(Page.countInfo.leftitem2);
        Layui.$("#leftitem2Title").val(item.title);

        var datas = item.datas;
        if(!datas || datas.length<6){
            datas = new Array(6);
        }
        var html = "";

        for(var i=0;i<datas.length;i++){
            html += Page.getTrHtml(datas[i], i);
        }
        Layui.$("#leftitem2Table tbody").html(html);
    },
    "loadMiddleitem0": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#middle-item0-title").html(title);

        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";

        var html = Page.getNumBoxHtml(value, "middle-item0-numbox", unit);
        Layui.$("#middle-item0-echarts").html(html);
    },
    "openMiddleitem0": function () {
        var itemdata = Page.countInfo.middleitem0;
        itemdata = JSON.parse(itemdata);
        var title = itemdata.title;
        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";
        Layui.$("#middleitem0Title").val(title);
        Layui.$("#middleitem0Num").val(value);
        Layui.$("#middleitem0Unit").val(unit);
    },
    "loadMiddleitem1": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#middle-item1-title").html(title);

        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";

        var html = Page.getNumBoxHtml(value, "middle-item1-numbox", unit);
        Layui.$("#middle-item1-echarts").html(html);
    },
    "openMiddleitem1": function () {
        var itemdata = Page.countInfo.middleitem1;
        itemdata = JSON.parse(itemdata);
        var title = itemdata.title;
        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";
        Layui.$("#middleitem1Title").val(title);
        Layui.$("#middleitem1Num").val(value);
        Layui.$("#middleitem1Unit").val(unit);
    },
    "loadMiddleitem2": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#middle-item2-title").html(title);

        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";

        var html = Page.getNumBoxHtml(value, "middle-item2-numbox", unit);
        Layui.$("#middle-item2-echarts").html(html);
    },
    "openMiddleitem2": function () {
        var itemdata = Page.countInfo.middleitem2;
        itemdata = JSON.parse(itemdata);
        var title = itemdata.title;
        var value = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].value : "";
        var unit = itemdata.datas && itemdata.datas.length > 0 ? itemdata.datas[0].unit : "";
        Layui.$("#middleitem2Title").val(title);
        Layui.$("#middleitem2Num").val(value);
        Layui.$("#middleitem2Unit").val(unit);
    },
    "loadRightitem0": function (itemdata) {
        //right-item0-echarts
        var title = itemdata.title;
        Layui.$("#right-item0-title").html(title);

        var datas = [];
        for(var i=0;i<itemdata.datas.length;i++){
            var data = itemdata.datas[i];
            if(data.isshow == "yes"){
                datas.push(data);
            }
        }
        var html = Page.getRightitem0Html(datas);
        Layui.$("#right-item0-echarts").html(html);
    },
    "openRightitem0": function () {
        var item = JSON.parse(Page.countInfo.rightitem0);
        Layui.$("#rightitem0Title").val(item.title);

        var datas = item.datas;
        if(!datas || datas.length<3){
            datas = new Array(3);
        }
        var html = "";

        for(var i=0;i<datas.length;i++){
            html += Page.getTrHtml(datas[i], i);
        }
        Layui.$("#rightitem0Table tbody").html(html);
    },
    "loadRightitem1": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#right-item1-title").html(title);

        var echartsDatas = [];
        var datas = itemdata.datas;

        for(var i=0;i<datas.length;i++){
            var data = datas[i];
            if(data.isshow == "yes"){
                data["itemStyle"] = {color: Page.colors[i]};
                echartsDatas.push(data);
            }
        }

        var html = Page.getEchartsItemHtml(echartsDatas, itemdata.total);
        Layui.$("#right-item1-echarts-item").html(html);

        var myChart=echarts.init(document.getElementById("right-item1-echarts"));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}:  {c}"
            },
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2,
                        normal:{
                            label:{
                                show: true,
                                formatter: '{c}'
                            }
                        }
                    },

                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: true
                    },
                    data: echartsDatas
                }
            ]
        };
        myChart.clear();
        myChart.setOption(option);
    },
    "openRightitem1": function () {
        var item = JSON.parse(Page.countInfo.rightitem1);
        Layui.$("#rightitem1Title").val(item.title);

        var datas = item.datas;
        if(!datas || datas.length<6){
            datas = new Array(6);
        }
        var html = "";

        for(var i=0;i<datas.length;i++){
            html += Page.getTrHtml(datas[i], i);
        }
        Layui.$("#rightitem1Table tbody").html(html);
    },
    "loadRightitem2": function (itemdata) {
        var title = itemdata.title;
        Layui.$("#right-item2-title").html(title);

        var echartsDatas = [];
        var datas = itemdata.datas;

        for(var i=0;i<datas.length;i++){
            var data = datas[i];
            if(data.isshow == "yes"){
                echartsDatas.push(data);
            }
        }
        var html = Page.getDeviceBoxHtml(echartsDatas);
        Layui.$("#right-item2-echarts").html(html);
    },
    "openRightitem2": function () {
        var item = JSON.parse(Page.countInfo.rightitem2);
        Layui.$("#rightitem2Title").val(item.title);

        var datas = item.datas;
        if(!datas || datas.length<12){
            datas = new Array(12);
        }
        var html = "";

        for(var i=0;i<datas.length;i++){
            html += Page.getTrHtml(datas[i], i);
        }
        Layui.$("#rightitem2Table tbody").html(html);
    },

    "bindEvents": function () {
        Layui.$(".item-update").on("click", function(){
             var columnName = Layui.$(this).attr("columnName");
             switch (columnName){
                 case "leftitem0":
                     Page.openLeftitem0();
                     break;
                 case "leftitem1":
                     Page.openLeftitem1();
                     break;
                 case "leftitem2":
                     Page.openLeftitem2();
                     break;
                 case "middleitem0":
                     Page.openMiddleitem0();
                     break;
                 case "middleitem1":
                     Page.openMiddleitem1();
                     break;
                 case "middleitem2":
                     Page.openMiddleitem2();
                     break;
                 case "rightitem0":
                     Page.openRightitem0();
                     break;
                 case "rightitem1":
                     Page.openRightitem1();
                     break;
                 case "rightitem2":
                     Page.openRightitem2();
                     break;
             }
             Layui.form.render();

             Layui.layer.open({
                type: 1
                ,title : '修改'
                ,area: '1400px'
                ,offset: "auto"
                ,id: columnName+'Id' //防止重复弹出
                ,content: Layui.$('#'+columnName+'Panel')
                ,shade: 0.3 //不显示遮罩
                ,shadeClose : true
                ,btn: ['确定修改']
                ,btnAlign: 'c'
                ,yes:function (index, layero) {
                    var content = {};
                    var datas = [];
                    var total = 0;
                    switch (columnName){
                        case "leftitem0":
                            content["title"] = Layui.$("#leftitem0Title").val();
                            datas.push({
                                "name" : "remark",
                                "value" : Layui.$("#leftitem0Content").val()
                            });
                            break;
                        case "leftitem1":
                            content["title"] = Layui.$("#leftitem1Title").val();
                            $("#leftitem1Table tbody tr").each(function(idx){
                                var tds = Layui.$(this).find("td");
                                var value = tds.eq(1).find("input").eq(0).val();
                                var isshow = tds.eq(3).find("input:radio:checked").val();
                                if(isshow == "yes"){
                                    total += value * 1;
                                }
                                datas.push({
                                    "name" : tds.eq(0).find("input").eq(0).val(),
                                    "value" : value,
                                    "sortid" : tds.eq(2).find("input").eq(0).val(),
                                    "isshow" : isshow
                                });
                            });
                            content["total"] = total;
                            datas = Page.sort(datas);
                            break;
                        case "leftitem2":
                            content["title"] = Layui.$("#leftitem2Title").val();
                            $("#leftitem2Table tbody tr").each(function(idx){
                                var tds = Layui.$(this).find("td");
                                var value = tds.eq(1).find("input").eq(0).val();
                                var isshow = tds.eq(3).find("input:radio:checked").val();
                                if(isshow == "yes"){
                                    total += value * 1;
                                }
                                datas.push({
                                    "name" : tds.eq(0).find("input").eq(0).val(),
                                    "value" : value,
                                    "sortid" : tds.eq(2).find("input").eq(0).val(),
                                    "isshow" : isshow
                                });
                            });
                            content["total"] = total;
                            datas = Page.sort(datas);
                            break;
                        case "middleitem0":
                            content["title"] = Layui.$("#middleitem0Title").val();
                            datas.push({
                                "name" : "num",
                                "value" : Layui.$("#middleitem0Num").val(),
                                "unit": Layui.$("#middleitem0Unit").val()
                            });
                            break;
                        case "middleitem1":
                            content["title"] = Layui.$("#middleitem1Title").val();
                            datas.push({
                                "name" : "num",
                                "value" : Layui.$("#middleitem1Num").val(),
                                "unit": Layui.$("#middleitem1Unit").val()
                            });
                            break;
                        case "middleitem2":
                            content["title"] = Layui.$("#middleitem2Title").val();
                            datas.push({
                                "name" : "num",
                                "value" : Layui.$("#middleitem2Num").val(),
                                "unit": Layui.$("#middleitem2Unit").val()
                            });
                            break;
                        case "rightitem0":
                            content["title"] = Layui.$("#rightitem0Title").val();
                            $("#rightitem0Table tbody tr").each(function(idx){
                                var tds = Layui.$(this).find("td");
                                var value = tds.eq(1).find("input").eq(0).val();
                                var isshow = tds.eq(3).find("input:radio:checked").val();
                                if(isshow == "yes"){
                                    total += value * 1;
                                }
                                datas.push({
                                    "name" : tds.eq(0).find("input").eq(0).val(),
                                    "value" : value,
                                    "sortid" : tds.eq(2).find("input").eq(0).val(),
                                    "isshow" : isshow
                                });
                            });
                            content["total"] = total;
                            datas = Page.sort(datas);
                            break;
                        case "rightitem1":
                            content["title"] = Layui.$("#rightitem1Title").val();
                            $("#rightitem1Table tbody tr").each(function(idx){
                                var tds = Layui.$(this).find("td");
                                var value = tds.eq(1).find("input").eq(0).val();
                                var isshow = tds.eq(3).find("input:radio:checked").val();
                                if(isshow == "yes"){
                                    total += value * 1;
                                }
                                datas.push({
                                    "name" : tds.eq(0).find("input").eq(0).val(),
                                    "value" : value,
                                    "sortid" : tds.eq(2).find("input").eq(0).val(),
                                    "isshow" : isshow
                                });
                            });
                            content["total"] = total;
                            datas = Page.sort(datas);
                            break;
                        case "rightitem2":
                            content["title"] = Layui.$("#rightitem2Title").val();
                            $("#rightitem2Table tbody tr").each(function(idx){
                                var tds = Layui.$(this).find("td");
                                var value = tds.eq(1).find("input").eq(0).val();
                                var isshow = tds.eq(3).find("input:radio:checked").val();
                                if(isshow == "yes"){
                                    total += value * 1;
                                }
                                datas.push({
                                    "name" : tds.eq(0).find("input").eq(0).val(),
                                    "value" : value,
                                    "sortid" : tds.eq(2).find("input").eq(0).val(),
                                    "isshow" : isshow
                                });
                            });
                            content["total"] = total;
                            datas = Page.sort(datas);
                            break;
                    }
                     content["datas"] = datas;
                     var ajaxParms = {
                         "url" : "../countInfo/updateByAreaid"
                         ,"parms":{
                             "areaid": Page.areaid,
                             "columnName" : columnName,
                             "content" : JSON.stringify(content)
                         }
                         ,"success":function(data){
                             console.log(data);
                             if(data.code == "000"){
                                 Layui.layer.msg("修改成功", {
                                     icon: 1 // 图标类型
                                     ,time: 5000 // 消失时间(毫秒)
                                     ,shift: 6 // 抖动
                                     ,offset: 't'
                                 });
                                 Layui.layer.close(index);
                                 Page.queryByAreaid();
                             }else{
                                 Layui.layer.msg("获取信息失败，" + data.msg, {
                                     icon: 2 // 图标类型
                                     ,time: 5000 // 消失时间(毫秒)
                                     ,shift: 6 // 抖动
                                     ,offset: 't'
                                 });
                             }
                         },"error":function(){}
                     };
                     Ajax.get2(ajaxParms);
                }
            });
        });
    },
    "getTrHtml" : function(_json, i){
        if(!_json){
            _json = {
                "name" : "",
                "value": "",
                "sortid": "",
                "isshow": "yes"
            };
        }
        var html = "";
        html += '<tr>';
        html += '<td><input type="text" value="'+_json.name+'" autocomplete="off" class="layui-input"></td>';
        html += '<td><input type="text" value="'+_json.value+'" autocomplete="off" class="layui-input"></td>';
        html += '<td><input type="text" value="'+_json.sortid+'" autocomplete="off" class="layui-input"></td>';
        html += '<td class="support-value">';
        html += '<input type="radio" name="isshow'+i+'" value="yes" title="显示" '+(_json.isshow == "yes" ? "checked" : "")+'>';
        html += '<input type="radio" name="isshow'+i+'" value="no" title="不显示" '+(_json.isshow == "no" ? "checked" : "")+'>';
        html += '</td>';
        html += '</tr>';
        return html;
    },
    "getEchartsItemHtml": function (echartsDatas, total) {
        // <div id="educationsDatas0" class="educationsDatas" style="position: absolute;left: 50px;top: 50px;color: #FFC21C;"></div>
        var html = "";
        var len = echartsDatas ? echartsDatas.length : 0;
        var totalValuep = 0;
        if(len <= 3){
            for(var i=0;i<len;i++){
                var data = echartsDatas[i];
                var valuep = 0;
                if(i == len - 1){
                    valuep = (100 - totalValuep).toFixed(2);
                }else{
                    valuep = total == 0 ? 0 : Math.round(data.value / total * 10000) / 100;
                    totalValuep += valuep;
                }
                html += '<div style="position: absolute;left: 10px;top: '+(-15 + i*50)+'px;color: '+data.itemStyle.color+';">'+data.name+'<br>'+data.value+'人('+valuep+'%)</div>';
            }
        }else if(len == 4){
            for(var i=0;i<len;i++){
                var data = echartsDatas[i];
                var valuep = 0;
                if(i == len - 1){
                    valuep = (100 - totalValuep).toFixed(2);
                }else{
                    valuep = total == 0 ? 0 : Math.round(data.value / total * 10000) / 100;
                    totalValuep += valuep;
                }
                if(i>1){
                    // 右边
                    html += '<div style="position: absolute;left: 390px;top: '+(-15 + (i-2)*80)+'px;color: '+data.itemStyle.color+';">'+data.name+'<br>'+data.value+'人('+valuep+'%)</div>';
                }else{
                    // 左边
                    html += '<div style="position: absolute;left: 10px;top: '+(-15 + i*80)+'px;color: '+data.itemStyle.color+';">'+data.name+'<br>'+data.value+'人('+valuep+'%)</div>';
                }
            }
        }else{
            for(var i=0;i<len;i++){
                var data = echartsDatas[i];
                var valuep = 0;
                if(i == len - 1){
                    valuep = (100 - totalValuep).toFixed(2);
                }else{
                    valuep = total == 0 ? 0 : Math.round(data.value / total * 10000) / 100;
                    totalValuep += valuep;
                }
                if(i>2){
                    // 右边
                    html += '<div style="position: absolute;left: 390px;top: '+(-15 + (i-3)*50)+'px;color: '+data.itemStyle.color+';">'+data.name+'<br>'+data.value+'人('+valuep+'%)</div>';
                }else{
                    // 左边
                    html += '<div style="position: absolute;left: 10px;top: '+(-15 + i*50)+'px;color: '+data.itemStyle.color+';">'+data.name+'<br>'+data.value+'人('+valuep+'%)</div>';
                }
            }
        }
        return html;
    },
    "getRightitem0Html" : function (datas) {
        var html = "";

        var maxNum = 0;
        var maxLen = 384; // 最大长度px

        for(var i=0;i<datas.length;i++){
            var d = datas[i];
            if(d.value * 1 > maxNum){
                maxNum = d.value;
            }
        }
        for(var i=0;i<datas.length;i++){
            var data = datas[i];
            var px = data.value/maxNum*maxLen;
            html += '<div style="position: absolute;left:0px;top:'+(i*40)+'px;width:510px;height:20px;">';
            html += '<div class="right-item0-item-title">'+data.name+'</div>';
            html += '<div class="right-item0-item-w"></div>';
            html += '<div class="right-item0-item-n" style="width:'+px+'px;"></div>';
            html += '<div class="right-item0-item-num">'+data.value+'</div>';
            html += '</div>';
        }
        return html;
    },
    "getDeviceBoxHtml" : function (datas) {
        var html = "";
        for(var i=0;i<datas.length;i++){
            var data = datas[i];
            html += '<div class="device-box">';
            html += '<a>';
            html += '<div class="device-name">'+data.name+'</div>';
            html += '<div class="device-num">'+data.value+'</div>';
            html += '</a>';
            html += '</div>';
        }
        return html;
    },
    "getNumBoxHtml" : function (num, classname, unit) {
        var html = "";
        var numstr = num + "";
        var numLen = numstr.length;
        for(var i=0;i<5-numLen;i++){
            numstr = "0" + numstr;
        }
        var nums = numstr.split("");
        for(var i=0;i<nums.length;i++){
            html += '<div class="'+classname+'">'+nums[i]+'</div>';
        }
        html += '<div class="middle-item-unit">'+unit+'</div>';
        return html;
    },
    "sort" : function(arr){
        for (var i = 0; i < arr.length - 1; i++) {
            //内层循环负责比较的次数
            for (var j = 0; j < arr.length - i - 1; j++) {
                //开始比较
                if (arr[j].sortid * 1 > arr[j + 1].sortid * 1) {
                    //开始交换变量的位置
                    var temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    },
    "changeUpdateModel" : function(){
        Layui.$('#changeUpdateModel').on('click', function() {
            if(!Page.updateModel) {
                Page.passwordPanelId = Layui.layer.open({
                    type: 1
                    ,title : '输入校验码认证成功后，进入开发者模式'
                    ,area: '640px'
                    ,offset: "auto"
                    ,id: 'passwordPanelId' //防止重复弹出
                    ,content: Layui.$('#passwordPanel')
                    ,shade: 0.3 //不显示遮罩
                    ,shadeClose : true
                });
            }else{
                Layui.$(".item-update").hide();
                Page.updateModel = false;
            }
        });

        Layui.$("#submitPassword").on("click", function(){
            var password = Layui.$("#update_password").val();
            var ajaxParms = {
                "url" : "../countInfo/checkPasswrod"
                ,"parms":{
                    "password": password
                }
                ,"success":function(data){
                    if(data.code == "000"){
                        Layui.layer.msg("认证成功，再次点击或刷新页面可退出开发者模式", {
                            icon: 1 // 图标类型
                            ,time: 5000 // 消失时间(毫秒)
                            ,shift: 6 // 抖动
                            ,offset: 't'
                        });

                        Layui.layer.close(Page.passwordPanelId);
                        Layui.$(".item-update").show();
                        Page.updateModel = true;
                    }else{
                        Layui.layer.msg("认证失败，" + data.msg, {
                            icon: 2 // 图标类型
                            ,time: 5000 // 消失时间(毫秒)
                            ,shift: 6 // 抖动
                            ,offset: 't'
                        });
                    }
                },"error":function(){}
            };
            Ajax.get2(ajaxParms);
        });
    },
    "isOpen" : false,
    "openDevicePanel" : function (deviceid, devicename) {
        if(Page.isOpen){
            Layui.layer.msg("收到新设备呼叫通知", {
                icon: 1 // 图标类型
                ,time: 5000 // 消失时间(毫秒)
                ,shift: 6 // 抖动
                ,offset: 't'
            });
            return;
        }
        var content = '<video id="dhVideo" style="width:100%;height:100%;background-color: black"></video>';
        content += '<div style="position: absolute;bottom: 5px;width:100%;text-align: center;"><button class="layui-btn layui-btn-normal" onclick="DhWeb.startTalk(\''+deviceid+'\')">打开对讲</button>';
        content += '<button class="layui-btn layui-btn-danger" onclick="Page.closeVideoPanel(\''+deviceid+'\')">关闭</button></div>';

        if(!devicename){
            var dhDevicename = DhWeb.deviceMap[deviceid + ""];
            devicename = dhDevicename ? dhDevicename : "未知设备名";
        }

        Page.isOpen = true;

        // 打开视频播放窗口
        Page.videoPanelId = Layui.layer.open({
            type: 1,
            title: devicename + ":" + deviceid,
            closeBtn: 0,
            area: '1280px',
            skin: 'layui-layer-nobg', //没有背景色
            content: content
        });

        DhWeb.playRT(deviceid);
        DhWeb.playDeviceAudio(deviceid);
    },
    "closeVideoPanel" : function (deviceid) {
        DhWeb.stopRT(deviceid);
        Layui.layer.close(Page.videoPanelId);
        Page.isOpen = false;
        console.log("closeVideoPanel", Page.closeVideoPanel);
    }
};

var MouseClick = {
    "handleClick" : function (e) {
        var xPage = (navigator.appName == 'Netscape') ? e.pageX : event.x + document.body.scrollLeft;
        var yPage = (navigator.appName == 'Netscape') ? e.pageY : event.y + document.body.scrollTop;
        imgEl = document.getElementById("middleitemmap");
        img_x = MouseClick.locationLeft(imgEl);
        img_y = MouseClick.locationTop(imgEl);
        var xPos = xPage - img_x;
        var yPos = yPage - img_y;

        // 当前点击位置
        var hotspot = {x: xPos, y: yPos};
        console.log(hotspot)
        MouseClick.addHotspot(hotspot);
    },
    "locationLeft": function (element) {
        var offsetTotal = element.offsetLeft;
        var scrollTotal = 0; // element.scrollLeft but we dont want to deal with scrolling - already in page coords
        if (element.tagName != "BODY") {
            if (element.offsetParent != null)
                return offsetTotal + scrollTotal + MouseClick.locationLeft(element.offsetParent);
        }
        return offsetTotal + scrollTotal;
    },
    "locationTop": function (element) {
        var offsetTotal = element.offsetTop;
        var scrollTotal = 0; // element.scrollTop but we dont want to deal with scrolling - already in page coords
        if (element.tagName != "BODY") {
            if (element.offsetParent != null)
                return offsetTotal + scrollTotal + MouseClick.locationTop(element.offsetParent);
        }
        return offsetTotal + scrollTotal;
    },
    "addHotspot": function (hotspot) {
        var x = hotspot.x - 12;
        var y = hotspot.y - 12;
        var src = 'image/device.png';

        imgEle = '<img ' + ' src="' + src + '"  style="top: '
            + y + 'px; left: ' + x + 'px; position: absolute; cursor: pointer;"'
            + ')" />';
        $('#mapdiv').append(imgEle);
    }
};

var DhWeb = {
    "dhWeb" : "",
    "loginHandle": "",
    "deviceMap" : {},
    "username" : "zongkong",
    "password" : "abc12345",
    "serverAddr": "192.168.10.3",
    "initDhWeb" : function () {
        DhWeb.dhWeb = new DHAlarmWeb();

        // 登录回调
        DhWeb.dhWeb.onLogin = function(message){
            DhWeb.onLogin(message);
        };

        // 连接断开回调
        DhWeb.dhWeb.onAlarmServerClosed = function(){
            DhWeb.onAlarmServerClosed();
        };

        // SDK异常回调
        DhWeb.dhWeb.onDHAlarmWebError = function(message){
            DhWeb.onDHAlarmWebError();
        };

        DhWeb.dhWeb.onPlayRT = function(message){
            DhWeb.onPlayRT(message);
        };

        DhWeb.dhWeb.onNotify = function(message){
            DhWeb.onNotify(message);
        };

        // 设备列表回调
        DhWeb.dhWeb.onDeviceList = function(data){
            var deviceList = data.params.list;
            for(var i in deviceList){
                DhWeb.deviceMap[deviceList[i]['deviceId'] + ""] = deviceList[i]['deviceName'];
            }
        };

        DhWeb.login();
    },
    "onLogin": function (msg) {
        DhWeb.loginHandle = msg && msg.params && msg.params.loginHandle ? msg.params.loginHandle : "";
    },
    "onAlarmServerClosed": function () {
        console.log("onAlarmServerClosed", new Date() + "");
        Layui.layer.msg("设备服务器连接异常断开，正在重新登录", {
            icon: 2 // 图标类型
            ,time: 5000 // 消失时间(毫秒)
            ,shift: 6 // 抖动
            ,offset: 't'
        });
        DhWeb.login();
    },
    "onDHAlarmWebError": function (data) {
        console.log("onDHAlarmWebError", data);
        if(data.msg.error=="loginTimeout"){
            Layui.layer.msg("登录设备服务器超时，正在重新登录", {
                icon: 2 // 图标类型
                ,time: 5000 // 消失时间(毫秒)
                ,shift: 6 // 抖动
                ,offset: 't'
            });
            DhWeb.login();
        }else if(data.msg.error=="dataTimeout"){
            Layui.layer.msg("获取设备超时，正在重新获取", {
                icon: 2 // 图标类型
                ,time: 5000 // 消失时间(毫秒)
                ,shift: 6 // 抖动
                ,offset: 't'
            });
            DhWeb.login();
        }
    },
    "onPlayRT": function (msg) {
        console.log("onPlayRT", msg);
        if(msg.error != "success"){
            Layui.layer.msg("播放失败", {
                icon: 2 // 图标类型
                ,time: 5000 // 消失时间(毫秒)
                ,shift: 6 // 抖动
                ,offset: 't'
            });
        }
    },
    "onNotify" : function(data){
        console.log("onNotify", data);
        var params = data.params;
        if(params.code == "DeviceStatus"){
            if(params.action == "Start"){
                // 设备正在呼叫
                var deviceid = params.deviceId;
                Page.openDevicePanel(deviceid);
            }
        }
    },
    "login": function () {
        DhWeb.dhWeb.login(DhWeb.username, DhWeb.password, DhWeb.serverAddr);
    },
    "playRT" : function (deviceid) {
        if(DhWeb.loginHandle == ""){
            Layui.layer.msg("尚未登录，正在重新登录", {
                icon: 2 // 图标类型
                ,time: 5000 // 消失时间(毫秒)
                ,shift: 6 // 抖动
                ,offset: 't'
            });
            DhWeb.login();
            return;
        }
        // Control.dhWeb.playDeviceAudio("984531");
        DhWeb.dhWeb.playRT(
            document.getElementById("dhVideo"),
            deviceid,
            DhWeb.loginHandle,
            false
        );
    },
    "stopRT": function (deviceid) {
        DhWeb.dhWeb.stopRT(
            deviceid,
            DhWeb.loginHandle
        );
    },
    "playDeviceAudio" : function (deviceid) {
        DhWeb.dhWeb.playDeviceAudio(deviceid);
    },
    "startTalk": function (deviceid) {
        console.log(Page.isOpen);
        DhWeb.dhWeb.startTalk(deviceid);
        Layui.layer.msg("对讲已打开", {
            icon: 1 // 图标类型
            ,time: 5000 // 消失时间(毫秒)
            ,shift: 6 // 抖动
            ,offset: 't'
        });
    }
};