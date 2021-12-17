'use strict';
const db = uniCloud.database();
const dbCmd = db.command
const {
	getConfigKey,
	isEmpty
} = require('utils')
exports.main = async (event, context) => {
	const {
		type,
		userId
	} = event
	if (isEmpty(userId)) {
		return {
			code: 1,
			success: false,
			msg: '用户不存在'
		}
	} else if (isEmpty(type)) {
		return {
			code: 1,
			success: false,
			msg: '积分类型不能为空'
		}
	}
	// 创建回滚
	const transaction = await db.startTransaction()
	const timeStamp = new Date().getTime()
	let status = 1
	let score = 0
	let text = {
		0: '答题提示扣除积分',
		1: '浏览广告奖励积分',
		2: '签到奖励积分',
	}
	switch (type) {
		case 0: // 扣除
			status = 0
			let deductIntegral = await getConfigKey('deductIntegral') || 0
			score = parseInt(deductIntegral) * -1
			break
		case 1: // 广告
			status = 1
			let adIntegral = await getConfigKey('adIntegral') || 0
			score = parseInt(adIntegral)
			break
		case 2: // 签到
			status = 2
			break
		default:
	}

	try {
		let users = await transaction.collection('wz_user').doc(userId).get()
		if (!users.data) {
			// 用户不存在
			transaction.rollback(-100)
			return {
				code: 1,
				success: false,
				msg: '用户不存在'
			}
		}
		console.log('users', users.data.score)
		if (users.data.score <= 0 && status === 0) {
			// 积分不足
			transaction.rollback(-100)
			return {
				code: 1,
				success: false,
				msg: '积分不足'
			}
		}
		// 给用户增加积分
		var userResult = await transaction.collection('wz_user').doc(userId).update({
			'score': dbCmd.inc(score)
		})

		if (userResult.updated === 0) {
			// 积分增加失败
			transaction.rollback(-100)
			return {
				code: 1,
				success: false,
				msg: '积分更新失败'
			}
		}

		// 添加积分记录
		let scoreResult = await transaction.collection('wz_score_record').add({
			status,
			name: text[status],
			score: score,
			user_id: userId,
			time: timeStamp
		})
		if (scoreResult.inserted === 0) {
			// 积分更新失败
			transaction.rollback(-100)
			return {
				code: 1,
				success: false,
				msg: '积分更新失败'
			}
		}
		await transaction.commit()
		return {
			code: 0,
			success: true,
			data: {
				score: score,
			},
			msg: '积分更新成功'
		}
	} catch (e) {
		await transaction.rollback()
		return {
			code: 1,
			success: false,
			msg: e
		}
	}
};
