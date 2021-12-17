const createConfig = require('uni-config-center')
const {
  ErrorCode,
  Cache,
  createApi
} = require('./utils/index')
const MpWeixinService = require('./platform/mp-weixin/index')


const configCenter = createConfig({
  pluginId: 'uni-sec-check'
})
const providerMap = {
  'mp-weixin': MpWeixinService
}

class SecurityCheck {
  constructor({
    provider,
    onlyUseCachedAccessToken = false, // 仅使用缓存的accessToken，用于在uniCloud内使用其他服务获取accessToken，且缓存在了云数据库的场景
    customGetAccessToken,
    refreshAccessTokenThreshold = 300000, // token有效期剩余少于5分钟时开始刷新
    abandonAccessTokenThreshold = 5000 // token有效期剩余少于5秒时舍弃不用
  } = {}) {
    if (!provider || !providerMap[provider]) {
      throw new Error(`请提供支持的provider参数，当前provider为：${provider}`)
    }
    const providerConfig = configCenter.config(`provider.${provider}`)
    if (!providerConfig) {
      throw new Error(`未在uni-config-center内配置uni-sec-check目录下的config.json文件内配置${provider}相关信息`)
    }
    const {
      appid,
      appsecret
    } = providerConfig
    this.provider = provider
    // 开发者提供的获取accessToken的接口，需要能返回{accessToken,expired}这种结构
    this.customGetAccessToken = customGetAccessToken
    this.onlyUseCachedAccessToken = onlyUseCachedAccessToken
    this.refreshAccessTokenThreshold = refreshAccessTokenThreshold
    this.abandonAccessTokenThreshold = abandonAccessTokenThreshold
    this.service = createApi(providerMap[provider], {
      appid,
      appsecret
    })
    this.cache = new Cache()
    this.accessTokenCacheKey = `access_token_${provider}_${appid}`
    this.ErrorCode = ErrorCode
  }

  /**
   * 获取accessToken值
   */
  async getAccessToken() {
    // 如果直接从微信服务器获取accessToken：
    // 不管刷新几次旧accessToken都会保留5分钟有效期，除非有效期已不足5分钟
    // 目前策略是在accessToken还有5分钟或更少有效期时触发刷新，但是依旧使用旧accessToken，此举是为了减少并发导致返回的accessToken有效期不正确，但是并没有完全消除accessToken有效期不正确的可能性。例如：accessToken过期后并发获取了accessToken，这时先获取的accessToken的有效期将变成5分钟而不是2小时

    // 如果希望使用uniCloud作为中心服务刷新accessToken（推荐）：
    // 可以使用一个定时执行的云函数定时更新数据库内的accessToken，然后设置内容安全服务仅使用缓存在数据库内的accessToken不再调用接口去获取accessToken，即配置（onlyUseCachedAccessToken:true）

    // 如果从开发者服务器获取accessToken：
    // 可以传入customGetAccessToken方法用于从其他服务器同步accessToken，视情况可能需要调整abandonAccessTokenThreshold与abandonAccessTokenThreshold
    const {
      value: cachedAccessToken,
      expired: cachedAccessTokenExpired
    } = await this.cache.get(this.accessTokenCacheKey)
    if (this.onlyUseCachedAccessToken) {
      return {
        accessToken: cachedAccessToken,
        expired: cachedAccessTokenExpired
      }
    }
    const shouldRefreshAccessToken = cachedAccessTokenExpired &&
      cachedAccessTokenExpired < Date.now() + this.refreshAccessTokenThreshold
    const shouldUseCachedAccessToken = cachedAccessTokenExpired &&
      cachedAccessTokenExpired > Date.now() + this.abandonAccessTokenThreshold
    let accessToken
    let expired
    if (shouldRefreshAccessToken) {
      const getAccessTokenApi = this.customGetAccessToken || this.service.getAccessToken.bind(this.service)
      const getAccessTokenRes = await getAccessTokenApi()
      accessToken = getAccessTokenRes.accessToken
      expired = getAccessTokenRes.expired
      if (accessToken && expired > Date.now()) {
        await this.cache.set(this.accessTokenCacheKey, accessToken, expired)
      }
    }
    if (shouldUseCachedAccessToken) {
      return {
        accessToken: cachedAccessToken,
        expired: cachedAccessTokenExpired
      }
    }
    return {
      accessToken,
      expired
    }
  }

  async checkAccessToken() {
    if (!this.service.accessToken) {
      const {
        accessToken,
        // expired
      } = await this.getAccessToken()
      this.service.setAccessToken(accessToken)
    }
  }

  async imgSecCheck({
    image
  }) {
    await this.checkAccessToken()
    return this.service.imgSecCheck({
      image
    })
  }

  async contentSecCheck({
    content
  }) {
    console.warn('contentSecCheck接口已废弃，请使用textSecCheck')
    await this.checkAccessToken()
    return this.service.textSecCheck({
      content
    })
  }
  
  async textSecCheck({
    content
  }) {
    await this.checkAccessToken()
    return this.service.textSecCheck({
      content
    })
  }
}

module.exports = SecurityCheck
