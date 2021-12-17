const {
  requestWxApi
} = require('./wx-api')
const protocol = require('./protocol.js')

const {
  FormData,
  resolveFile
} = require('../../utils/index')

class WxOpenapi {
  constructor({
    appid,
    appsecret,
    accessToken,
    accessTokenExpired
  } = {}) {
    this.appid = appid
    this.secret = appsecret
    this.accessToken = accessToken
    this._protocol = protocol
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  async _requestWxApi(action, options) {
    if (action === 'getAccessToken') {
      return requestWxApi(action, options)
    }
    if (!this.accessToken) {
      throw new Error(`${action}缺少参数accessToken`)
    }
    options.param = options.param || {}
    options.param.accessToken = this.accessToken
    return requestWxApi(action, options)
  }

  async getAccessToken() {
    return this._requestWxApi('getAccessToken', {
      param: {
        appid: this.appid,
        secret: this.secret,
        grantType: 'client_credential'
      }
    })
  }

  async imgSecCheck({
    image
  } = {}) {
    if (!image) {
      throw new Error('image required')
    }
    const {
      filename,
      contentType,
      buffer
    } = await resolveFile(image)
    const form = new FormData()
    form.append('img', buffer, {
      filename,
      contentType
    })
    return this._requestWxApi('imgSecCheck', {
      content: form.getBuffer(),
      headers: form.getHeaders()
    })
  }

  async textSecCheck({
    content
  }) {
    if (!content) {
      throw new Error('content required')
    }
    return this._requestWxApi('contentSecCheck', {
      data: {
        content
      }
    })
  }

}

module.exports = WxOpenapi
