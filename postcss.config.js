/*
 * @Descripttion: postcss 配置文件
 * @version: 
 * @Author: falost
 * @Date: 2021-04-11 15:51:09
 * @LastEditors: falost
 * @LastEditTime: 2021-07-07 16:34:02
 */
const settings = require('./settings.js')
module.exports = {
  parser: require('postcss-comment'),
  plugins: settings.DEV ? [] : [
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss'),
    require("postcss-px2rpx-transform")({
      platform: process.env.UNI_PLATFORM === 'mp-weixin' ? 'weapp' : process.env.UNI_PLATFORM === 'app-plus'? 'rn' : 'h5',
      designWidth: 375,
    }),
  ]
}
