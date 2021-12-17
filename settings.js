/*
 * @Descripttion: 项目配置文件
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2020-12-27 20:53:06
 * @LastEditors: falost
 * @LastEditTime: 2021-05-07 23:00:27
 */
const DEV = process.env.NODE_ENV === 'development'
// ERP 主系统接口地址
const DEV_URL = 'http://127.0.0.1:7001'
const PRO_URL = ''
const STATIC_DEV = ''
const STATIC_PRO = ''

module.exports = {
  title: '头像边框' + (DEV ? '（内测版）' : ''),
  subTitle: '',
  /* 接口请求地址 */
  URL: DEV ? DEV_URL : PRO_URL,
  STATIC: DEV ? STATIC_DEV : STATIC_PRO,
  baseURL: process.env.VUE_APP_BASE_API,
  NODE_ENV: 'pro',
  DEV,
  themeColor: '#50616d', // 主题颜色
  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: true,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,
  /**
   * @type {boolean} true | false
   * @description Whether show the Tags View
   */
  needTagsView: true,
  /**
   * @type {Array}
   * @description 模块展示排列顺序
   */
  modelSort: [],
  clientId: '',
  clientSecret: '',
  /**
   * 字体图标库链接
   */
  fontLibrary: ''
}
