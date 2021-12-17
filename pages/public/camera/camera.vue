<template>
	<fui-page>
		<view class="camera-box">
			<image-cropper id="image-cropper" 
				:limit_move="true"
				:disable_rotate="false"
				:disable_ratio="true"
				:img_width="imgWidth" 
				:img_height="imgHeight" 
				:width="width"
				:height="height"
				:scale="scale"
				:imgSrc="coverImage" 
				@load="cropperload" 
				@imageload="loadimage"
				@tapcut="clickcut"></image-cropper>
		</view>
		<view class="tools fui-flex-between fui-p25">
			<button type="default" @tap="cancel">取消</button>
			<button type="default" @tap="cutImage">确认</button>
		</view>
	</fui-page>
</template>

<script>
	export default {
		data() {
			return {
				imgWidth: 0,
				imgHeight: 0,
				width: 0,
				height: 0,
				scale: 1,
				coverImage: ''
			}
		},
		onLoad({ url }) {
			this.$data.coverImage = url
			// #ifdef APP-NVUE
			const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
			// #endif
			// #ifndef APP-NVUE
			const eventChannel = this.getOpenerEventChannel();
			// #endif
			this.$data.eventChannel = eventChannel
		},
		onReady() {

		},
		methods: {
			GCD(w, h) {
			  if (w % h) {
			    return this.GCD(h, w % h)
			  } else {
			    return h
			  }
			},
			loadimage(data) {
				console.log('图片加载完成', data)
				uni.hideLoading()
				let info = uni.getSystemInfoSync()
				let w = data.detail.width
				let h = data.detail.height
				let gcd = this.GCD(w / 2, h / 2)
				this.$data.width = info.windowWidth * 0.6
				this.$data.height = info.windowWidth * 0.6
				this.$data.imgWidth =  info.windowWidth * 0.6
				this.$data.imgHeight =  info.windowWidth * 0.6 / (w / gcd) * h / gcd
				this.$nextTick(() => {
					this.cropper.setCutCenter();
					this.$nextTick(()=>{
						this.cropper.imgReset();
					})
				})
			},
			cropperload() {
				this.cropper = this.selectComponent("#image-cropper")
			},
			clickcut() {},
			cutImage() {
				this.cropper.getImg(({
					url
				}) => {
					console.log(url)
					this.$data.eventChannel.emit('save', url)
					uni.navigateBack({
					    delta: 1
					});
				})
			},
			cancel() {
				console.log(' 取消')
				if (this.$data.eventChannel.emit) {
					this.$data.eventChannel.emit('cancel')
				}
				this.$back()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.camera-box {
		/* position: relative; */
		width: 80vw;
		height: 80vh;
		margin: auto;
	}
	.tools {
		position: fixed;
		bottom: 10px;
		width: 100%;
		z-index: 99;
    box-sizing: border-box;
		button {
			width: 50px;
			height: 50px;
			line-height: 50px;
			text-align: center;
			border-radius: 50%;
			font-size: 14px;
			padding: 0;
		}
	}
</style>
