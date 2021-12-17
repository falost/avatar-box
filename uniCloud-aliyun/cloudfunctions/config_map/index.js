'use strict';
const db = uniCloud.database()
const { getConfigKey, success, fail } = require('utils')
exports.main = async (event, context) => {
	const keys = event.keys
	const label = event.label
	const data = {}
	for (let i in keys) {
		let key = keys[i]
		data[key] = await getConfigKey(key, label) || null
	}
	if (data.length <= 0) {
		return fail('获取失败!')
	}
	return success(data, '获取成功!')
};
