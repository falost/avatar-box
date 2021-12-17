/*
 * @Descripttion: 
 * @version: 
 * @Author: falost
 * @Date: 2021-01-31 22:35:25
 * @LastEditors: falost
 * @LastEditTime: 2021-01-31 23:55:32
 */
let subLock = false
class Subscribe {
  constructor() {
    this.subStatus = false
  }
  init(config) {
    let that = this
    if (subLock) return {}
    subLock = true
    this.config = config
    return new Promise((resolve, reject) => {
      that.openSeeting(resolve, reject)
    })
  }
  openSeeting(resolve, reject) {
    let that = this
    uni.getSetting({
      withSubscriptions: true,
      success: (res) => {
        subLock = false
        console.log('保持以上选择: ',res)
        if (res.subscriptionsSetting.mainSwitch) {
          uni.requestSubscribeMessage({
            tmplIds: this.config.ids,
            success: (res) => {
              console.log('订阅列表：', res)
              resolve({ sub: true, ...res })
            }, 
            fail: (err) => {
              console.log('订阅失败', err)
              reject({ cancel: true, ...err })
            }
          })
        } else {
          uni.showModal({
            title: '打开通知授权',
            content: '您好像关闭了消息通知权限, 打开后更方便为您提供服务哦!',
            confirmText: '前往打开',
            confirmColor: '#4cd964',
            cancelColor: '#888',
            success: () => {
              uni.openSetting({
                withSubscriptions: true,
                success: (res) => {
                  console.log('设置授权', res)
                  that.openSeeting(resolve, reject)
                }
              })
            },
            fail: (err) => {
              reject({ cancel: true, ...err })
            }
          })
        }
      },
      fail: (err) => {
        console.log('获取设置失败', err)
        subLock = false
        reject({ fail: true, ...err })
      }
    })
  }
}
export default Subscribe