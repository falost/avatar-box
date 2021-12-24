<template>
	<fui-page class="fui-flex fui-flex-col">
		<view class="body">
			<u-navbar :border-bottom="false" safeAreaInsetTop :fixed="false" bgColor="rgba(0,0,0,0)" @leftClick="$back">
				<view slot="left">
					<u-icon
						name="arrow-left"
						size="19"
						:color="color"
					></u-icon>
				</view>
			</u-navbar>
			<view class="page-bg">
				<image :src="backgroundImg" mode=""></image>
			</view>
			<view class="page-title fui-tac" :style="{color: color}">
				<text class="letter" :key="index" :style="'--t:' + index" v-for="(word,index) in subTitle">{{ word }}</text>
			</view>
			<view class="fui-flex fui-flex-between fui-mt25 fui-ml15 fui-mr15">
				<view class="page-avatar-box">
					<view class="page-avatar">
						<image :src="avatarSrc" mode="" @tap="showBorder = !showBorder"></image>
						<view v-show="borderImage" class='user-hat' @touchstart='handleTouchStart'
							@touchmove.stop='handleTouchMove' :style='hatStyleStr'>
							<image :class="{border: showBorder}" class='hat' id='hat' :src="borderImage" :style='hatImgStyleStr' @tap="showBorder = true"></image>
							<view v-show="showBorder" class='rotate' id='rotate' :style='rotateStyleStr'>
								<!-- <u-icon name="reload" id='rotate' class="fui-c-fff"></u-icon> -->
								<image src="/static/images/change.png" class="rotate-icon" id='rotate'></image>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="page-btns fui-flex-between fui-flex-wrap fui-mt15 fui-pl15 fui-pr15">
				<button class="fui-fs14 fui-c-666 fui-fw400 fx1" @tap="changeImage">选择头像</button>
				<button class="fui-fs14 fui-c-666 fui-fw600 fx1 fui-ml15 save" @tap="saveAvatar">保存头像</button>
			</view>
			<view class="page-canvas">
				<canvas canvas-id="canvas" :style="{width: canvas.width + 'px', height: canvas.height + 'px'}"></canvas>
			</view>
			<view class="banner-ad fui-mt15 fui-ml10 fui-mr10 fui-mb10" v-if="bannerAdId">
				<ad :unit-id="bannerAdId" ad-intervals="35" @load="adLoad" @error="adError" @close="adClose"></ad>
			</view>
			<view class="page-pendant-box fui-mt20 fui-m15 fui-p10">
				<scroll-view scroll-with-animation="true" :scroll-into-view="`type_${borderType}`" :scroll-left="scrollLeft" scroll-x="true"
					class="page-pendant-table fui-flex fui-mb15" enable-flex="true">
					<view class="_table-item fui-mr10" :id="`type_${item.type}`" v-for="(item, index) in borderCategory" :key="index"
						:class="{'_active': borderType === item.type}" @click="changeBorderCategory(item)">
						<text class="fui-fs15 fui-fw400 fui-c-333">{{ item.name }}</text>
					</view>
				</scroll-view>
				<scroll-view scroll-with-animation="true" :scroll-left="scrollLeft" scroll-x="true"
					:scroll-into-view="`id_${borderId}`"
					class="fui-flex scroll-x page-pendant-list" @scroll="onScroll" enable-flex="true">
					<view :id="`id_${item._id}`" class="scroll-view-item fui-flex-center" v-for="(item, index) in borderList[borderType]"
						:key="item._id" @click="changeBorder(item)" :class="{'_active': borderId === item._id}">
						<image :src="item.origin && item.origin.url || item.image" mode=""></image>
					</view>
					<view class="fui-pl5"></view>
				</scroll-view>
			</view>
			<view class="banner-ad fui-mt15 fui-mb15" v-if="bannerAdId">
				<ad :unit-id="bannerAdId" ad-intervals="35" @load="adLoad" @error="adError" @close="adClose"></ad>
			</view>
			<view class="tips fui-mb15 fui-mt15 fui-tac">
				<text class="fui-fs14" :style="{color: color}" @tap="showInstructions = true">使用说明</text>
			</view>
		</view>
		<view class="page-copy fui-tac fui-flex-center">
			<text class="fui-fs12" :style="{color: color}">&copy;悟哉 出品</text>
			<button open-type="contact" :style="{color: color}" @contact="onContact"
				class="fui-fs12 fui-ml10 fui-fw200">联系客服</button>
		</view>
		<u-modal :show="showInstructions" title="使用说明" confirm-color="#36B0F6" @confirm="confirmInst">
			<view class="slot-content fui-fs12 fui-c-888">
				<rich-text :nodes="tipsContent"></rich-text>
			</view>
		</u-modal>
	</fui-page>
