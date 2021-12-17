# uni-sec-check

`uni-sec-check`是一个用于内容安全检测的开源公共模块，包含图片鉴黄、文字违规检测。对于各种需要用户上传图片、录入文字到数据库的场景，一般需要做内容安全检测。否则一旦应用呈现了违法文字或图片，轻则应用下架、重则违法。使用内容安全检测能有效帮助您降低内容违规风险。

本模块设计了provider概念，计划集成多家提供内容安全服务的供应商。目前已集成完毕的是微信提供的内容安全检测。

虽然是微信提供的，但安全检测是一个云端服务，在uni-sec-check中，支持全端全云使用，即不管App、H5或各家小程序均可使用本服务，不管uniCloud阿里云版或腾讯云版均可使用。

该服务免费，同时微信的限制是每天20万次图片检测、200万次文字检测，这对于大多数应用都是绰绰有余的。

`uni-sec-check`是云函数的公共模块，需要在云函数中引用本模块。不是在前端进行内容安全检测。

一般是在入库前进行内容检测，由于机器自动检测可能有误判，对于本机器判断不合法的内容，建议可以入库但标记为待人工确认，这类数据人工确认前不显示给终端用户。

对于图片需要先上传再检测，未检测通过的图片需要写代码进行删除，以免占用过多云存储。

## 配置

