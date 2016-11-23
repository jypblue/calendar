/*
 * @Author: jypblue
 * @Date:   2016-10-12 15:36:42
 * @Last Modified by:   jypblue
 * @Last Modified time: 2016-11-23 17:44:45
 */

'use strict';
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root);
    })
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.sCalendar = factory(root);
  }
})(this, function(win) {

  var config = {
    monthNums: 1,
    data: [{}],
    defaultDate: '',
    dataTimeOpen: false
  }

  function Calendar(opts) {

    if (!opts.el) {
      return;
    }

    var setting = extend(config, opts || {});
    this.opts = setting;
    this.el = this.fnGetElement(setting.el)[0];
    this.monthNums = setting.monthNums;
    this.data = setting.data;
    this.tNum = this.data.length || 0;
    this.defaultDate = setting.defaultDate;
    this.dataTimeOpen = setting.dataTimeOpen;
    this.callback = setting.callback;
    this.tableId = [];
    this.maxRows = 4;

    //获取当前时间
    var now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1;
    this.date = now.getDate();

    this.init();

  }

  var CalProto = Calendar.prototype;


  CalProto.init = function() {
    var _this = this;

    //创建dom结构
    this.createDom();

    //获取dom节点
    this.calendarObj = this.fnGetId(this.calendarId);
    this.prevObj = getByClass('.left', this.calendarObj)[0];
    this.nextObj = getByClass('.right', this.calendarObj)[0];
    this.closeObj = getByClass('.i_close', this.calendarObj)[0];

    //绑定事件
    this.clickShowCalendar();
    this.next();
    this.prev();
    this.closeCalendar();
    this.callBack();
  };

  CalProto.createDom = function() {
    if (this.defaultDate.length) {
      var dftdate = this.dafaultDate.split('-');
      var dftyear = Number(dftdate[0]);
      var dftmonth = Number(dftdate[1]);
      this.drawDate(dftyear, dftmonth);

    } else if (this.dataTimeOpen) {
      var timeArr = [];
      for (var i = 0; i < _this.data.length; i++) {
        if (_this.data[i].time) {
          timeArr.push(_this.fnTimeToNum(_this.data[i].time))
        }
      }
      timeArr.sort(function(a, b) {
        return a - b;
      });

      var dataTime = timeArr[0];
      var year = dataTime.getFullYear;
      var month = dataTime.getMonth + 1;
      this.drawDate(year, month);
    } else {
      this.drawDate(this.year, this.month);
    }
  };

  //初始化当前日历
  CalProto.drawDate = function(year, month) {

    var groupstr = this.createGroupStr(year, month);
    var html = '<div class="calen_ly">' +
      '<h3 class="tit">全部出发日期</h3>' +
      '<div class="main">' + groupstr + '</div>' +
      '<span class="iconwrap left"><i class="icon i43"></i></span>' +
      '<span class="iconwrap right"><i class="icon i44"></i></span>' +
      '<i class="i_close"></i>' +
      '</div>';

    var dateDiv = document.createElement('div');
    this.calendarId = 'cid' + (new Date()).getTime();
    dateDiv.id = this.calendarId;
    dateDiv.style.display = 'none';
    dateDiv.innerHTML = html;
    document.body.appendChild(dateDiv);

    this.createDataDom(year, month);

  };

  CalProto.fillDate = function(year, month) {

    var monthNums = this.monthNums || 1;
    for (var i = 0; i < monthNums; i++) {
      var tbodyStr = this.createTbodyStr(year, month);

      this.tbodyObj = getByClass('.calendar_tb', this.calendarObj)[i];
      this.yearObj = getByClass('.yr_num', this.calendarObj)[i];
      this.monthObj = getByClass('.mn_num', this.calendarObj)[i];
      this.tbodyObj.innerHTML = tbodyStr;
      this.yearObj.innerHTML = year;
      this.monthObj.innerHTML = month;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  };

  //创建标题
  CalProto.createTitleStr = function(year, month) {
    var monthstr = '<div class="months">' +
      '<span class="yr_num">' + year + '</span>' +
      '<span class="ym">年</span>' +
      '<span class="mn_num">' + month + '</span>' +
      '<span class="ym">月</span>' +
      '</div>';
    return monthstr;
  }

  //创建日历的字符串
  CalProto.createTheadStr = function() {
    var dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    var thead = '',
      th = '';
    for (var d = 0; d < dayNames.length; d++) {
      th += '<th>' + dayNames[d] + '</th>';
    }

    thead += '<thead><tr>' + th + '</tr></thead>';

    return thead;
  };

  //创建tbody
  CalProto.createTbodyStr = function(curYear, curMonth) {

    var tbody = '';
    //本月份第一天是周几
    var curfday = new Date(curYear, curMonth - 1, 1).getDay();

    curfday = (curfday == 0) ? 7 : curfday;
    //本月份最后一天
    var curlday = new Date(curYear, curMonth, 0).getDate();
    //上月的最后一天
    var prevlday = new Date(curYear, curMonth - 1, 0).getDate();

    //剩余的格子数--排在末尾的格子数
    var surplus = 6 * 7 - curfday - curlday;

    //当前行数
    var curRows = Math.ceil((curfday + curlday) / 7);

    var numRows = (this.monthNums > 1) ? ((this.maxRows > curRows) ? this.maxRows : curRows) : curRows;
    this.maxRows = numRows;

    var datePrev = [],
      dateNow = [],
      dateNext = [];

    var tr = '',
      td = '',
      span = '',
      day = 0;

    //上个月显示的天数
    for (var m = 0; m < curfday; m++) {
      var num = prevlday - curfday + 1 + m;
      datePrev.push(num);
    }
    //本月显示的天数
    for (var n = 0; n < curlday; n++) {
      dateNow.push(n + 1);
    }
    //下月显示的天数
    for (var k = 0; k < surplus; k++) {
      dateNext.push(k + 1);
    }

    for (var l = 0; l < 6; l++) {
      for (var j = 0; j < 7; j++) {
        if (datePrev.length) {
          day = datePrev.shift();
          if (day) {
            span = '<span class="past">' + day + '</span>';
          }
        } else if (dateNow.length) {
          day = dateNow.shift();
          if (day) {
            span = '<span data-date="' + curYear + '-' + curMonth + '-' + day + '">' + day + '</span>';
          }
        } else if (dateNext.length) {
          day = dateNext.shift();
          if (day) {
            span = '<span class="past">' + day + '</span>';
          }
        }

        td += '<td>' + span + '</td>';
      }
      tr += '<tr>' + td + '</tr>';
      td = '';
    }

    tbody = '<tbody class="calendar_tb">' + tr + '</tbody>';
    tr = '';
    return tbody;
  }

  CalProto.createGroupStr = function(curYear, curMonth) {
    var _this = this;
    var monthNums = this.monthNums || 1;
    var groupstr = '',
      monthstr = '',
      thead = '',
      tbody = '',
      daystr = '';
    var maxRows = 4;
    //绘制外层dom
    for (var i = 0; i < monthNums; i++) {
      groupstr += '<div class="group ';
      switch (i) {
        case 0:
          groupstr += 'leftDate';
          break;
        case 1:
          groupstr += 'rightDate';
          break;
        default:
          groupstr += 'middleDate';
          break;
      }
      groupstr += '">';

      var tableId = 'tableid' + (new Date()).getTime() + i;
      this.tableId.push(tableId);
      //绘制title
      monthstr = this.createTitleStr(curYear, curMonth);
      //绘制thead
      thead = this.createTheadStr();
      //绘制tbody
      tbody = this.createTbodyStr(curYear, curMonth);
      daystr = '<div class="days"><table id="' + tableId + '">' + thead + tbody + '</table></div>';

      groupstr += monthstr + daystr + '</div>';


      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    };

    return groupstr;
  };

  // 可修改手动更改添加自定义数据展示
  CalProto.createDataDom = function(year, month) {
    var _this = this;
    var calendarData = this.data;
    var tbodyObj = null;
    var offsetDay = 0;
    var dataArr = [];
    var shipDom = null;
    if (calendarData.length == 0) {
      return;
    }

    if (_this.opts.createDataDom) {
      _this.opts.createDataDom.call(_this);
      return;
    }

    for (var j = 0; j < _this.monthNums; j++) {
      tbodyObj = getByClass('.calendar_tb', this.calendarObj)[j];
      offsetDay = new Date(year, month - 1, 1).getDay();
      offsetDay = (offsetDay == 0) ? 7 : offsetDay;

      for (var i = 0; i < calendarData.length; i++) {
        dataArr = calendarData[i].time.split('-');

        if (year == dataArr[0] && month == dataArr[1]) {
          shipDom = document.createElement('i');
          shipDom.setAttribute('class', 'icon  i45');
          tbodyObj.getElementsByTagName('td')[Number(dataArr[2]) - 1 + offsetDay].className += ' go';
          tbodyObj.getElementsByTagName('td')[Number(dataArr[2]) - 1 + offsetDay].childNodes[0].appendChild(shipDom);
          tbodyObj.getElementsByTagName('td')[Number(dataArr[2]) - 1 + offsetDay].setAttribute("data-text", dataArr[0] + "-" + dataArr[1] + "-" + dataArr[2]);
        }
      }
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

  };


  //日期格式化为数字
  CalProto.fnTimeToNum = function(str) {
    str = str.replace(/-/g, "/");
    return new Date(str);
  };

  CalProto.fnGetElement = function(str, parent) {
    if (str.indexOf('#') != -1) {
      str = str.substring(1, str.length);
      return document.getElementById(str);
    } else if (str.indexOf('.') != -1) {
      var obj = getByClass(str, parent);
      return obj;
    } else {
      return document.getElementsByTagName(str);
    }
  };
  CalProto.fnGetId = function(id) {
    return document.getElementById(id);
  };
  CalProto.hide = function() {
    var obj = this.fnGetId(this.calendarId);
    obj.style.display = 'none';
  };

  CalProto.show = function() {
    var obj = this.fnGetId(this.calendarId);
    obj.style.display = 'block';
  }

  CalProto.clickShowCalendar = function() {
    var _this = this;
    this.el.onclick = this.el.onfocus = function() {
      _this.show();
    }
  }

  CalProto.prev = function() {
    var _this = this;
    this.prevObj.onclick = function() {
      _this.month--;
      if (_this.month < 1) {
        _this.month = 11;
        _this.year--;
      }

      _this.fillDate(_this.year, _this.month);
      _this.createDataDom(_this.year, _this.month);
    }

  }

  CalProto.next = function() {
    var _this = this;
    this.nextObj.onclick = function() {
      _this.month++;
      if (_this.month > 12) {
        _this.month = 1;
        _this.year++;
      }

      _this.fillDate(_this.year, _this.month);
      _this.createDataDom(_this.year, _this.month);
    }
  }

  CalProto.closeCalendar = function() {
    var _this = this;
    this.closeObj.onclick = function() {
      _this.hide();
    }

    // 点击空白部分
    addHandler(document, 'click', function(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      var flag = true;
      if (target == _this.calendarObj) {
        flag = false;
      }
      var oTarget = target;
      while (oTarget = oTarget.parentNode) {

        if (oTarget == _this.calendarObj) {
          flag = false;
          return;
        }
      }

      if (target != _this.el && flag) {
        _this.hide();
      }

    });
  }

  CalProto.callBack = function() {
    var _this = this;
    this.calendarObj.onclick = function(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      while (target = target.parentNode) {
        if (target.tagName == 'TD' && hasClass(target, 'go')) {
          _this.el.value = target.childNodes[0].getAttribute('data-date');
          if (_this.callback) {
            _this.callback(target);
          }
          var td = document.getElementsByTagName("td");
          for (var i = 0; i < td.length; i++) {
            removeClass(td[i], 'on');
            //td[i].className = td[i].className.replace('on', ' ').trim();
          }
          addClass(target, 'on');
          //target.className += ' on';
          _this.hide();
          return;
        }
      }
    }
  }

  return win.Calendar = Calendar;

  /**
   **********************************************************
   * 内部函数
   */
  //判断是否有class
  function hasClass(el, oClass) {
    var elClass = el.className;
    //按位取反
    return ~(' ' + elClass + ' ').indexOf(' ' + oClass + ' ');
  }

  //添加class
  function addClass(el, oClass) {
    if (hasClass(el, oClass)) return;
    var elClass = el.className;
    el.className = (elClass + ' ' + oClass).replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ');
  }

  //移除class
  function removeClass(el, oClass) {
    if (!hasClass(el, oClass)) {
      return;
    }
    var elClass = el.className;
    el.className = (' ' + elClass + ' ').replace(' ' + oClass + ' ', '');
  }

  //获取class
  function getByClass(sClass, parent) {
    var aResult = [];
    var re = new RegExp('\\b' + sClass.substring(1, sClass.length) + '\\b', 'i');
    var i = 0;
    if (document.querySelectorAll) {
      var obj = null;
      if (parent) {
        obj = parent.querySelectorAll(sClass);
      } else {
        obj = document.querySelectorAll(sClass);
      }

      return obj;
    } else {
      var aEle = parent != undefined && parent.nodeType == 1 ? parent.getElementsByTagName('*') : document.getElementsByTagName('*');
      for (i = 0; i < aEle.length; i++) {
        if (re.test(aEle[i].className)) {
          aResult.push(aEle[i]);
        }
      }
      return aResult;
    }
  }

  //扩展
  function extend(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
    return target;
  }
  //添加事件监听
  function addHandler(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false); //冒泡阶段
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    } else {
      element['on' + type] = handler;
    }
  }
  //去除事件监听
  function removeHandler(element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false); //冒泡阶段
    } else if (element.detachEvent) {
      element.detachEvent('on' + type, handler);
    } else {
      element['on' + type] = null;
    }
  }
  //阻止冒泡
  function stopPropagation(event) {
    var e = event || window.event;
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }
  //函数绑定
  function bind(fn, context) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
      var innerArgs = Array.prototype.slice.call(arguments);
      var finalArgs = args.concat(innerArgs);
      return fn.apply(context, finalArgs);
    }
  }
});
