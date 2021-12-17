/*
 * @Descripttion: 基础校验类
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2021-01-02 23:09:49
 * @LastEditors: falost
 * @LastEditTime: 2021-01-02 23:15:52
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @name isEmail
 * @desc 邮箱
 * @author Falost
 * @time 2020年12月15日 15:54:10 星期二
 * @param {String} {s}
 * @return  {*}
 */
export function isEmail(s) {
  return /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * @name isMobile
 * @desc 手机号码
 * @author Falost
 * @time 2020年12月15日 15:53:52 星期二
 * @param {String} {s}
 * @return  {*}
 */
export function isMobile(s) {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * @name isPhone
 * @desc 电话号码
 * @author Falost
 * @time 2020年12月15日 15:53:26 星期二
 * @param {String} {s}
 * @return  {*}
 */
export function isPhone(s) {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * @name isURL
 * @desc URL地址
 * @author Falost
 * @time 2020年12月15日 15:53:06 星期二
 * @param {String} {s}
 * @return  {*}
 */
export function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s)
}

/**
 * @name isPwd
 * @desc 验证密码
 * @author Falost
 * @time 2020年05月20日 13:46:16 星期三
 * @param {Object} {}
 * @return  {*}
 */
export const isPwd = function(val) {
  // return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,16}$/.test(val)
  return /^(?=.*[a-zA-Z])(?=.*\d)[^]{8,16}$/.test(val)
  // return (/(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{8,15}$/).test(val)
  // return /^(?=.*[a-zA-Z])(?=.*[!@#$~_.\?+-,])(?=.*\d)[^]{8,16}$/.test(val)
}

/**
 * @name isWeixin
 * @desc 微信号验证
 * @author Falost
 * @time 2020年12月15日 15:52:53 星期二
 * @param {Object} {}
 * @return  {*}
 */
export const isWeixin = function(val) {
  if (/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(val)) {
    return true
  } else {
    return false
  }
}

export const isEmpty = function(str) {
  if (str === null || typeof str === 'undefined' || str === '') {
    return true
  }
  return false
}

export const isNotEmpty = function(str) {
  return !isEmpty(str)
}
