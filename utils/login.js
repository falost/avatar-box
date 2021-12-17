/*
 * @Descripttion: 微信登录授权功能
 * @version:
 * @Author: falost
 * @Date: 2021-01-02 18:17:01
 * @LastEditors: falost
 * @LastEditTime: 2021-08-08 22:23:00
 */
let loginLock = false
class WxLogin {
  constructor() {
		this.loginStatus = true
    this.userInfo = null
    this.code = null
  }
  status = 0
  // 调起微信登录，并授权获取用户信息
  init(status = 0) {
    if (loginLock) return
		let that = this
    loginLock = true
    that.status = status
    return new Promise((resolve, reject) => {
      uni.login({
        success: (res) => {
					console.log(res)
          if (res.code) {
            that.code = res.code
            if (status === 1 || !that.loginStatus) {
              that.openSet(resolve, reject)
            } else {
              uni.showModal({
                title: '授权提示',
                content: '为尊重用户知情权，微信登录需用户自主授权，如不授权将无法使用部分功能！建议授权使用~',
                cancelText: '不授权',
                confirmText: '授权',
                confirmColor: '#36B0F6',
                cancelColor: '#cccccc',
                success: (res) => {
                  if (res.confirm) {
                    that.openSet(resolve, reject)
      							uni.setStorageSync('loginStatus', false)
                  } else if (res.cancel) {
                    console.log('用户没通过授权，此登录失败！')
                    loginLock = false
										that.loginStatus = true
                    resolve({ isLogin: false, cancel: true })
                  }
                }
              })
            }
						that.loginStatus = false
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
            loginLock = false
            reject({ isLogin: false })
          }
        },
        fail: (err) => {
          loginLock = false
          reject({ isLogin: false, ...err })
        }
      })
    })
  }
  openSet(resolve, reject) {
    let that = this
    uni.getSetting({
      success: (res) => {
				// console.log(res)
        if (res.authSetting['scope.userInfo']) {
          that.loginStatus = true
          if (uni.getUserProfile && this.status !== 1) {
            uni.getUserProfile({
              desc: '用于完善用户信息！',
              lang: 'zh_CN',
              success: (res2) => {
                console.log('新接口获取的用户信息', res2)
                // let encryptedData = res2.encryptedData
                // let iv = res2.iv
                let userInfo = res2.userInfo
                loginLock = false
                resolve({
                  code: that.code,
                  userInfo
                })
              },
              fail: (err) => {
                console.log(err)
                console.log('获取用户登录信息失败！' + err.errMsg)
                loginLock = false
                reject({ isLogin: false })
              }
            })
          } else {
            uni.getUserInfo({
              success: ({ userInfo }) => {
                console.log('重新静默授权成功', userInfo)
                loginLock = false
                resolve({
                  code: that.code,
									userInfo
                })
              },
              fail: () => {
                console.log('静默授权失败', res.errMsg)
                loginLock = false
                reject({ isLogin: false })
              }
            })
          }
        } else {
          console.log('获取登陆授权失败', res)
          uni.navigateTo({
            url: '/pages/user/login/button-login'
          })
          loginLock = false
          reject({ isLogin: false })
        }
      },
      fail: (err) => {
        loginLock = false
        reject({ isLogin: false, ...err })
      }
    })
  }
}
export default WxLogin
