'use strict';
const UniSecCheck = require('uni-sec-check')
const db = uniCloud.database();
const dbCmd = db.command;
const { getConfigKey } = require('utils')
exports.main = async function(event, context) {	
	// 进行图片安全检测
	const { url, userId, fileID, type = 'image', text } = event
	if (!userId) {
		return {
			code: 1,
			success: false,
			data: null,
			msg: '用户 ID 不能为空~'
		}
	}
  const uniSecCheck = new UniSecCheck({ // 创建内容安全检测模块实例
    provider: 'mp-weixin', // 指定所使用服务的提供商，目前仅支持mp-weixin
    customGetAccessToken: async function() { // 自定义的获取accessToken方法，见下方关于customGetAccessToken的说明
      let accessToken = await getConfigKey('access_token')
			let expired = await getConfigKey('access_token', null, 'updateAt')
			return {
        accessToken,
        expired: expired + (7000 * 1000)
      }
    },
    // onlyUseCachedAccessToken: true, // 仅使用缓存在数据库的accessToken，用于在uniCloud内使用其他服务获取accessToken，且缓存在了云数据库的场景，默认false
    // refreshAccessTokenThreshold, // token有效期剩余少于多少毫秒时开始刷新，默认300000毫秒
    // abandonAccessTokenThreshold // token有效期剩余少于多少毫秒时舍弃不用，默认5000毫秒
    // }
  })
  try {
		let errCode = 0
		if (type === 'image') {
			const imgSecCheckRes = await uniSecCheck.imgSecCheck({
			  image: url // 图片文件url
			})
			errCode = imgSecCheckRes.errCode
			console.log('imgSecCheckRes', imgSecCheckRes)
		} else if (type === 'text')  {
			const textSecCheckRes = await uniSecCheck.textSecCheck({
			  content: text // 文本内容，不可超过500KB
			})
			errCode = textSecCheckRes.errCode
			console.log('textSecCheckRes', textSecCheckRes)
		}
  	switch (errCode) {
			case 'uni-sec-check-empty-content':
			case 'uni-sec-check-empty-image':
				return {
					code: 1,
					success: false,
					data: null,
					msg: '检测内容不能为空~'
				}
  		case 'uni-sec-check-risk-content':
  		case 'uni-sec-check-invalid-request-url':
				await db.collection('wz_sec_check_record').add({
					title: '检测内容存在风险',
					content: url || text,
					userId,
					type,
					status: -1,
					create_at: new Date().getTime()
				})
  			return {
  				code: 1,
  				success: false,
  				data: null,
  				msg: '内容存在风险\n请检查后再试~'
  			}
  		default :
				await db.collection('wz_sec_check_record').add({
					title: '检测内容正常',
					content: url || text,
					userId,
					type,
					status: 1,
					create_at: new Date().getTime()
				})
  			return {
  				code: 0,
  				success: true,
  				data: null,
  				msg: '检测正常'
  			}
  	}
  	
  } catch (e){
  	return {
  		code: -1,
  		success: false,
  		data: null,
  		msg: '内容存在异常~'
  	}
  }
}