</template>

<script>
	export default {
		data() {
			return {
				scrollLeft: 0,
				avatarSrc: '',
				borderImage: '',
				canvasId: 'canvas',
				canvas: {
					width: 100,
					height: 100,
					background: '#ffffff'
				},
				background: {
					backgroundColor: 'rgba(0,0,0,0)'
				},
				dpi: 3,
				isHome: false,
				hasMore: true,
				borderList: {},
				borderCategory: [],
				borderType: 10,
				borderId: '',
				isWeChatAvatar: false,
				imageBill: '',
				logo: '',
				backgroundImg: '',
				subTitle: '',
				color: 'rgba(0,0,0,0)',
				shareTitle: [],
				showInstructions: false,
				tipsContent: '',
				showBorder: true,
				
				defaultHatWidth: 100,
				defaultHatHeight: 100,
				canvasTempFilePath: '',
				hatTop: 120,
				hatLeft: 120,
				currentHatTop: '',
				currentHatLeft: '',
				rotateTop: 0,
				rotateLeft: 0,
				beforeAngel: 45,
				currentRotateTop: '',
				currentRotateLeft: '',
				hatScale: 1,
				hatRotate: 0,
				touchTarget: '',
				currentPos: {
					x: '',
					y: ''
				}
			}
		},
		watch: {
			vuex_avatar(val) {
				this.$data.avatarSrc = val
			},
			token(val) {
				if (val) {
					this.$data.isWeChatAvatar = true
				}
			},
		},
		computed: {
			hatHalfWidth() {
				return this.defaultHatWidth / 2
			},
			hatRadius() {
				return Math.sqrt(2 * (this.hatHalfWidth) * (this.hatHalfWidth))
			},
			hatStyleStr() {
				return `transform:translate(${this.hatLeft}px,${this.hatTop}px)`
			},
			hatImgStyleStr() {
				return `transform:scale(${this.hatScale}) rotate(${this.hatRotate}deg)`
			},
			rotateStyleStr() {
				return `transform:translate(${this.rotateLeft}px,${this.rotateTop}px)`
			}
		},
		onLoad(query) {
			this.init(query)
			this.$data.isHome = this.defaultIndex === `/${this.$scope.route}`
		},
		onReady() {
			const systemInfo = uni.getSystemInfoSync()
			const screenWidth = (systemInfo.screenWidth - 50) * this.$data.dpi
			this.$data.screenWidth = screenWidth
			// 设置画布尺寸px
			this.$data.canvas.width = screenWidth
			this.$data.canvas.height = screenWidth
		},
		onShareAppMessage(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(
					/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/pages/avatar/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.imageBill,
			}
		},
		onShareTimeline(res) {
			return {
				title: (this.$data.shareTitle[Math.round(Math.random() * (this.$data.shareTitle.length - 1))]).replace(
					/\{username\}/, ((this.vuex_user && this.vuex_user.name) || '')),
				path: '/pages/avatar/index?userId=' + this.vuex_user._id,
				imageUrl: this.$data.imageBill,
			}
		},
		methods: {
			async init(query) {
				let type = Number(query.type) || 10
				this.$data.selectBorder = query.border || ''
				this.$data.borderType = type
				if (type === 10) {
					this.$data.subTitle = '领取您的专属圣诞帽-让您与众不同'
				} else {
					this.$data.subTitle = '领取您的专属头像挂件-让您与众不同'
				}
				if (this.token) {
					this.$data.isWeChatAvatar = true
					this.$data.avatarSrc = this.vuex_user.avatar
					this.$data.imageBill = uni.getStorageSync('imageBill') || ''
				}
				this.getConfig()
				await this.getBorderCategory()
				await this.getBorderImage()
				if (!uni.getStorageSync('showInstructions')) {
					this.$data.showInstructions = true
				}
				if (type) {
					this.$data.borderType = ''
					setTimeout(() => {
						this.$data.borderType = type
						
						let item = this.$data.borderCategory.find(item => item.type == type)
						if (item) {
							this.$data.logo = item.logo || this.$data.logo || ''
							this.$data.subTitle = item.subTitle || this.$data.subTitle || ''
							this.$data.backgroundImg = item.backgroundImg || this.$data.backgroundImg || ''
							this.$data.color = item.fontColor || this.$data.fontColor || ''
						}
					}, 100)
				}
			},
			onScroll: function(e) {
				// console.log(e)
				// if (this.$data.scrollLeftLock) return
				// if (this.$data.scrollLeft === e.detail.scrollLeft - 30) {
				// 	this.$data.scrollLeft = e.detail.scrollLeft + 30
				// } else {
				// 	this.$data.scrollLeft = e.detail.scrollLeft - 30
				// }
				// this.$data.scrollLeftLock = true
			},
			onContact(e) {
				console.log(e.detail.path)
				console.log(e.detail.query)
			},
			async getConfig() {
				let config = await uniCloud.callFunction({
					name: 'config_map',
					data: {
						'keys': ['borderShreTitle', 'borderBackgroundImg', 'borderFontColor', 'instructions'],
						'label': 'border'
					},
				})
				if (config.result.code === 0) {
					this.$data.config = config.result.data
					this.$data.shareTitle = config.result.data.borderShreTitle || this.vuex_shareTitle
					this.$data.backgroundImg = config.result.data.borderBackgroundImg
					this.$data.color = config.result.data.borderFontColor
					this.$data.tipsContent = config.result.data.instructions
				}
			},
			async getBorderImage(on = 1) {
				if (this.$data.borderList[this.$data.borderType]) return
				// 点击切换菜单 回复初始状态
				const type = this.$data.borderType || 0
				if (on === 1) {
					// this.$data.borderList[this.$data.borderType] = []
					this.$data.pageIndex = 0
				}
				this.$data.pageIndex = this.$data.pageIndex + 1
				const filter = {
					status: 1
				}
				if (type === 0) {
					filter.hot = 1
				} else {
					filter.type = type
				}
				const {
					result
				} = await uniCloud.callFunction({
					name: 'query_list',
					data: {
						dbName: "wz_border_image_urls",
						filter,
						order: {
							"name": "sort",
							"type": "asc"
						},
						pageIndex: this.$data.pageIndex,
						pageSize: 100
					},
				})
				if (result.code === 0) {
					if (result.data.hasMore) {
						this.$data.loadStatus = 'loadmore'
					} else {
						this.$data.loadStatus = 'nomore'
					}
					this.$data.hasMore = result.data.hasMore
					let list = [...(this.$data.borderList[this.$data.borderType] || []), ...(result.data.list || [])]
					this.$set(this.$data.borderList, `${this.$data.borderType}`, list)
					if (this.$data.selectBorder) {
						let item = list.find(item => String(item._id) === String(this.$data.selectBorder))
						this.changeBorder(item)
					} else {
						this.changeBorder(list[0])
					}
				}
			},
			async getBorderCategory() {
				const {
					result
				} = await uniCloud.callFunction({
					name: 'query_list',
					data: {
						dbName: "wz_border_image_category",
						filter: {
							status: 1,
						},
						order: {
							"name": "sort",
							"type": "asc"
						},
						pageIndex: 1,
						pageSize: 50
					},
				})
				if (result.code === 0) {
					this.$data.borderCategory = result.data.list /* .filter(item => item.type !== 10) */
				}
			},
			changeBorderCategory(item) {
				let type = item.type
				if (this.$data.dataType === 10 && type === 10) return
				if (type === 10) {
					this.$data.dataType = type
					this.$data.logo = item.logo || this.$data.config.borderLogo || ''
					this.$data.subTitle = item.subTitle || this.$data.config.subTitle || ''
					this.$data.backgroundImg = item.backgroundImg || this.$data.config.borderBackgroundImg || ''
					this.$data.color = item.fontColor || this.$data.config.borderFontColor || ''
					return this.getBorderImage()
				}
				if (type === 11) {
					return uni.navigateTo({
						url: '/pages/avatar/diy?type=' + type
					})
				}
				return uni.redirectTo({
					url: '/pages/avatar/index?type=' + type
				})
			},
			changeBorder(item) {
				if (!item.canEdit) {
					return uni.redirectTo({
						url: `/pages/avatar/index?type=${item.type}&border=${item._id || ''}`
					})
				}
				this.$data.scrollLeftLock = false
				if (this.$data.borderId === item._id) {
					this.$data.borderImage = ''
					this.$data.borderId = ''
				} else {
					this.$data.borderImage = item.origin && item.origin.url || item.image
					this.$data.borderId = item._id
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
			getOriginAvatar() {
				this.$data.avatarSrc = this.vuex_user.originAvatar || this.vuex_user.avatar
			},
			changeImage() {
				uni.showActionSheet({
					itemList: ['获取微信头像','拍摄', '从相册选择'],
					success: (res) => {
						console.log(res.tapIndex)
						if (res.tapIndex === 0) {
							this.auth()
						} else if (res.tapIndex === 1) {
							this.takePhoto()
						} else if (res.tapIndex === 2) {
							this.chooseImage()
						}
					},
					fail(res) {
						console.log(res.errMsg)
					}
				})
			},
			takePhoto() {
				uni.chooseMedia({
					count: 1,
					mediaType: ['image'],
					sourceType: ['camera'],
					maxDuration: 30,
					camera: 'front',
					success: (res) => {
						console.log(res.tempFiles)
						this.cutImage(res.tempFiles[0].tempFilePath)
					}
				})
			},
			chooseImage() {
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album'], //从相册选择
					success: (res) => {
						console.log(res.tempFilePaths);
						this.secCheck(res.tempFilePaths[0])
					}
				});
			},
			async secCheck(file) {
				console.log('file', file)
				let extension = file.substring(file.lastIndexOf('.') + 1)
				var random = String(Math.random() * 100000).split('.')[0]
				var now = new Date()
				var year = now.getFullYear()
				var month = (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)
				var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
				var hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
				var minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
				var seconds = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()
				let cloudPath =
					`/upload/images/user/avatar/${year}/${month}/${day}/${hours}${minutes}${seconds}_${String(Math.random()*100000).split('.')[0]}.${extension}`
				uni.showLoading({
					title: '正在安全检测'
				})
				await uniCloud.uploadFile({
					filePath: file,
					cloudPath: cloudPath
				}).then(async res => {
					let fileID = res.fileID
					await uniCloud.getTempFileURL({
						fileList: [res.fileID]
					}).then(async res => {
						if (res.fileList.length > 0) {
							let url = res.fileList[0].tempFileURL
							let timeout = setTimeout(() => {
								uni.hideLoading()
								this.$toast('安全检测超时~', 'error')
							}, 12000)
							const {
								result
							} = await uniCloud.callFunction({
								name: 'sec_ckeck',
								data: {
									url,
									fileID,
									userId: this.vuex_user._id || ''
								},
							})
							clearTimeout(timeout)
							timeout = null
							uni.hideLoading()
							if (result.code === 0) {
								this.cutImage(file)
							} else {
								this.$toast(result.msg, 'error')
							}
						} else {
							this.$toast('安全检测失败~', 'error')
						}
					});
				})
			},
			cutImage(file) {
				uni.navigateTo({
					url: `/pages/public/camera/camera?url=${file}`,
					events: {
						// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
						save: (data) => {
							console.log('data', data)
							this.$data.avatarSrc = data
							this.$data.isUpload = true
							this.$data.isWeChatAvatar = false
						}
					}
				})
			},
			saveAvatar() {
				uni.showLoading({
					title: '正在生成头像',
					mask: true
				})
				this.initCanvas()
			},
			initCanvas() {
				this.$data.ctx = uni.createCanvasContext(this.$data.canvasId)
				this.$data.ctx.setFillStyle(this.$data.canvas.background)
				this.$data.ctx.fillRect(0, 0, this.$data.canvas.width, this.$data.canvas.height)
				// 画用户头像
				this.drawAvatarUrlImage()
			},
			/* 绘制用户头像 */
			drawAvatarUrlImage() {
				let avatarSrc = this.$data.avatarSrc || ''
				if (avatarSrc && this.$data.isUpload) {
					this.$data.ctx.drawImage(avatarSrc, this.changeSize(0), this.changeSize(0), this.$data.screenWidth,
						this.$data.screenWidth)
					// 画头像框
					this.drawAvatarBorderImage()
				} else if (avatarSrc && this.$data.isWeChatAvatar) {
					uni.downloadFile({
						url: avatarSrc,
						success: (res) => {
							console.log('result', res)
							this.$data.ctx.drawImage(res.tempFilePath, this.changeSize(0), this.changeSize(0),
								this.$data.screenWidth, this.$data.screenWidth)
							// 画头像框
							this.drawAvatarBorderImage()
						},
						fail: function() {
							uni.hideLoading()
							uni.showModal({
								title: '提示',
								content: '无法下载头像',
							})
						}
					})
				} else {
					uni.hideLoading()
					uni.showModal({
						title: '提示',
						content: '请先登录或者上传头像',
					})
				}
			},
			drawAvatarBorderImage() {
				let borderImg = this.$data.borderImage

				// 没有头像框
				if (!borderImg) {
					// 开始生成
					return this.draw()
				}
				// this.$data.ctx.drawImage(borderImg, this.changeSize(0), this.changeSize(0), this.$data.screenWidth, this.$data.screenWidth)
				// // 开始生成
				// return this.draw()
				// 有头像框则继续执行
				uni.downloadFile({
					url: borderImg,
					success: (result) => {
						const hatSize = this.hatHalfWidth * 2 * this.hatScale * this.$data.dpi
						this.$data.ctx.translate(this.hatLeft * this.$data.dpi + this.hatHalfWidth * this.$data
							.dpi, this.hatTop * this.$data.dpi + this.hatHalfWidth * this.$data.dpi)
						this.$data.ctx.rotate(this.hatRotate * Math.PI / 180)
						this.$data.ctx.drawImage(result.tempFilePath, -hatSize / 2, -hatSize / 2, hatSize,
							hatSize)
						// 开始生成
						this.draw()
					},
					fail: function() {
						uni.hideLoading()
						uni.showModal({
							title: '提示',
							content: '无法下载头像框',
						})
					}
				})
			},
			draw() {
				this.$data.ctx.draw(false, () => {
					setTimeout(() => {
						this.canvasToImage()
					}, 130)
				})
			},
			// 生成图片
			canvasToImage() {
				uni.canvasToTempFilePath({
					canvasId: this.$data.canvasId,
					success: (res) => {
						uni.hideLoading()
						this.$data.ctx = null
						console.log(res)
						this.$toast('生成成功,正在保存', 'success', 2000)
						this.$data.imageBill = res.tempFilePath
						uni.setStorageSync('imageBill', this.$data.imageBill)
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => {
								// this.$tips('保存成功\n不妨分享一下~', '', 3500)
								wx.showToast({
									title: '保存成功\n不妨分享一下~',
									icon: 'none',
									duration: 3000
								})
								// 生成以后直接预览图片
								
								uni.navigateTo({
									url: `/pages/avatar/result?url=${this.$data.imageBill}`
								})
								// uni.previewImage({
								// 	current: res.tempFilePath,
								// 	urls: [res.tempFilePath],
								// })
							},
							fail: () => {
								this.$toast('保存失败\n请授权相册权限~', 'error', 3000)
							}
						});
					},
					fail() {
						uni.hideLoading()
						uni.showModal({
							title: '提示',
							content: '头像保存失败',
						})
					}
				})
			},
			changeSize(size) {
				let canvasSize = (size / 750) * this.$data.screenWidth
				canvasSize = parseFloat(canvasSize * 2)
				return canvasSize
			},
			confirmInst() {
				uni.setStorageSync('showInstructions', true)
				this.$data.showInstructions = false
			},
			// touch事件处理
			handleTouchStart(e) {
				this.currentHatTop = this.hatTop
				this.currentHatLeft = this.hatLeft
				this.currentRotateLeft = this.rotateLeft
				this.currentRotateTop = this.rotateTop
				this.touchTarget = e.target.id
				this.currentPos = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY
				}
			},
			handleTouchMove(e) {
				e.preventDefault()
				if (this.touchTarget) {
					const pos = {
						x: e.touches[0].clientX,
						y: e.touches[0].clientY
					}
					const moveX = pos.x - this.currentPos.x
					const moveY = pos.y - this.currentPos.y
					if (this.touchTarget === 'hat') {
						this.hatLeft = this.hatLeft + moveX
						this.hatTop = this.hatTop + moveY
					} else if (this.touchTarget === 'rotate') {
						this.rotateLeft = this.rotateLeft + moveX
						this.rotateTop = this.rotateTop + moveY
						const nowWidth = this.rotateLeft + this.hatHalfWidth
						const nowHeight = this.rotateTop + this.hatHalfWidth
						const nowRadius = Math.sqrt(nowWidth * nowWidth + nowHeight * nowHeight)
						this.hatScale = nowRadius / this.hatRadius
						const nowAngel = Math.atan2(nowHeight, nowWidth) / Math.PI * 180
						// console.log(this.beforeAngel)
						// console.log(nowAngel)
						this.hatRotate = nowAngel - this.beforeAngel + this.hatRotate
						this.beforeAngel = nowAngel
						// this.beforeAngel =
					}
					this.currentPos = pos
				}
			},
			handleTouchEnd(e) {
				this.touchTarget = ''
			},
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

		.page-logo {
			height: 100px;
			padding: 0 15px;
			margin: 0 auto 10px;

			image {
				height: 100%;
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
			padding: 8px;
			border-radius: 14px;
			width: calc(100vw - 30px);
			height: calc(100vw - 30px);
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

				._border-image {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					// transform: scale(1);
				}

				.user-hat {
					position: absolute;
					top: 0;
					left: 0;
					height: 104px;
					width: 104px;
					;

					.hat {
						width: 100px;
						height: 100px;
						border: dashed 2px transparent;
						&.border {
							background: url(../../static/images/guoqing/slider_frame.png) no-repeat;
							background-size: 104px 104px;
							background-position: -2px -2px;
						}
					}

					.rotate {
						width: 20px;
						height: 20px;
						text-align: center;
						line-height: 20px;
						position: absolute;
						right: -8px;
						bottom: -8px;
						background-color: #d81e06;
						border-radius: 50%;

						.rotate-icon {
							width: 20px;
							height: 20px;
						}
					}
				}
			}
		}

		.page-btns {
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

		.page-canvas {
			position: fixed;
			bottom: -10000px;
		}

		.page-pendant-box {
			min-height: 120px;
			background-color: #fff;
			border-radius: 5px;

			.page-pendant-table {
				height: 20px;
				line-height: 20px;

				._table-item {
					word-break: keep-all;
					&._active {
						text {
							color: #F55341;
							font-weight: bold;
						}
					}
				}
			}

			.page-pendant-list {
				height: 100%;
				width: 100%;
				height: 75px;

				.scroll-view-item {
					min-width: 65px;
					height: 65px;
					border: 1px solid #ddd;
					border-radius: 4px;
					margin: 5px;
					font: status-bar;
					overflow: hidden;

					image {
						width: 100%;
						height: 100%;
					}

					&._active {
						border-color: $color;
						box-shadow: 0px 0px 6px 2px $color;
					}
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

	.slot-content {
		max-height: 50vh;
		overflow-x: auto;
	}
</style>
