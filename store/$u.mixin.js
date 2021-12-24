import { mapState } from 'vuex'
import store from "@/store"

// 尝试将用户在根目录中的store/index.js的vuex的state变量，全部加载到全局变量中
let $uStoreKey = [];
try {
	$uStoreKey = store.state ? Object.keys(store.state) : [];
} catch (e) {
	
}
module.exports = {
	data() {
		return {
			shareTitle: []
		}
	},
	beforeCreate() {
	},
	computed: {
		// 将vuex的state中的所有变量，解构到全局混入的mixin中
		...mapState($uStoreKey),
		STATIC() {
			return this.$static || ''
		}
	},
	watch: {
		vuex_user: (data) => {
			if (data) {
				uni.setStorageSync('level', data.level || 1)
				uni.setStorageSync('token', data._id)
				uni.setStorageSync('score', data.score || 0)
			}
		}
	},
	async onLoad(e) {
		const { userId, detailId, index } = e
		console.log('e', e )
		
		if (userId) uni.setStorageSync('invitedId', userId)
	},
	methods: {
		$toast(title, type, duration) {
			return this.$root.$children[0].showToast(title, type, duration)
		},
		$tips(title, type, top, duration) {
			return this.$root.$children[0].showTips(title, type, top, duration )
		},
		adLoad() {
			console.log('Banner 广告加载成功')
		},
		adError(err) {
			console.log('Banner 广告加载失败', err)
		},
		adClose() {
			console.log('Banner 广告关闭')
		},
		$jumpLink(path, type = 1, appid, body = {}) {
			return new Promise((resolve, reject) => {
				if (type === 1) {
					uni.navigateTo({
						url: path,
					  success(res) {
					    // 打开成功
							resolve(res)
					  },
						fail: (err) => {
							reject(err)
						}
					})
				} else if (type === 2) {
					uni.navigateToMiniProgram({
					  appId: appid || path,
					  path: appid && path,
					  extraData: {
					    'source': 'falost',
							...(body || {})
					  },
					  success(res) {
					    // 打开成功
							resolve(res)
					  },
						fail: (err) => {
							reject(err)
						}
					})
				} else if (item.type === 3) {
					uni.navigateTo({
						url: '/pages/web/index?url=' + path,
					  success(res) {
					    // 打开成功
							resolve(res)
					  },
						fail: (err) => {
							reject(err)
						}
					})
				}
			})
		},
		$back() {
			let pages = getCurrentPages()
			console.log(pages)
			if (pages.length <= 1) {
				return uni.reLaunch({
					url: '/pages/index/index'
				})
			}
			uni.navigateBack({
				delta: 1,
				animationType: 'pop-out',
				animationDuration: 200
			})
		},
		$auth() {
			return new Promise((reslove, reject) => {
				this.$LOGIN.init().then(async ({
					code,
					userInfo,
					isLogin,
					cancel
				}) => {
					console.log(code, userInfo, isLogin, cancel)
					if (!isLogin && cancel) return
					const invitedId = uni.getStorageSync('invitedId')
					const {
						result
					} = await uniCloud.callFunction({
						name: 'user_auth',
						data: {
							name: userInfo.nickName,
							avatar: userInfo.avatarUrl,
							mptype: 'weixin',
							code: code,
							status: 0,
							isLogin: true,
							userId: invitedId, // 邀请人用户 ID
						},
					})
					console.log(result)
					if (result.code === 0) {
						this.$toast('授权成功')
						this.$u.vuex('vuex_user', result.data)
						this.$u.vuex('vuex_avatar', result.data.avatar)
						this.$u.vuex('isLogin', result.data.status > 0)
						this.$store.dispatch('setToken', result.data._id)
						reslove(result.data)
					} else {
						this.$toast(result.msg)
						reject()
					}
				})
			})
		},
	}
}