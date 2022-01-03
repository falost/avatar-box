<template>
	<fui-page :head="head" class="wrapper">
		<view class="list fui-p15 fui-flex fui-flex-wrap fui-flex-between">
			<template v-for="(cover, i) in coverList">
				<view class="list-item fui-mb15 bg"  @click="goDetail(cover._id)" :key="i">
					<image :src="cover.pic" mode="widthFix" class="list-item-img"></image>
				</view>
				
				<view class="banner-ad fui-mb10" v-if="bannerAdId && (i + 1) % 9 === 0 && !(i === coverList.length - 1)">
					<ad :unit-id="bannerAdId" ad-intervals="30" @load="adLoad" @error="adError" @close="adClose"></ad>
				</view>
			</template>
			<template v-if="coverList.length > 1 && coverList.length % 3 > 0">
				<view class="list-item fui-mb15 placeholder" :key="index" v-for="(item,index) in (3 - coverList.length % 3)">
					<view class="image"></view>
				</view>
			</template>
		</view>
		<view class="banner-ad fui-ml15 fui-mr15 fui-mb10" v-if="bannerAdId">
			<ad :unit-id="bannerAdId" ad-intervals="30" @load="adLoad" @error="adError" @close="adClose"></ad>
		</view>
		<view class="load-more">
			<u-loadmore :status="loadStatus" :fontSize="12" margin-top="30rpx" margin-bottom="20rpx" color="#B8B8B8" :loadmoreText="loadText.loadmore" :loadingText="loadText.loading" :nomoreText="loadText.nomore"/>
		</view>
	</fui-page>
</template>

<script>
	export default {
		data() {
			return {
				head: {
					title: '封面',
					fixed: true,
				},
				coverList: [],
				tips: [],
				loadText: {
					loadmore: '轻轻上拉',
					loading: '努力加载中',
					nomore: '更多的封面正在添加路上'
				},
				loadStatus: '',
				hasMore: false,
			}
		},
		onLoad() {
			this.init()
		},
		onShareAppMessage(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/red_cover/pages/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.shareImg
			}
		},
		onShareTimeline(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/red_cover/pages/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.shareImg
			}
		},
		onReachBottom() {
			this.getCoverList(false)
		},
		methods: {
			init() {
				this.getConfig()
				this.getCoverList()
			},
			goDetail(id){
				uni.navigateTo({
					url: `/red_cover/pages/detail?id=${id}`
				});
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
					this.$data.head.title = config.result.data.title || '红包封面'
					this.$data.shareTitle = config.result.data.shareTitle
					this.$data.shareImg = config.result.data.shareImg
				}
			},
			async getCoverList(on = 1) {
				this.$data.emptyText = '正在加载中~'
				if (on === 1) {
					this.$data.pageIndex = 0
				} else if (!this.$data.hasMore) return
				
				this.$data.pageIndex = this.$data.pageIndex + 1
				this.$data.loadStatus = 'loading'
				const {
					result
				} = await uniCloud.callFunction({
					name: 'query_list',
					data: {
						dbName: "wz_red_cover_list",
						filter: {
							"status": 1
						},
						order: {
							"name": "sort",
							"type": "desc"
						},
						pageIndex: this.$data.pageIndex,
						pageSize: 20
					},
				}).catch(() => {
					this.$data.loadStatus = 'loadmore'
				})
				uni.hideLoading()
				if (result.code === 0) {
					if (result.data.hasMore) {
						this.$data.loadStatus = 'loadmore'
					} else {
						this.$data.loadStatus = 'nomore'
					} 
					this.$data.hasMore = result.data.hasMore
					const list = result.data.list || []
					if (on === 1) {
						this.$data.coverList = list
					} else {
						this.$data.coverList = [...this.$data.coverList, ...(list)]
					}
				} else {
					this.$data.emptyText = result.msg
					this.$data.hasMore = false
				}
			},
			scrollLoad() {
				this.getCoverList(false)
			},
		}
	}
</script>

<style lang="scss">
	.wrapper {
		.list{
			.banner-ad {
				max-width: 100%;
				width: 100%;
			}
			&-item{
				position: relative;
				width: calc((100% - 20px) / 3);
				box-shadow: 0px 15px 10px -15px #000;
				&.placeholder {
					box-shadow: none;
				}
				&.bg::after {
					content: "";
					display: block;
					position: absolute;
					z-index: 10;
					bottom: 0;
					left: 0;
					right: 0;
					width: 100%;
					height: 100%;
					background: url(https://falost.gitee.io/static/images/cover/red_cover_02.png) no-repeat;
					background-size: contain;
					background-position: bottom;
					border-radius: 8px 8px;
				}
				&-img{
					display: block;
					margin: auto;
					width: 100%;
					height: 180px;
					border-radius: 8px 8px;
				}
			}
		}
	
	}
</style>
