<template>
	<fui-page :head="head" class="wrapper">
		<view class="cover">
			<image :src="coverDetail.pic" mode="" class="cover-img"></image>
		</view>
		<view class="banner-ad fui-mt15 fui-ml15 fui-mr15 fui-mb10" v-if="bannerAdId">
			<ad :unit-id="bannerAdId" ad-intervals="30" @load="adLoad" @error="adError" @close="adClose"></ad>
		</view>
		<view class="func">
			<button plain class="func-btn" @click="lookAd" v-if="coverDetail.type === 1 && !lockEdInfo.isLocked">
				<image src="/static/images/cover/video.png" class="func-btn-img"></image>
				<text>观看视频领取</text>
			</button>
			<button plain class="func-btn success" @click="getCover" v-if="lockEdInfo.isLocked || coverDetail.type === 2">
				<text>领取封面</text>
			</button>
		</view>
		<view class="fui-m10 fui-p15 fui-bgc-fff fui-tac">
			<text class="fui-fs14">{{ coverDetail.get_desc }}</text>
		</view>
		<view class="fui-tac">更多封面 👇👇👇</view>
		<view class="more fui-m10 fui-bgc-fff">
			<view class="fui-flex-center-y more-item fui-p15 fui-line-b" v-for="(item,index) in coverList" :key="item._id" @tap="goDetail(item._id)">
				<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-298ded81-a496-47bd-a034-ccc7f0b4eb56/f4e7016c-867c-4e92-a53c-ed6edcc91f5b.png" mode="widthFix"></image>
				<view class="fx1 fui-ml15">
					<view class="">
						<text class="fui-fs14 fui-fw500">{{ item.name }}</text>
					</view>
					<view class="get_desc">
						<text class="fui-fs12 fui-c-666">{{ item.get_desc }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="page-copy fui-tac fui-flex-center">
			<text class="fui-fs12">&copy;悟哉 出品</text>
			<button open-type="contact" class="fui-fs12 fui-ml10 fui-fw200 contact">联系客服</button>
		</view>
		<u-modal :show="modalShow" title="领取方式(点击复制内容)" confirm-color="#36B0F6" @confirm="closeModal">
			<view class="slot-content fui-fs12 fui-c-888">
				<text user-select decode class="modal-content-body-getdesc">{{ coverDetail.get_desc }}</text>
			</view>
		</u-modal>
	</fui-page>
</template>

<script>

var rewardedVideoAd = null
export default {
	data() {
		return {
			head: {
				title: '封面详情'
			},
			id: '',
			modalShow: '',
			coverDetail: {
				inviteLockNum: 0,
				lookVideoLockNum: 0,
				get_desc: "",
			},
			lockEdInfo: {
				inviteLockNum: 0,
				lookVideoLockNum: 0,
				isLocked: false,
			},
			ad: '',
			showInterAds: true,
			coverList: []
		};
	},
	onLoad(query) {
		this.$data.id = query.id
		this.getCoverDetail(true)
		this.getConfig()
		this.getRodom()
	},
	onShow(e) {
		this.getCoverDetail(false)
	},
	onShareAppMessage(res) {
		return {
			title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
			path: '/red_cover/pages/detail?userId=' + this.vuex_user._id + '&id=' + this.$data.id,
			imageUrl: this.$data.shareImg
		}
	},
	onShareTimeline(res) {
		return {
			title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
			path: '/red_cover/pages/detail?userId=' + this.vuex_user._id + '&id=' + this.$data.id,
			imageUrl: this.$data.shareImg
		}
	},
	methods: {
		handle(){
			return
		},
		async getConfig() {
			let config = await uniCloud.callFunction({
				name: 'config_map',
				data: {
					'keys': ['shareTitle', 'shareImg', 'title'],
					'label': 'redCover'
				},
			})
			if(config.result.code === 0) {
				this.$data.config = config.result.data
				this.$data.shareTitle = config.result.data.shareTitle
				this.$data.shareImg = config.result.data.shareImg
			}
		},
		
		goDetail(id){
			uni.redirectTo({
				url: `/red_cover/pages/detail?id=${id}`
			});
		},
		async getCoverDetail(isFirst){
			uni.showLoading({
				title: '加载中'
			})
			const { result } = await uniCloud.callFunction({
				name: 'query_map',
				data: {
					dbName: 'wz_red_cover_list',
					id: this.$data.id
				}
			})
			if (result.code === 0) {
				let detail = result.data
				this.$data.head.title = detail.name
				uni.setNavigationBarTitle({
					title: detail.name
				})
				if (detail.type === 1) {
					this.adInit('adunit-2e824a33cb7f65f4')
				} else {
					setTimeout(() => {
						this.showInterAd()
					}, 1500)
				}
				this.$data.coverDetail = detail
				
			} else {
				this.$tips(result.msg, 'error')
			}
			uni.hideLoading()
		},
		
		async getRodom() {
			const { result } = await uniCloud.callFunction({
				name: 'query_list',
				data: {
					dbName: 'wz_red_cover_list',
					filter: {
						status: 1
					},
					aggregate: true,
					sample: 2,
				}
			})
			if (result.code === 0) {
				let list = result.data.list
				this.$data.coverList = list
			}
		},
		lookAd() {
			rewardedVideoAd.show().catch(() => {
				rewardedVideoAd
					.load()
					.then(() => rewardedVideoAd.show())
					.catch(err => {
						uni.showToast({
							title: '调起视频失败，请稍后再试',
							icon: 'none',
							duration: 2000
						});
						console.log('激励视频 广告显示失败');
					});
			});
		},
		//初始化视频广告
		adInit(adUnitId) {
			if (wx.createRewardedVideoAd) {
				rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: adUnitId });
				rewardedVideoAd.onLoad(() => {
					console.log('Ad onLoad event emit');
				});
				rewardedVideoAd.onError(err => {
					console.log('Ad onError event emit', err);
				});
				rewardedVideoAd.onClose(res => {
					console.log('Ad onClose event emit', res);
					if (res && res.isEnded) {
						this.lockEdInfo.lookVideoLockNum++
						this.$data.lockEdInfo.isLocked = true
						console.log('正常播放结束，可以下发游戏奖励');
					} else {
						console.log('播放中途退出，不下发游戏奖励');
					}
				});
			}
		},
		//初始化插屏广告
		adinsertInit(adUnitId) {
			if (wx.createInterstitialAd) {
				interstitialAd = wx.createInterstitialAd({
					adUnitId: adUnitId
				})
				interstitialAd.onLoad(() => {
					interstitialAd.show().catch((err) => {
						console.error(err)
					})
				})
				interstitialAd.onError((err) => {})
				interstitialAd.onClose(() => {})
			}
		},
		openModal(){
			this.modalShow = true
		},
		closeModal(){
			this.modalShow = false
			this.handleCopy()
    },
		getCover() {
			if (this.$data.coverDetail.type === 1) {
				wx.showRedPackage({
					url: this.$data.coverDetail.get_url,
					success() {
						console.log('打开成功')
					},
					fail(e) {
						console.log(e)
					}
				})
			} else if (this.$data.coverDetail.type === 2){
				this.$data.modalShow = true
			}
		},
    handleCopy() {
      let data = this.$data.coverDetail.get_url || this.$data.coverDetail.get_desc;
      wx.setClipboardData({
        data: data,
        success(res) {},
      });
    },
	}
};
</script>

