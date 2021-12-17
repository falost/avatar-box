'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const uniAccount = require('uni-account');
const {
	getConfigKey
} = require('utils')
exports.main = async (event, context) => {
	let appId
	let appSecret
	const { mptype, status, name, avatar, userId, isLogin = false, code, updateOrigin = false } = event
	const avatarUrl = avatar && (avatar.match(/.*\//)[0] + '0')
	console.log(avatarUrl, code)
	console.log('邀请人', userId)
	if (mptype == 'weixin') {
		appId = await getConfigKey('wxAppId')
		appSecret = await getConfigKey('wxSecret')
	} else if (mptype == 'qq') {
		appId = await getConfigKey('qqAppId')
		appSecret = await getConfigKey('qqSecret')
	}
	if (!appId || !appSecret) {
		return {
			code: 1,
			data: null,
			success: false,
			msg: '未配置登录参数'
		}
	}
	// 配置登录参数
	let uniAccountIns = uniAccount.initWeixin({
		appId: appId,
		secret: appSecret
	})
	if (mptype === 'qq') {
		uniAccountIns = uniAccount.initQQ({
			appId: appId,
			secret: appSecret
		})
	}
	let res = await uniAccountIns.code2Session(code);
	let timeStamp = new Date().getTime()
	// let user = await db.collection('wz_user').where({
	// 	unionid: res.unionid,
	// 	openid: res.openid
	// }).get();
	let user = await db.collection('wz_user').where(dbCmd.or([
		{
			unionid: res.unionid
		},
		{
			openid: res.openid
		}
	])).get();
	let newdate = {};
	// 判断用户是否存在
	if (user.data.length === 0) {
		let newdate = {
			openid: res.openid,
			unionid: res.unionid,
			name,
			avatar: avatarUrl,
			score: 0,
			status: 0,
			mp: mptype,
			create_at: timeStamp,
			level: 1
		};
		let user_new = await db.collection('wz_user').add(newdate);
	} else if (isLogin && status === 0) {
		const User = user.data[0]
		let originAvatar = User.originAvatar
		if (User.status === 0 || updateOrigin) {
			const avatarImg = await uniCloud.httpclient.request(avatarUrl, {
				method: 'GET'
			})
			if (avatarImg && avatarImg.data) {
				let ext = avatarImg.headers['content-type'].split('/')[1] || 'jpeg'
				let avatarRes = await uniCloud.uploadFile({
					cloudPath: `/upload/user/avatar/origin/${User._id}_${String(Math.random()*100000).split('.')[0]}.${ext}`,
					fileContent: avatarImg.data
				});
				originAvatar = avatarRes.fileID
				await db.collection('wz_user_avatar_record').add({
					create_at: new Date().getTime(),
					src: originAvatar,
					userId: User._id,
					name: User.name,
				})
			}
		}
		let user_update = await db.collection('wz_user').doc(User._id).update({
			name: name,
			avatar: avatarUrl,
			originAvatar,
			status: 1,
			update_at: timeStamp,
			last_login_time: timeStamp
		})
		console.log('user_update',user)
		// 判断是否是被邀请用户
		if (userId && userId !== User._id && User.status === 0) {
			const score = await getConfigKey('inviteIntegral')
			if (score) {
				// console.log('score', score)
				var userList = await db.collection('wz_user').doc(userId).get()
				if (userList.data) {
					// 给用户增加积分
					var userResult = await db.collection('wz_user').doc(userId).update({
						'score': dbCmd.inc(score)
					})
					if (userResult.updated === 1) {
						// 添加积分记录
						let signResult = await db.collection('wz_score_record').add({
							status: 1,
							name: '邀请 ' + name + ' 奖励积分',
							score: score,
							user_id: userId,
							create_at: timeStamp
						})
						let invited = await db.collection('wz_invite_record').add({
							status: 1,
							score: score,
							user_id: User._id,
							invited_id: userId,
							create_at: timeStamp
						})
					}
				} else {
					console.log('未找到邀请用户')
				}
			}
		}
	}
	let account = user.data[0]
	if (account && !account.unionid) {
		await db.collection('wz_user').doc(account._id).update({
			unionid: res.unionid
		})
	}
	// 查询最新的数据
	let result = await db.collection('wz_user').where({
		openid: res.openid,
		unionid: res.unionid,
	}).field({
		name: true,
		avatar: true,
		score: true,
		status: true,
		mp: true,
		_id: true,
		level: true,
		originAvatar: true,
	}).get();
	console.log('登录用户', result)
	if (result.data.length > 0) {
		return {
			code: 0,
			success: true,
			data: result.data[0],
			msg: '登录成功'
		}
	} else {
		return {
			code: 1,
			data: null,
			success: false,
			msg: '用户不存在'
		}
	}
};
