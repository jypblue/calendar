/*日历插件：by:wzx
--------------------*/

//日历函数入口
function Skyseas_calendar(option){


    //设置传入的option的值
    //传入的显示月的数
    this.numMonths = option.numMonths;
    //点击按钮的ID
    var oId = option.id;
    if(!oId) return;
    this.oDateId = this.getId(oId);
    //信息数据
    this.dateL = option.date.total || 0;

    var dateArrs = [];
    if (this.dateL) {
        for (var i = 0; i < this.dateL; i++) {
            dateArrs.push(option.date.rows[i]);
        }
        this.dateArrs = dateArrs;
    } else {
    return;
    }

    //绘出日历，初始化日历
    this.init();


}


Skyseas_calendar.prototype = {

    init: function () {
        var _that = this;
        // 获取今天的日历时间
        var now = new Date();
        this.c_year = this.year = now.getFullYear();
        this.c_month = this.month = now.getMonth();
        this.date = now.getDate();

        //获取有航线的第一个日期
        var dateFirst = _that.dateArrs[0].time;
        var dateFarr = dateFirst.split("-");
        var dateFyear = parseInt(dateFarr[0]);
        var dateFmonth = parseInt(dateFarr[1]);
        // 初始化--默认定位到出发日期的第一个日期;否则日历定位到当前日期
        if (dateFirst.length > 0) {
            this.drawDate(dateFyear, dateFmonth - 1);
            _that.year = dateFyear;
            _that.month = dateFmonth - 1;
        } else {
            this.drawDate(this.year, this.month);
        }

        var oWrap = this.getId(this.SkySeas_Cid);
        if(!oWrap) return;
        this.oWrap = oWrap;
        this.oMain = this.getByClassName('main',this.oWrap)[0];
        this.oYear = this.getByClassName('yr_num',this.oWrap)[0];
        this.oMonth = this.getByClassName('mn_num',this.oWrap)[0];
        this.oBody = this.getByClassName('calendar_tb',this.oWrap)[0];
        this.oTd = this.oBody.getElementsByTagName("td");
        this.oPrev = this.getByClassName('left',this.oWrap)[0];
        this.oNext = this.getByClassName('right',this.oWrap)[0];
        this.close = this.getByClassName('i_close',this.oWrap)[0];

        //next切换
        this.next();
        //prev切换
        this.prev();

        //日历事件
        this.addEvent();
    },

    //同一document1绑定不同的click事件，点击空白用于关闭日历
    addMyEvent:function(obj, type, fn){
        if(obj.addEventListener){
            obj.addEventListener("click",fn,false);
        }else if (obj.attachEvent) {
            obj.attachEvent("on" + type, fn);
        }else{
            obj["on"+type] = fn;
        }
    },

    //隐藏日历	
    hide: function () {
        document.getElementById(this.SkySeas_Cid).style.display = "none";
    },

    //显示日历
    show: function () {
        document.getElementById(this.SkySeas_Cid).style.display = "block";
    },

    //获取ID元素
    getId: function (id) {
        return document.getElementById(id);
    },

    //获取css类名元素
    getByClassName: function (className, parent) {
        var elem = [],
			node = parent != undefined && parent.nodeType == 1 ? parent.getElementsByTagName('*') : document.getElementsByTagName('*'),
			p = new RegExp("(^|\\s)" + className + "(\\s|$)");
        for (var n = 0, i = node.length; n < i; n++) {
            if (p.test(node[n].className)) {
                elem.push(node[n]);
            }
        }
        return elem;
    },

    //初始绘出日历
    drawDate: function(year, month) {

        var _that = this;
        // 绘出日历
        var html = "";
        var numMonths = (_that.numMonths == null ? [1, 1] : (typeof _that.numMonths == 'number' ? [1, _that.numMonths] : _that.numMonths));
        _that.oMonthNums = numMonths;
        var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
        var arrbody = [];
        var Skyseas_tbID = [];

        var group = '';
        this.maxRows = 4;
            for(var col = 0;col < numMonths[1];col++) {

                var calender = '';
                //画出了总体最外层的div
                if(isMultiMonth){
                    calender += '<div class="group ';
                    if(numMonths[1] > 1) {
                        switch (col) {
                            case 0:calender += 'leftDate';
                                break;
                            case numMonths[1] - 1:calender += 'rightDate';
                                break;
                            default :calender +='middleDate';
                                break;
                        }
                    }
                    calender +='">';
                }

            var oYear = year;
            var oMonth = month+1;
            var Skyseas_tb  = "Skyseas_tb" + (+new Date())+col;
            Skyseas_tbID.push(Skyseas_tb);
            //绘出顶部年月
            calender += '<div class="months"><span class="yr_num">'+oYear+'</span><span class="ym">\u5e74</span>' +
                '<span class="mn_num">'+oMonth+'</span><span class="ym">\u6708</span></div>' +
                '<div class="days"><table id="'+Skyseas_tb+'"><thead>'+'<tr>';
            //循环绘出thead
            var thead = '';
            var dayNames = ['\u65e5','\u4e00','\u4e8c','\u4e09','\u56db','\u4e94','\u516d'];
            for(var dow = 0;dow < 7;dow++) {
                thead += '<th>'+dayNames[dow]+'</th>';
            }

            calender += thead + '</tr></thead></table></div></div>';

            //本月份第一天是星期几 - 为显示上个月份的天数做铺垫
            var first_day = new Date(year, month, 1).getDay(),
            //如果刚好是星期天，则空出一行（显示上个月的天数）
                first_day = first_day == 0 ? first_day = 7 : first_day;
            //本月份最后一天是几号
            final_date = new Date(year, month+1, 0).getDate(),
            //上个月的最后一天是几号
            last_date = new Date(year, month, 0).getDate(),
            //剩余的格子数--即排在末尾的格子数
            surplus = 42 - first_day - final_date;

            //var daysInMonth = this.getDaysInMonth(year, month);
            //var leadDays = (this.getFirstDayOfMonth(year, month) - first_day + 7) % 7;
            //console.log(leadDays);
            var curRows = Math.ceil((first_day + final_date) / 7); // 计算要生成的行数
             console.log(curRows);
            var numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //如果多个月，使用数量高的行
            console.log(numRows);
            this.maxRows = numRows;

            //绘出tbody
            var tr, td;
            var day = 0;
            var arrBefore = [];
            var arrNow = [];
            var arrNext = [];
            var frag = document.createDocumentFragment();
            //上个月的显示天数
            for (var i = 0; i < first_day; i++) {
                arrBefore.push((last_date - (first_day - 1) + i));
            }
            //本月的显示天数
            for (var j = 0; j < final_date; j++) {
                arrNow.push((j + 1));
            }
            //下个月的显示天数
            for (var k = 0; k < surplus; k++) {
                arrNext.push((k + 1));
            }

            var tbody = document.createElement("tbody");
            for (var l = 0; l < 6; l++) {
                tr = document.createElement("tr");
                for (var m = 0; m < 7; m++) {
                    td = document.createElement("td");
                    if (arrBefore.length) {
                        day = arrBefore.shift();
                        if (day) {
                            td.innerHTML = '<span class="past">' + day + '</span>';
                        }
                    } else if (arrNow.length) {
                        day = arrNow.shift();
                        if (day) {
                            td.innerHTML = '<span>' + day + '</span>';
                        }
                    } else if (arrNext.length) {
                        day = arrNext.shift();
                        if (day) {
                          //  td.innerHTML = '<span class="past">' + day + '</span>';
                        }
                    }
                    tr.appendChild(td);

                }
                frag.appendChild(tr);
            }

            //重新绘出存在临时节点的多节点
            tbody.appendChild(frag);
            tbody.className = "calendar_tb";

            //绘出有船的日期样式
            for (var i = 0; i < _that.dateL; i++) {
                var dateString = _that.dateArrs[i].time;
                var dateArr = dateString.split("-");
                var dateY = dateArr[0];
                var dateM = dateArr[1];
                var dateD = dateArr[2];
                var ship_bg = document.createElement("i");
                ship_bg.setAttribute("class", "icon" + " " + "i45");
                var offsetDay = first_day;
                if (year == dateY && dateM == (month+1)) {
                    tbody.getElementsByTagName('td')[dateD - 1 + offsetDay].className += " " + 'go';
                    tbody .getElementsByTagName('td')[dateD - 1 + offsetDay].setAttribute("text",dateY+"年"+dateM +"月" + dateD + "日");

                }
                if(numMonths[1] == 1 && year == dateY && dateM == (month+1)) {
                    tbody.getElementsByTagName("td")[dateD - 1 + offsetDay].childNodes[0].appendChild(ship_bg);
                }
            }

            // 日历给当前日期添加样式
            if(year==this.c_year&&this.c_month==month){
                tbody.getElementsByTagName('td')[first_day+this.date-1].className += " " +'today';
            }

            arrbody.push(tbody);
            month++;
            if(month>11){
                month = 0;
                year++;
            }
            group += calender;
        }

        html = '<h3 class="tit">\u5168\u90e8\u51fa\u53d1\u65e5\u671f</h3>'+'<div class="main">'+ group
            + '</div><span class="iconwrap left"><i class="icon i43"></i></span>'
            + '<span class="iconwrap right"><i class="icon i44"></i></span>'
            + '<i class="i_close"></i>';



        var  oDateDiv = document.createElement("div");
            oDateDiv.className = "calen_ly ";
            var dDateDiv = document.createElement("div");
            this.SkySeas_Cid = "SkySeas_C" + (+new Date());
            dDateDiv.setAttribute("id", this.SkySeas_Cid);
            dDateDiv.className = "skyseas_"+this.oDateId.id;
            dDateDiv.style.display = "none";
            oDateDiv.innerHTML = html ;
            dDateDiv.appendChild(oDateDiv);
            if (document.getElementById(this.SkySeas_Cid) == null) {
                document.body.appendChild(dDateDiv);
                for(var i = 0;i<arrbody.length;i++){
                    document.getElementById(Skyseas_tbID[i]).appendChild(arrbody[i]);
                }
            } else {
                return false;
        }
    },

    //填充日历
    fillDate:function(year,month){
        var _that = this;
        var numMonths = _that.oMonthNums;
        var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
        //for(var row = 0; row < numMonths[0];row++) {
        var group = '';
        this.maxRows = 4;
        var arrbody = [];
        var Skyseas_tbID = [];
        for(var col = 0;col < numMonths[1];col++) {
            var calender = '';
            //画出了总体最外层的div
            if(isMultiMonth){
                calender += '<div class="group ';
                if(numMonths[1] > 1) {
                    switch (col) {
                        case 0:calender += 'leftDate';
                            break;
                        case numMonths[1] - 1:calender += 'rightDate';
                            break;
                        default :calender +='middleDate';
                            break;
                    }

                    //如果是多月



                }
                calender +='">';
            }
            //设置当前日月
            var oYear = year;
            var oMonth= month + 1;
            var Skyseas_tb  = "Skyseas_tb" + (+new Date())+col;

            Skyseas_tbID.push(Skyseas_tb);
            //绘出顶部年月
            calender += '<div class="months"><span class="yr_num">'+oYear+'</span><span class="ym">\u5e74</span>' +
                '<span class="mn_num">'+oMonth+'</span><span class="ym">\u6708</span></div>' +
                '<div class="days"><table id="'+Skyseas_tb+'"><thead>'+'<tr>';
            //循环绘出thead
            var thead = '';
            var dayNames = ['\u65e5','\u4e00','\u4e8c','\u4e09','\u56db','\u4e94','\u516d'];
            for(var dow = 0;dow < 7;dow++) {
                thead += '<th>'+dayNames[dow]+'</th>';
            }

            calender += thead + '</tr></thead></table></div></div>';

            //本月份第一天是星期几 - 为显示上个月份的天数做铺垫
            var first_day = new Date(year, month, 1).getDay(),
            //如果刚好是星期天，则空出一行（显示上个月的天数）
            first_day = first_day == 0 ? first_day = 7 : first_day;
            //本月份最后一天是几号
            final_date = new Date(year, month+1, 0).getDate(),
            //上个月的最后一天是几号
            last_date = new Date(year, month, 0).getDate(),
            //剩余的格子数--即排在末尾的格子数
            surplus = 42 - first_day - final_date;
           // var daysInMonth = this.getDaysInMonth(year, month);
           // var leadDays = (this.getFirstDayOfMonth(year, month) - first_day + 7) % 7;
            //console.log(leadDays);
            var curRows = Math.ceil((first_day + final_date) / 7); // 计算要生成的行数
            console.log(curRows);
            var numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //如果多个月，使用数量高的行
             console.log(numRows);
            this.maxRows = numRows;

            //填充日历执行
            var tr, td;
            var day = 0;
            var arrBefore = [];
            var arrNow = [];
            var arrNext = [];
            var frag = document.createDocumentFragment();
            //上个月的显示天数
            for (var i = 0; i < first_day; i++) {
                arrBefore.push((last_date - (first_day - 1) + i));
            }
            //本月的显示天数
            for (var j = 0; j < final_date; j++) {
                arrNow.push((j + 1));
            }
            //下个月的显示天数
            for (var k = 0; k < surplus; k++) {
                arrNext.push((k + 1));
            }

            var tbody = document.createElement("tbody");
            for (var l = 0; l < 6; l++) {
                tr = document.createElement("tr");
                for (var m = 0; m < 7; m++) {
                    td = document.createElement("td");
                    if (arrBefore.length) {
                        day = arrBefore.shift();
                        if (day) {
                            td.innerHTML = '<span class="past">' + day + '</span>';
                        }
                    } else if (arrNow.length) {
                        day = arrNow.shift();
                        if (day) {
                            td.innerHTML = '<span>' + day + '</span>';
                        }
                    } else if (arrNext.length) {
                        day = arrNext.shift();
                        if (day) {
                         //   td.innerHTML = '<span class="past">' + day + '</span>';
                        }
                    }
                    tr.appendChild(td);
                }
                frag.appendChild(tr);
            }

            while (_that.oBody.hasChildNodes()) {
                _that.oBody.removeChild(_that.oBody.firstChild);
            }
            //重新绘出存在临时节点的多节点
            tbody.appendChild(frag);
            tbody.className = "calendar_tb";

            //绘出有船的日期
            for (var i = 0; i < _that.dateL; i++) {
                var dateString = _that.dateArrs[i].time;
                // var dateInfo = _that.dateArrs[i].info || 0;
                // var dateStatus = _that.dateArrs[i].status || 0;
                var dateArr = dateString.split("-");
                var dateY = dateArr[0];
                var dateM = dateArr[1];
                var dateD = dateArr[2];
                var ship_bg = document.createElement("i");
                ship_bg.setAttribute("class", "icon" + " " + "i45");
                var offsetDay = first_day;
                if (numMonths[1] == 1 && year == dateY && dateM == (month+1)) {
                    tbody .getElementsByTagName('td')[dateD - 1 + offsetDay].className += " " + 'go';
                    tbody .getElementsByTagName('td')[dateD - 1 + offsetDay].setAttribute("text",dateY+"年"+dateM +"月" + dateD + "日");
                    tbody .getElementsByTagName("td")[dateD - 1 + offsetDay].childNodes[0].appendChild(ship_bg);
                }
                else if(numMonths[1] > 1 && year == dateY && dateM == (month+1)) {
                    tbody .getElementsByTagName('td')[dateD - 1 + offsetDay].className += " " + 'go';
                    //其它样式
                }
            }
               arrbody.push(tbody);
            month++;
            if(month>11){
                month = 0;
                year++;
            }
            group += calender;
        }
        while (_that.oMain.hasChildNodes()) {
            _that.oMain.removeChild(_that.oMain.firstChild);
        }

        //重新绘出存在临时节点的多节点
        _that.oMain.innerHTML = group;

        for(var i = 0;i<arrbody.length;i++){
            document.getElementById(Skyseas_tbID[i]).appendChild(arrbody[i]);
        }

    },
    addEvent:function(){

        var _that = this;
        //点击关闭按钮
        this.close.onclick = function (e) {
            _that.hide();
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
        };
        //点击btn显示
        this.oDateId.onclick = this.oDateId.onfocus = function(){

            _that.show();
            // debugger;
            if (event.stopPropagation) event.stopPropagation();
            if (event.preventDefault) event.preventDefault();
        };

        //点击空白隐藏
        this.addMyEvent(document,"click", function (e) {
            // console.log("document"+new Date().getTime())
            e = e || window.event;
            var target = e.target || e.srcElement;
            var isSelf = true;

            if (target.id == _that.oWrap.id) {
                isSelf = false;
            }
            var oTarget = target;
            while (oTarget = oTarget.offsetParent) {

                if (oTarget.id == _that.oWrap.id) {
                    isSelf = false;
                    return;
                }
            }
            if (target.id != _that.oDateId.id && isSelf) {

                _that.hide();
            }
        });

        //日历主体事件
        obj = document.getElementById(this.SkySeas_Cid);
        obj.onclick = function(e) {

            e = e || event;
            var oTarget = e.target || e.srcElement;

            var newYear = _that.oYear.innerHTML;
            var newMonth = _that.oMonth.innerHTML;
            var newDay = oTarget.innerHTML.match(/[0-9]{1,2}/);
            if (oTarget.parentNode.className.indexOf("go") != -1) {
                //将日期回到点击的按钮上
                _that.oDateId.value = newYear + "-" + newMonth + "-" + newDay + "";

                for (var i = 0; i < _that.oTd.length; i++) {
                    if (_that.oTd[i].className.indexOf("on") != -1) {
                        _that.oTd[i].className = _that.oTd[i].className.replace("on", "");
                    }
                }
                this.className += " " + "on";
                _that.hide();
            }
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();


        }
    },
    //从夏令时手柄开关
    daylightSavingAdjust: function(date) {
        if (!date) return null;
        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
    },

    //找到一个月的天数
    getDaysInMonth: function(year, month) {
        return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    },

    //找到一个月的第一个星期
    getFirstDayOfMonth: function(year, month) {
        return new Date(year, month, 1).getDay();
    },

    // next切换
    next: function () {
        var _that = this;
        this.oNext.onclick = function () {
            _that.month++;
            if (_that.month > 11) {
                _that.month = 0;
                _that.year++;
            }
            // 重新填充日历
            _that.fillDate(_that.year, _that.month);
        }

    },
    // prev切换
    prev: function () {
        var _that = this;
        this.oPrev.onclick = function () {
            _that.month--;
            if (_that.month < 0) {
                _that.month = 11;
                _that.year--;
            }
            // 重新填充日历
            _that.fillDate(_that.year, _that.month);
        }

    }


}