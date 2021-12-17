'use strict';
const db = uniCloud.database();
const { getConfigKey } = require('utils')
exports.main = async (event, context) => {
	const APPID = await getConfigKey('wxAppId')
	const APPSECRET = await getConfigKey('wxSecret')
	if (!APPID || !APPSECRET) {
		return '未配置系统参数'
	}
	var token = ''
	let date = new Date().getTime()
	try {
		var url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
		const res = await uniCloud.httpclient.request(url,{
			method:"GET",
			contentType: 'json',
			dataType:"json"
		})
		var data = res.data
		if(!data.access_token){
			return '获取TOKEN失败'
		}
		token = data.access_token
	} catch (e) {
		console.log(e)
		return '异常错误'
	}
	
	const _id = await getConfigKey('access_token','', '_id')
	
	const result = await db.collection('wz_config').doc(_id).update({
		val: token,
		update_at: date
	})
	
	if(result.updated > 0){
		console.log('token更新成功', token)
	}
}