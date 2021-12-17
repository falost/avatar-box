<script>
	export default {
		onLaunch: async function () {
			
			// 将vuex方法挂在到$u中
			// 使用方法为：如果要修改vuex的state中的user.name变量为"史诗" => this.$u.vuex('user.name', '史诗')
			// 如果要修改vuex的state的version变量为1.0.1 => this.$u.vuex('version', '1.0.1')
			
			this.$u.vuex = (name, value) => {
				this.$store.commit('$uStore', {
					name, value
				})
			}
			console.log('App Launch')
			/* uni.login({
			  provider: 'weixin',
			  success: ({ code }) =>  {
			    console.log('code', code);
			    // 获取用户信息
			    uni.getUserInfo({
			      provider: 'weixin',
			      success: (infoRes) => {
			        console.log('用户昵称为：' + infoRes.userInfo.nickName);
			      }
			    })
			  }
			}); */
			let config = await uniCloud.callFunction({
				name: 'config_map',
				data: {
					'keys': ['shareTitle', 'bannerAdId', 'videoAdId', 'defaultIndex', 'notice']
				},
			})
			if(config.result.code === 0) {
				this.$u.vuex('vuex_shareTitle', config.result.data.shareTitle || this.vuex_shareTitle)
				this.$u.vuex('bannerAdId', config.result.data.bannerAdId || this.bannerAdId)
				this.$u.vuex('videoAdId', config.result.data.videoAdId || this.videoAdId)
				this.$u.vuex('defaultIndex', config.result.data.defaultIndex || this.defaultIndex)
				let showNotice = uni.getStorageSync('showNotice')
				let notice = uni.getStorageSync('notice')
				if (config.result.data.notice && notice !== config.result.data.notice) {
					this.$u.vuex('vuex_notice', config.result.data.notice)
				}
			}
			console.log(this.$refs)
			let token = uni.getStorageSync('token')
			if (token) {
				uni.checkSession({
				  success: (res) => {
						console.log('登陆未过期' ,res)
				    //session_key 未过期，并且在本生命周期一直有效
						this.$store.dispatch('setToken', token)
						this.$store.dispatch('getUserInfo', token).then(data => {
							// 判断当前用户登陆状态
							this.$u.vuex('isLogin', data.status > 0)
							this.$u.vuex('vuex_user', data)
							this.$u.vuex('vuex_avatar', data.avatar)
						})
				  },
				  fail () {
				    // uni.login() //重新登录
				  }
				})
			} else {
			  this.$LOGIN.init(1).then(async ({ code, userInfo }) => {
					console.log(code, userInfo)
					const invitedId = uni.getStorageSync('invitedId')
					this.$u.vuex('vuex_avatar', userInfo.avatarUrl)
					const { result } = await uniCloud.callFunction({
						name: 'user_auth',
						data: {
							name: userInfo.nickName,
							avatar: userInfo.avatarUrl,
							mptype: 'weixin',
							code: code,
							status: 0,
							userId: invitedId, // 邀请人用户 ID
						},
					})
					console.log(result)
					if (result.code === 0) {
						this.$u.vuex('vuex_user', result.data)
						this.$u.vuex('vuex_avatar', result.data.avatar)
						this.$u.vuex('isLogin', result.data.status > 0)
						this.$store.dispatch('setToken', result.data._id)
					}
				})
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
	@import 'common/fui.scss';
	/* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
	@import "common/common.scss";
	page {
	  background-color: #f4f5f6;
	  height: 100%;
	  font-size: 16px;
	  line-height: 1.8;
	  .pages {
	    min-height: 100vh;
	  }
	}
	/*每个页面公共css */
	::-webkit-scrollbar {
	  display: none;
	  width: 0 !important;
	  height: 0 !important;
	  -webkit-appearance: none;
	  background: transparent;
	}
	view {
		box-sizing: border-box;
	}

</style>
