'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	let { field = {}, dbName, id } = event
	if (!id || !dbName) {
		return {
			code: 1,
			success: false,
			msg: '查询表名或 ID 不能为空'
		}
	}
	let data = {}
	if (dbName === 'wz_user') {
		field = {
			name: true,
			avatar: true,
			score: true,
			status: true,
			mp: true,
			_id: true,
			level: true,
			originAvatar: true,
			last_login_time: true,
		}
		await db.collection(dbName).doc(id).update({
			last_login_time: new Date().getTime()
		})
	}
	let result = await db.collection(dbName).doc(id).field(field).get();

	if (result.data.length > 0){
		data = result.data[0]
		return {
			code: 0,
			success: true,
			data,
			msg: '获取成功'
		}
	}
	return  {
		code: 1,
		success: false,
		msg: '查询表名或 ID 不能为空'
	}
};
