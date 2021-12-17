<!--
 * @Descripttion: 根节点
 * @version:
 * @Author: falost
 * @Date: 2021-07-08 19:15:42
 * @LastEditors: falost
 * @LastEditTime: 2021-07-28 16:09:09
-->
<template>
  <view class="pages" :class="style" :style="'--statusBarHeight: ' + (statusBarHeight) + 'px'">
    <slot />
		<official-account v-if="official" class="official-account" bindload="loadOfficial"></official-account>
		<u-toast ref="uToast" />
		<u-notify ref="uTips" :safeAreaInsetTop="true"></u-notify>
		<u-overlay :show="showMask"@click="closeMask">
			<view class="fui-flex-center">
				<u-loading-icon text="加载中" textSize="18"></u-loading-icon>
			</view>
		</u-overlay>
		<u-modal v-if="showNotice" :show="showNotice" title="公告" confirm-color="#36B0F6" :title-style="{color: '#333'}" @confirm="confirmNotice">
			<view class="slot-content fui-fs12 fui-c-888">
				<rich-text :nodes="notice"></rich-text>
			</view>
		</u-modal>
		<view class="add-tips" :class="isFullscreen ? '' : 'fullscreen'" v-if="addTips">
			<view class="add-tips-text" v-if="!showTipsText">
				<view class="arrow"></view>
				<text @click="showTipsText = true">点击「添加到我的小程序」下次访问不迷路 ></text>
			</view>
			<view class="add-tips-step" v-if="showTipsText">
				<view class="one">
					<text class="fui-fs16 fui-fw500 fui-mr5">1.点击</text>
					<image src="https://falost.gitee.io/static/images/fav-01.jpg" mode="widthFix"></image>
				</view>
				<view class="two fui-mt5">
					<text class="fui-fs16 fui-fw500">2.点击「添加到我的小程序」</text>
					<image src="https://falost.gitee.io/static/images/fav-02.png" mode="widthFix"></image>
				</view>
				<view class="three fui-mt5">
					<text class="fui-fs16 fui-fw500">3.微信首页下拉，找到 falost 快速进入小程序</text>
					<image src="https://falost.gitee.io/static/images/fav-03.png" mode="widthFix"></image>
				</view>
				<view class="know">
					<u-button type="primary" text="朕知道了!" shape="circle" @click="closeTips"></u-button>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
  name: '',
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  pageLifetimes: {
    show: function() {
      // 页面被展示
      console.log('show')
    },
    hide: function() {
      // 页面被隐藏
      console.log('hide')
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  },
  data() {
    return {
			showMask: false,
			notice: '',
			showNotice: false,
			addTips: false,
			showTipsText: false,
			isFullscreen: true,
			statusBarHeight: 0,
			official: true
		}
  },
  computed: {
    style() {
      return `${this.className || ''} ${this.role || ''}`
    }
  },
  watch: {
		vuex_notice(val) {
			if (val) {
				this.$data.showNotice = true
				this.$data.notice = this.vuex_notice || ''
			}
		}
	},
  onLoad() {
  },
  onShow() {
		
	},
	mounted() {
		console.log(uni.getSystemInfoSync())
		console.log(123, uni.getStorageSync('addTips'))
		this.$data.addTips = !(uni.getStorageSync('addTips') === true)
		let sysInfo = uni.getSystemInfoSync()
		if (sysInfo.screenHeight > sysInfo.windowHeight) {
			this.$data.isFullscreen = false
		}
		this.$data.statusBarHeight = sysInfo.statusBarHeight
		this.loadOfficial()
	},
  onReady() {},
  onHide() {},
  onUnload() {},
  onResize() {},
  onBackPress() {},
  methods: {
		loadOfficial() {
			setTimeout(() => {
				this.$data.official = false
				console.log('关闭显示')
			},  10000)
		},
		confirmNotice() {
			uni.setStorageSync('notice', this.vuex_notice)
			this.$data.showNotice = false
		},
		showToast(message = '标题', type = 'default', duration = 2000) {
			return this.$refs.uToast.show({
				message,
				type,
				duration,
				icon: false
			});
		},
		showTips(message = '标题', type = 'success', top = 0, duration = 2300, bgColor, color) {
			return this.$refs.uTips.show({
				message,
				type,
				duration,
				bgColor,
				top,
				safeAreaInsetTop: true
			})
		},
		closeTips() {
			uni.setStorageSync('addTips', true)
			this.$data.addTips = false
		}
	}
}
</script>
<style lang="scss" scoped>

.pages {
	.official-account {
	  position: fixed;
	  top: calc(44px + var(--statusBarHeight));
	  left: 0;
	  width: 100%;
		z-index: 99;
	}
	.slot-content {
		max-height: 50vh;
		overflow-x: auto;
	}
	.add-tips {
		position: relative;
		z-index: 999;
		&.fullscreen {
			.add-tips-text {
				top: 10px;
			}
			.add-tips-step {
				padding-top: 30px;
			}
		}
		.add-tips-text {
			position: fixed;
			top: calc(54px + var(--statusBarHeight));
			right: 0;
			font-size: 12px;
			background: rgba(0,0,0,0.65);
			color: #fff;
			border-radius: 12px;
			padding: 6px 8px;
			line-height: 12px;
			.arrow {
				width: 0;
				height: 0;
				right: 60px;
				border-width: 10px;
				border-style: solid;
				border-color: transparent transparent rgba(0,0,0,0.65) transparent;
				position: absolute;
				top: -20px;
				border-right-width: 12px;
				border-left-width: 12px;
				border-top-width: 12px;
				border-bottom-width: 8px;
			}
		}
		.add-tips-step {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			padding: 15px;
			padding-top: 80px;
			background-color: rgba(255,255,255, 0.9);
			box-sizing: border-box;
			image {
				width: 100%;
			}
			.one {
				image {
					width: 65px;
					vertical-align: middle;
					border-radius: 13px;
					overflow: hidden;
					border: 1px solid #ddd;
				}
			}
			.know {
				width: 100px;
				margin: 20px auto 0;
			}
		}
	}
}
</style>
<style>
	.pages ::v-deep .u-popup {
		flex: inherit;
	}
</style>