'use strict';

var config = {
    el: null,
    monthNums: 1,
    data: null,
    format: 'yyyy/mm/dd',
    fn: null
};

function Calendar(opts) {
    if (!opts.el) {
        console.log('初始化失败，未传入选择器！');
        return;
    }
    var setting = extend(config, opts || {});
    this.el = formatEl(setting.el);
    this.monthNums = setting.monthNums || 1;
    this.data = setting.data || {};
    this.dtlength = this.data.length;
    this.fn = setting.fn;
    this.init();
}

var CalProto = Calendar.prototype;
CalProto.init = function() {


    var now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth();

    //绘制日历
    this.fnDrawDate(this.year, this.month);
    this.fnGetDomSelector();
    this.prev();
    this.next();
    this.fnBindDataEvent();
};

CalProto.fnDrawDate = function() {

};

CalProto.fnSwipeMonth = function() {

};

CalProto.createDomWrap = function() {

};
CalProto.createDateStr = function() {

};
CalProto.createTheadStr = function() {

};
CalProto.createTbodyStr = function() {

};

//抽出来暴露出去的方法，方便用户自己定义;
//如果按指定格式出入就直接设定进入自定义属性中，在回掉方法中返回，如果没有设定data,就暴露出去自定义设定属性
CalProto.setDataAttribute = function() {

}


CalProto.fnGetDomSelector = function() {

};

CalProto.show = function() {

};

CalProto.hide = function() {

};

CalProto.prev = function() {

};

CalProto.next = function() {

};

CalProto.fnBindDataEvent = function() {

};



/*************************************************************************************************************/
/*私有方法 */

//获取id
function getId(id) {
    var index = id.indexOf(id) > 0 ? id.indexOf(id) : 0;
    id = id.substring(index, id.length - 1);
    return document.getElementById(id);
}
//获取class
function getByClassName(className, parent) {
    var elem = [],
        node = parent != undefined && parent.nodeType == 1 ? parent.getElementsByTagName('*') : document.getElementsByTagName('*'),
        p = new RegExp("(^|\\s)" + className + "(\\s|$)");
    if (document.querySelectorAll) {
        return document.querySelectorAll('.' + className);
    } else {
        for (var n = 0, i = node.length; n < i; n++) {
            if (p.test(node[n].className))
                elem.push(node[n]);
        }
        return elem;
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

//格式化选择字符串
function formatEl(selector) {
    var maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector;
    return nameOnly;
}