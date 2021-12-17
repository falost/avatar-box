<template>
	<fui-page class="fui-flex fui-flex-col">
		<view class="body">
			<u-navbar v-if="!isHome" :border-bottom="false" :background="background" :back-icon-color="color"></u-navbar>
			<view class="page-bg">
				<image :src="backgroundImg" mode=""></image>
			</view>
			<view class="page-title fui-tac" :style="{color: color}">
				<text class="letter" :key="index" :style="'--t:' + index" v-for="(word,index) in subTitle">{{ word }}</text>
			</view>
			<view class="fui-flex fui-flex-between fui-mt25 fui-ml15 fui-mr15">
				<view class="page-avatar-box">
					<view class="page-avatar">
						<image :src="avatarSrc" mode="" show-menu-by-longpress="true"></image>
					</view>
				</view>
			</view>
			<view class="banner-ad fui-mt15 fui-ml10 fui-mr10 fui-mb10" v-if="bannerAdId">
				<ad :unit-id="bannerAdId" ad-intervals="35" @load="adLoad" @error="adError" @close="adClose"></ad>
			</view>
			<view class="page-btns fui-flex-between fui-flex-wrap fui-mt15 fui-pl15 fui-pr15">
				<button class="fui-fs14 fui-c-666 fui-fw400 fx1" @tap="replaceAvatar">再来一张</button>
				<button class="fui-fs14 fui-c-666 fui-fw600 fx1 fui-ml15 save" open-type="share">分享好友</button>
			</view>
			<view class="banner-ad fui-mt15 fui-mb15" v-if="bannerAdId">
				<ad :unit-id="bannerAdId" ad-intervals="35" @load="adLoad" @error="adError" @close="adClose"></ad>
			</view>
		</view>
		<view class="page-copy fui-tac fui-flex-center">
			<text class="fui-fs12" :style="{color: color}">&copy;悟哉 出品</text>
			<button open-type="contact" :style="{color: color}" @contact="onContact"
				class="fui-fs12 fui-ml10 fui-fw200">联系客服</button>
		</view>
	</fui-page>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					backgroundColor: 'rgba(0,0,0,0)'
				},
				isHome: false,
				avatarSrc: '',
				imageBill: '',
				shareTitle: [],
				logo: '',
				backgroundImg: '',
				subTitle: '恭喜您，头像保存成功~',
				color: 'rgba(0,0,0,1)'
			}
		},
		watch: {
		},
		computed: {
		},
		onLoad(query) {
			this.$data.imageBill = uni.getStorageSync('imageBill') || ''
			this.$data.avatarSrc = query.url || this.$data.imageBill
			this.$data.isHome = this.defaultIndex === `/${this.$scope.route}`
			this.init()
		},
		onReady() {
		},
		onShareAppMessage(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/pages/avatar/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.imageBill,
			}
		},
		onShareTimeline(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/pages/avatar/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.imageBill,
			}
		},
		methods: {
			async init() {
				this.getConfig()
			},
			async getConfig() {
				let config = await uniCloud.callFunction({
					name: 'config_map',
					data: {
						'keys': ['borderShreTitle', 'borderResultBackgroundImg', 'borderResultFontColor', 'instructions’'],
						'label': 'border'
					},
				})
				if (config.result.code === 0) {
					this.$data.shareTitle = config.result.data.borderShreTitle || this.vuex_shareTitle
					this.$data.backgroundImg = config.result.data.borderResultBackgroundImg
					this.$data.color = config.result.data.borderResultFontColor
				}
			},
			auth() {
				this.$auth().then(res => {
					console.log(res)
					this.$data.avatarSrc = res.avatar
					this.$data.isWeChatAvatar = true
					this.$data.isUpload = false
				})
			},
			replaceAvatar() {
				uni.navigateBack({
					delta: 1
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	$color: #FBD39A;

	/deep/ .u-border-bottom:after {
		display: none;
	}

	.pages {
		.body {
			min-height: calc(100vh - 25px);
		}
		.page-bg {
			position: fixed;
			top: 0;
			left: 0;
			z-index: -1;
			width: 100vw;
			height: 100vh;

			image {
				height: 100%;
				width: 100%;
			}
		}

		.page-title {
			color: $color;
			line-height: 18px;
			.letter {
				animation: tiaodong 0.75s cubic-bezier(0.05, 0, 0.2, 1) infinite alternate;
				display: inline-block;
				transform: translate3d(0, 0, 0);
				animation-delay: calc(0.1s * var(--t));
				// animation-play-state: running;
			}
		}

		.page-avatar-box {
			background-color: #fff;
			border-radius: 14px;
			width: calc(100vw - 80px);
			height: calc(100vw - 80px);
			margin: auto;
			overflow: hidden;

			.page-avatar {
				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 10px;
				background-color: #F1F1F1;
				border: 0.5px solid #f1f1f1;
				overflow: hidden;

				>image {
					display: block;
					width: 100%;
					height: 100%;
					// transform: scale(0.99);
					overflow: hidden;
					border-radius: 10px;
				}
			}
		}

		.page-btns {
			padding: 0 40px;
			button {
				width: 100px;
				height: 36px;
				line-height: 36px;
				border-radius: 18px;
				&::after {
					border-radius: 36px;
				}
				&.save {
					background-color: $color;
					// background-color: #F55341;
					color: #F55341;
				}
			}
		}
		.page-copy {
			line-height: 25px;
			color: $color;
			button {
				background: none;
				color: #F1F1F1;
				border: none;
				padding: 0;
				line-height: 14px;
				border-radius: 0;
				&::after {
					display: none;
				}
			}
		}
	}

	@keyframes tiaodong {

		0%,
		40%,
		100% {
			transform: translate3d(0, 0, 0);
		}

		20% {
			transform: translate3d(0, -10px, 0);
		}
	}

</style>
