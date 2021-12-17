<template>
	<fui-page className="fui-flex-center fui-bgc-fff fui-flex-col" @tap="jump">
		<u-loading-icon mode="circle" size="65" color="#2979ff"></u-loading-icon>
		<view class="fui-tac fui-mt10" v-if="showTips">
			<text class="fui-fs14 fui-c-888">{{ tips }}</text>
		</view>
	</fui-page>
</template>

<script>
	export default {
		data() {
			return {
				tips: '请轻触屏幕继续',
				showTips: false
			}
		},
		onLoad() {
			if (this.defaultIndex) {
				this.init()
			}
		},
		watch: {
			defaultIndex() {
				this.init()
			}
		},
		methods: {
			init() {
				if (/^wx/.test(this.defaultIndex)) {
					this.$data.showTips = true
				} else {
					uni.reLaunch({
						url: this.defaultIndex
					})
				}
			},
			jump() {
				uni.navigateToMiniProgram({
				  appId: this.defaultIndex,
				  extraData: {
				    'source': 'falost'
				  },
				  success: (res) => {
				    // 打开成功
						uni.reLaunch({
							url: '/pages/index/home'
						})
				  },
					fail(e) {
						console.log(e)
					}
				})
			}
		}
	}
</script>

<style>

</style>
