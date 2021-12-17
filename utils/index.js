/*
 * @Descripttion: 基础工具类
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2021-01-02 22:05:21
 * @LastEditors: falost
 * @LastEditTime: 2021-05-03 02:47:30
 */
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function formatTime(time, cFormat) {
  if (!time) {
    return '-'
  }
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

export function parseTime(time) {
  if (!time) {
    return '0秒'
  }
  if (arguments.length === 0) {
    return null
  }
  let formatObj = {
    y: time / 60 / 60 / 24 / 365,
    m: time / 60 / 60 / 24 / 30,
    d: time / 60 / 60 / 24,
    h: time / 60 / 60 % 24,
    i: time / 60 % 60,
    s: time % 60
  }
  let formatStr = {
    y: '年',
    m: '月',
    d: '天',
    h: '小时',
    i: '分',
    s: '秒'
  }
  let time_str = ''
  Object.keys(formatObj).filter(key => {
    let value = formatObj[key]
    if (value < 1 && key !== 's') return false
    value = parseInt(value).toString().padStart(2, '0')
    time_str += `${value}${formatStr[key]}`
  })
  return time_str
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

export const throttle = (fn, t) => {
  let prev = Date.now()
  // 下面是个闭包，可以一直获取到外层的 prev 变量
  return function() {
    let now = Date.now()
    if (now - prev >= t) {
      fn.apply(this, arguments)
      prev = now
    }
  }
}
/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}
/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}
export const toNumber = function(val) {
  var n = parseFloat(val)
  return isNaN(n) ? val : n
}

/**
 * @name:formatCurrency
 * @desc: 价格保留两位小数 千分位
 * @author: libaolei
 * @Date: 2020-06-20 11:58:48
 * @param {type}
 * @return:
 */
export function formatCurrency(num = 0, aux = '￥') {
  if (!num) {
    num = 0
  }
  let str = ''
  num = num.toString().replace(/\$|\,/g, '')
  if (num < 0) {
    str = '-'
    num = Math.abs(num)
  }
  if (isNaN(num)) { num = '0' }
  num = Math.floor(num * 100 + 0.50000000001)
  let cents = num % 100
  num = Math.floor(num / 100).toString()
  if (cents < 10) { cents = '0' + cents }
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' +
  num.substring(num.length - (4 * i + 3))
  }
  return (aux + str + num + '.' + cents)
}

/**
 * @name delayProcess
 * @desc 延迟进程处理
 * @author Falost
 * @time 2020年08月25日 17:13:06 星期二
 * @param {Function} {func}
 * @param {Number} {time}
 * @return  {*}
 */
let lock = true
export function delayProcess(func, time) {
  if (lock) {
    func()
    lock = false
    setTimeout(() => {
      lock = true
    }, time)
  }
}

/**
 * @name addEvent
 * @desc 注册监听事件
 * @author Falost
 * @time 2019年05月29日 21:57:03 星期三
 * @param {Object, String, String, Function} {obj, type, name, fn}
 * @return  {*}
 */
var historyEventStack = {
  count: 0
}
export const addEvent = function(obj, type, name, fn) {
  historyEventStack.count += 1
  if (typeof name === 'function') fn = name
  if (typeof name === 'string') {
    if (historyEventStack.hasOwnProperty(name)) {
      removeEvent(obj, type, name)
      console.warn('You deleted the last method with the same name: ' + name + '，suggest you change your name ' + name)
    }
    historyEventStack[name] = fn
  }
  if (obj.attachEvent) {
    obj.attachEvent('on' + type, function() {
      (historyEventStack[name] || fn).call(obj)
    })
  } else {
    obj.addEventListener(type, historyEventStack[name] || fn, false)
  }
}
/**
 * @name removeEvent
 * @desc 删除注册的事件
 * @author Falost
 * @time 2020年01月10日 10:40:20 星期五
 * @param {Object, String, String} {obj, type, name}
 * @return  {*}
 */
export const removeEvent = function(obj, type, name) {
  if (!historyEventStack.hasOwnProperty(name)) {
    return false
  }
  obj.removeEventListener(type, historyEventStack[name], false)
  delete historyEventStack[name]
  return true
}

/**
 * @name friendlyTips
 * @desc 根据当前时间友好提示语
 * @author Falost
 * @time 2020年10月27日 12:02:07 星期二
 * @param {Object} {}
 * @return  {*}
 */
export const friendlyTips = () => {
  let hour = new Date().getHours()
  let tips = ''
  if (hour < 6) tips = `凌晨${hour}点了\n请注意休息`
  else if (hour < 9) tips = '早上好\n欢迎回来!'
  else if (hour < 12) tips = '上午好\n欢迎回来!'
  else if (hour < 14) tips = '中午好\n欢迎回来!'
  else if (hour < 17) tips = '下午好\n欢迎回来!'
  else if (hour < 19) tips = '傍晚好\n欢迎回来!'
  else if (hour < 22) tips = '晚上好\n欢迎回来!'
  else tips = '夜深了\n早点休息吧'
  return tips
}

/**
 * 随机生成数字
 *
 * 示例：生成长度为 12 的随机数：randomNumber(12)
 * 示例：生成 3~23 之间的随机数：randomNumber(3, 23)
 *
 * @param1 最小值 | 长度
 * @param2 最大值
 * @return int 生成后的数字
 */
export function randomNumber() {
  // 生成 最小值 到 最大值 区间的随机数
  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  if (arguments.length === 1) {
    let [length] = arguments
    // 生成指定长度的随机数字，首位一定不是 0
    let nums = [...Array(length).keys()].map((i) => (i > 0 ? random(0, 9) : random(1, 9)))
    return parseInt(nums.join(''))
  } else if (arguments.length >= 2) {
    let [min, max] = arguments
    return random(min, max)
  } else {
    return Number.NaN
  }
}

/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @return string 生成的字符串
 */
export function randomString(length, chats) {
  if (!length) length = 1
  if (!chats) chats = '0123456789qwertyuioplkjhgfdsazxcvbnm'
  let str = ''
  for (let i = 0; i < length; i++) {
    let num = randomNumber(0, chats.length - 1)
    str += chats[num]
  }
  return str
}

/**
 * 随机生成uuid
 * @return string 生成的uuid
 */
export function randomUUID() {
  let chats = '0123456789abcdef'
  return randomString(32, chats)
}

/**
 * 下划线转驼峰
 * @param string
 * @returns {*}
 */
export function underLine2CamelCase(string) {
  return string.replace(/_([a-z])/g, function(all, letter) {
    return letter.toUpperCase()
  })
}
/**
 * @name hexToRgba
 * @desc hex 颜色转 rgba
 * @author Falost
 * @time 2021年01月27日 23:44:06 星期三
 * @param {Object} {}
 * @return  {*}
 */
export const hexToRgba = (hex, opacity) => {
  let rgbaColor = ''
  let reg = /^#[\da-f]{6}$/i
  if (reg.test(hex)) {
    rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
      '0x' + hex.slice(3, 5)
    )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
  }
  return rgbaColor
}

/**
 * @name GCD
 * @desc 公约数
 * @param {Number} w
 * @param {Number} h
 */
export const GCD = (w, h) => {
  if (w % h) {
    return GCD(h, w % h)
  } else {
    return h
  }
}
export const scale = (w, h) => {
  let gcd = GCD(w, h)
  return {
    w: w / gcd,
    h: h / gcd
  }
}