- 如何使用公共模块请参考：[使用公共模块](https://uniapp.dcloud.net.cn/uniCloud/cf-common)
- 本模块依赖于`uni-config-center`，使用前需先uni-config-center内添加配置，配置文件路径为：`uniCloud/cloudfunctions/common/uni-config-center/uni-sec-check/config.json`
- config.json是一个标准的json文件不支持使用注释，以下示例中的注释仅为说明

```json
{
  "provider": { // 服务提供商相关配置
    "mp-weixin": {
      "appid": "", // 微信小程序appid，从微信小程序后台获取
      "appsecret": "" // 微信小程序appsecret，从微信小程序后台获取
    }
  }
}
```

> 目前只有微信内容安全检测一个provider

**如何从微信获取内容安全服务的配置信息**

1. 进入微信公众平台，登录微信小程序账号（如果没有小程序账号，可以直接使用邮箱注册，流程很简单）
2. 进入以下路径`开发设置->开发设置->开发者ID`
3. 获取appid和appsecret（如果过去有业务有使用appid和appsecret，则直接复用，不要点重置），然后填入上述config.json文件中对应的appid和appsecret中。

## 在云函数中调用本模块的简单示例：

```js
const UniSecCheck = require('uni-sec-check')
exports.main = async function(event,context) {
  const uniSecCheck = new UniSecCheck({ // 创建内容安全检测模块实例
    provider: 'mp-weixin', // 指定所使用服务的提供商，目前仅支持mp-weixin
    // customGetAccessToken: async function() { // 自定义的获取accessToken方法，见下方关于customGetAccessToken的说明
    //   return {
    //     accessToken: '',
    //     expired: 1624537278552
    //   }
    // },
    // onlyUseCachedAccessToken, // 仅使用缓存在数据库的accessToken，用于在uniCloud内使用其他服务获取accessToken，且缓存在了云数据库的场景，默认false
    // refreshAccessTokenThreshold, // token有效期剩余少于多少毫秒时开始刷新，默认300000毫秒
    // abandonAccessTokenThreshold // token有效期剩余少于多少毫秒时舍弃不用，默认5000毫秒
    }
  })
  
  // 进行图片安全检测
  const url = event.url // event.url为演示的传入的url
  const imgSecCheckRes = await uniSecCheck.imgSecCheck({
    image: url // 图片文件url
  })
  if(imgSecCheckRes.errCode === 'xxx') {
    // 标记违规待删除
  }
}
```

**关于customGetAccessToken**

如果开发者使用自定义的获取accessToken的方法，需要确保此方法返回以下结构

```js
{
  accessToken: 'xxxx', // accessToken
  expired: 1624592382938 // 时间戳，注意务必返回数字类型
}
```

## API说明

### imgSecCheck

> 图片内容安全检测

**用法**

```js
await uniSecCheck.imgSecCheck({
  image: url // 图片文件url或图片cloudID
})
```

**参数说明**

|名称	|类型		|必填	|说明												|
|--		|--			|--		|--													|
|image|String	|是		|图片url或图片对应的cloudID	|

**返回值说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|errCode|String	|是		|错误码，见下方错误码说明	|
|errMsg	|String	|是		|错误信息									|


### textSecCheck

> 文字内容安全检测

**用法**

```js
await uniSecCheck.textSecCheck({
  content: '' // 文本内容，不可超过500KB
})
```

**参数说明**

|名称		|类型		|必填	|说明										|
|--			|--			|--		|--											|
|content|String	|是		|文本内容，不可超过500KB|

**返回值说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|errCode|String	|是		|错误码，见下方错误码说明	|
|errMsg	|String	|是		|错误信息									|

## 错误码说明

|错误码																|说明											|
|--																		|--												|
|uni-sec-check-system-error						|系统错误									|
|uni-sec-check-risk-content						|存在风险内容							|
|uni-sec-check-invalid-appid					|appid不正确							|
|uni-sec-check-invalid-appsecret			|appsecret不正确					|
|uni-sec-check-invalid-access-token		|accessToken不正确				|
|uni-sec-check-access-token-expired		|accessToken已过期				|
|uni-sec-check-invalid-file-type			|错误的文件类型						|
|uni-sec-check-invalid-image-size			|图片大小超出限制					|
|uni-sec-check-invalid-request-url		|错误的请求地址						|
|uni-sec-check-invalid-request-param	|错误的请求参数						|
|uni-sec-check-invalid-request-format	|错误的请求格式						|
|uni-sec-check-param-required					|缺少必要参数							|
|uni-sec-check-empty-image						|图片文件内容为空					|
|uni-sec-check-empty-content					|文字内容为空							|
|uni-sec-check-invoke-out-of-limit		|接口调用频率/次数超出限制|

## 微信小程序accessToken的处理

如果在多处使用内容安全检测，且多处复用相同的微信内容安全检测的appid和appsecret，那么就涉及如何复用accessToken的问题。

如果不发生多处复用，那么无需关心本章节。

本模块内包含自动维护微信小程序accessToken的逻辑。

微信小程序accessToken在从微信服务器获取之后有两个小时的有效期（目前是两小时，后续存在调整可能），多次获取accessToken会使之前获取的accessToken失效（旧accessToken会在5分钟内失效）。

传统开发中一般使用一台中控服务器获取accessToken，其他服务器再去中控服务器获取accessToken。因为各个服务各自去刷新accessToken，容易导致accessToken覆盖而影响业务。

使用本模块时有以下三种方式维护accessToken

**方式1：使用一个定时执行的云函数获取accessToken并存储**

此云函数内容请参考示例项目的`sync-access-token`，设置定时触发间隔为1小时，初次使用需要先手动执行一次

在初始化uni-sec-check时传入参数`onlyUseCachedAccessToken: true`，uni-sec-check将会不再自行获取accessToken，仅使用数据库内存储的accessToken

```js
const UniSecCheck = require('uni-sec-check')
exports.main = async (event, context) => {
  const uniSecCheck = new UniSecCheck({
    provider: 'mp-weixin',
    onlyUseCachedAccessToken: true
  })
};
```

**方式2：配置uni-sec-check从开发者原有中控服务器获取accessToken**

> 这种方式适用于已有中控服务器来获取accessToken，且不方便将从微信服务器获取accessToken的逻辑迁移到uniCloud的场景

```js
// 一个用户从中控服务器获取accessToken的函数，开发者应自行保证通讯安全性
async function getAccessToken() {
  return { // getAccessToken方法必须返回此结构数据
    accessToken: 'xxxx', // accessToken
    expired: 1624592382938 // 时间戳，注意务必返回数字类型
  }
}

const UniSecCheck = require('uni-sec-check')
exports.main = async (event, context) => {
  // uni-sec-check会将从中控服务器获取的accessToken存储在opendb-cloud-cache集合的_id为`access_token_mp-weixin_${appid}`的记录内
  const uniSecCheck = new UniSecCheck({
    provider: 'mp-weixin',
    customGetAccessToken: getAccessToken,
    refreshAccessTokenThreshold: 5000 // 调整为有效期少于5秒时刷新
  })
};
```

**方式3：由uni-sec-check维护accessToken**

> 此方式遇到并发突增时有极小的可能性获取的accessToken过期时间不正确，简单场景下使用没有问题

```js
const UniSecCheck = require('uni-sec-check')
exports.main = async (event, context) => {
  // uni-sec-check会自动获取accessToken并存储在opendb-cloud-cache集合的_id为`access_token_mp-weixin_${appid}`的记录内，自动刷新accessToken
  const uniSecCheck = new UniSecCheck({
    provider: 'mp-weixin'
  })
};
```