<style lang="scss">
.wrapper {
	.cover {
		background-image: url(https://res.wx.qq.com/a/wx_fed/money-envelope-cover/res/img/skin_bg.59803d00.png);
		background-size: 100% 100%;
		background-repeat: no-repeat;
		padding: 20px 0;
		margin: 10px 30px;
		&-img {
			width: 150px;
			height: 250px;
			margin: auto;
			border-radius: 8px;
			display: block;
		}
	}
	.func {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 300px;
		margin: auto;
		margin-bottom: 15px;
		&-btn {
			border: none;
			padding: 0 20px;
			height: 45px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			background-color: #fbd926;
			border-radius: 45px;
			margin-top: 15px;
			font-size: 18px;
			font-weight: 700;
			&.success{
				background-color: #07c160;
				color: #FFFFFF;
			}
			&-img {
				width: 18px;
				height: 18px;
				display: block;
				margin-right: 3px;
			}
		}
		&-or{
			width: 100%;
			text-align: center;
			margin-top: 15px;
			font-size: 14px;
		}
	}
	.more {
		.more-item {
			image {
				border-radius: 4px;
				width: 50px;
				height: 50px;
			}
			.get_desc {
				line-height: 16px;
				max-height: 34px;
				overflow: hidden;
			}
			&:last-child {
				border-bottom: none;
			}
		}
	}
	.modal{
		width: 100%;
		height: 100%;
		background-color: rgba(000, 000, 000, 0.7);
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		&-content{
			&-body{
				width: 300px;
				background-color: #FFFFFF;
				border-radius: 8px;
				&-title{
					font-size: 18px;
					color: #333333;
					font-weight: 700;
					text-align: center;
					margin-bottom: 15px;
				}
				&-getdesc{
					text-align: center;
					margin: auto;
					display: block;
				}
				&-question{
					margin: auto;
					display: block;
					border: none;
					font-size: 14px;
					color: #576b95;
					margin-top: 15px;
				}
			}
			&-cancel{
				width: 25px;
				height: 25px;
				margin: auto;
				display: block;
				margin-top: 30px;
			}
		}
	}
}
</style>
