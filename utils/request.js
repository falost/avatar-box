/*
 * @Descripttion:
 * @version:
 * @Author: falost
 * @Date: 2020-01-09 20:53:06
 * @LastEditors: falost
 * @LastEditTime: 2021-08-08 15:54:47
 */
// import { MessageBox, Message } from 'element-ui'
// import Axios from 'axios'
// import Store from 'store'
// import qs from 'qs'

import store from '@/store'
import md5 from '@/utils/md5'
import defaultSettings from '@/settings'

const sort = function(arr) {
  let low = 0
  let high = arr.length - 1
  let tmp
  let j
  while (low < high) {
    for (j = low; j < high; ++j) { // 正向冒泡,找到最大者
      if (arr[j] > arr[j + 1]) {
        tmp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = tmp
      }
    }
    --high // 修改high值, 前移一位
    for (j = high; j > low; --j) { // 反向冒泡,找到最小者
      if (arr[j] < arr[j - 1]) {
        tmp = arr[j]
        arr[j] = arr[j - 1]
        arr[j - 1] = tmp
      }
    }
    ++low // 修改low值,后移一位
  }
  return arr
}
const HOST = defaultSettings.URL + (defaultSettings.NODE_ENV === 'dev' ? defaultSettings.baseURL : '')
// console.log(HOST)
// console.log(defaultSettings)
export const vRequest = function(params, url, host) {
  // const SITEID = store.getters.siteId || Store.get('siteId') || undefined || 'bZQIE4m9'
  // const USER = store.getters.user || Store.get('user')
  const TOKEN = store.getters.token || uni.getStorageSync('token')
  console.log('TOKEN', TOKEN)

  let timestamp = Date.parse(new Date())
  let config = {}
  let sign = ''
  let safeKey = 'F5IJ8oDGn90NyWTA'

  params.data = params.data || {}
  switch (host) {
    case 'USER':
      url = `/api${url}`
      break
    case 'UAA':
      url = `/api-uaa${url}`
      break
    case 'UPLOAD':
      url = `/api-file${url}`
      break
    default:
      url = `/api/v1${url}`
      break
  }
  // params.data['dbkey'] = params.data['dbkey'] ? params.data['dbkey'] : SITEID
  // params.data['userId'] = params.data['userId'] ? params.data['userId'] : USER ? USER.id : 0
  // params.data['uuid'] = params.data['uuid'] ? params.data['uuid'] : USER ? USER.uuid : 0
  params.data['timestamp'] = timestamp
  params.data['sign'] = undefined
  // 过滤参数列表中的空字符处理
  params.filterEmpty = params.filterEmpty !== false
  // 签名开始
  let singStr = ''
  let singArray = Object.keys(params.data)
  singArray = sort(singArray)
  for (let i = 0; i < singArray.length; i++) {
    const item = singArray[i]
    if (params.data[item] !== null && params.data[item] !== undefined && item !== 'sign' && (params.filterEmpty && params.data[item] !== '')) {
      singStr += item + '=' + params.data[item] + '|'
    }
    // 删除空字符串项
    if (params.filterEmpty && params.data[item] === '') {
      delete params.data[item]
    }
  }

  singStr = singStr.slice(0, -1) + '@key=' + safeKey
  singStr = encodeURIComponent(singStr)

  sign = md5.hex_md5(singStr).toLocaleUpperCase()
  console.log(`${HOST}${url}${params.path || ''}`)

  params.data['sign'] = sign
  // params.requestType = params.requestType || 'JSON'
  // 签名结束
  // 判断当前的请求类型 by falost
  config = {
    method: params.method || 'POST',
    url: `${HOST}${url}${params.path || ''}`,
    withCredentials: false,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    validateStatus(status) {
      return status <= 504 // Reject only if the status code is greater than or equal to 500
    }
  }
  if (params.method === 'GET') {
    config.data = params.data
  } else {
    config.data = params.requestType === 'JSON' ? JSON.stringify(params.data) : params.data
  }
  if (params.method === 'UPLOAD') {
    config.method = 'POST'

    config.data = params.data

    config.header = {
      'Content-Type': 'multipart/form-data'
    }
  }

  if (params.responseType) {
    config.responseType = params.responseType
  }
  if (params.requestType === 'JSON') {
    // service.defaults.headers.post['Content-Type'] = 'application/json'
    config.header = {
      'Content-Type': 'application/json'
    }
  }
  if (TOKEN) {
    config.header = { ...config.header, ...{
      'authorization': TOKEN
    }}
  }
  const service = new Promise((resolve, reject) => {
    config.success = (res) => {
      console.log(res)
      if (res.data.code === 1001) {
        store.dispatch('user/logout')
        store.dispatch('user/login', {
          status: 1
        })
      } else if (res.data.code === 1000 && params.login) {
        uni.showModal({
          title: '登陆提示',
          content: '该页面功能需要登录授权后,才能正常为您提供服务,请先登录！',
          cancelText: '取消',
          confirmText: '登录',
          confirmColor: '#36B0F6',
          cancelColor: '#cccccc',
          success: (res) => {
            if (res.confirm) {
              store.dispatch('user/login').then(res => {
                if (res.isLogin) {
                  params.callback && params.callback()
                }
              })
            }
          }
        })
      }
      resolve({ ...res, ...res.data })
    }
    config.fail = (res) => {
      reject(res)
      uni.showToast({
        title: `系统繁忙,请稍后重试!`,
        icon: 'none',
        duration: 2000
      })
    }
    console.log(config)
    // config.complete = (res) => {
    // 	resolve(res.data)
    // }
    uni.request(config)
  })
  return service
}
