<template>
	<canvas class="" :ref="canvasId" v-if="canvasId" :id="canvasId" :canvasId="canvasId" :style="{'width': width * pixelRatio + 'px', 'height': height * pixelRatio + 'px', 'transform': 'scale('+(1 / pixelRatio) + ')', 'margin-left': - width * (pixelRatio - 1) / 2 + 'px', 'margin-top': -height * (pixelRatio - 1) / 2 + 'px' }" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd" @error="error">
	</canvas>
</template>

<script>
	import uCharts from 'js_jdk/lib/u-charts.min'
	import { objectMerge, deepClone } from '@/utils'
	var canvases = {};
	
	export default {
		name: 'uCharts',
		data() {
			return {
				width: '',
				height: '',
				opts: {}
			}
		},
		props: {
			chartType: {
				required: true,
				type: String,
				default: 'column'
			},
			// opts: {
			// 	required: true,
			// 	// type: Object,
			// 	default () {
			// 		return {}
			// 	},
			// },
			canvasId: {
				type: String,
				default: 'u-canvas',
			},
			pixelRatio: {
				type: Number,
				default: 1,
			},
		},
		watch: {
			opts(val) {
				console.log('val', val)
				
				if (val) {
					// let { width, height } = this.opts
					// this.$data.width = width
					// this.$data.height = height
					// this.init()
				}
			}
		},
		mounted() {
		},
		methods: {
			init(opts) {
				let { width, height } = opts
				this.$data.width = width
				this.$data.height = height
				this.$data.opts = opts
				switch (this.chartType) {
					case 'column':
						this.initColumnChart();
						break;
					case 'line':
						this.initLineChart();
						break;
					case 'ring':
						this.initRingChart();
						break;
					default:
						break;
				}
			},
			initColumnChart() {
				canvases[this.canvasId] = new uCharts({
					$this: this,
					canvasId: this.canvasId,
					type: 'column',
					legend: true,
					fontSize: 11,
					background: '#FFFFFF',
					pixelRatio: this.pixelRatio,
					animation: true,
					categories: this.opts.categories,
					series: this.opts.series,
					enableScroll: true,
					xAxis: {
						disableGrid: true,
						itemCount: 4,
						scrollShow: true
					},
					yAxis: {
						//disabled:true
					},
					dataLabel: true,
					width: this.opts.width * this.pixelRatio,
					height: this.opts.height * this.pixelRatio,
					extra: {
						column: {
							type: 'group',
						}
					}
				});
			},
			initLineChart() {
				canvases[this.canvasId] = new uCharts({
					$this: this,
					canvasId: this.canvasId,
					type: 'line',
					fontSize: 11,
					legend: true,
					dataLabel: false,
					dataPointShape: true,
					background: '#FFFFFF',
					pixelRatio: this.pixelRatio,
					categories: this.opts.categories,
					series: this.opts.series,
					animation: true,
					enableScroll: true,
					xAxis: {
						type: 'grid',
						gridColor: '#CCCCCC',
						gridType: 'dash',
						dashLength: 8,
						itemCount: 4,
						scrollShow: true
					},
					yAxis: {
						gridType: 'dash',
						gridColor: '#CCCCCC',
						dashLength: 8,
						splitNumber: 5,
						min: 10,
						max: 180,
						format: (val) => {
							return val.toFixed(0) + '元'
						}
					},
					width: this.opts.width * this.pixelRatio,
					height: this.opts.height * this.pixelRatio,
					extra: {
						line: {
							type: 'straight'
						}
					}
				});
			},
			initRingChart() {
				let options = {
					$this: this,
					canvasId: this.canvasId,
					type: 'ring',
					fontSize: 11,
					legend: true,
					dataLabel: false,
					dataPointShape: true,
					background: '#FFFFFF',
					pixelRatio: this.pixelRatio,
					categories: [],
					series: [],
					animation: true,
					enableScroll: true,
					width: this.opts.width * this.pixelRatio,
					height: this.opts.height * this.pixelRatio,
					extra: {
						pie: {
							offsetAngle: -45,
							ringWidth: 40,
							labelWidth: 15
						}
					}
				}
				options = objectMerge(options, this.opts)
				
				options.width = options.width * this.pixelRatio
				options.height = options.height * this.pixelRatio
				options.$this = this
				
				canvases[this.canvasId] = new uCharts(options)
			},
			// 这里仅作为示例传入两个参数，cid为canvas-id,newdata为更新的数据，需要更多参数请自行修改
			changeData(cid,newdata) {
				canvases[cid].updateData({
					series: newdata.series,
					categories: newdata.categories
				});
			},
			touchStart(e) {
				canvases[this.canvasId].showToolTip(e, {
					format: function(item, category) {
						return category + ' ' + item.name + ':' + item.data
					}
				});
				canvases[this.canvasId].scrollStart(e);
			},
			touchMove(e) {
				canvases[this.canvasId].scroll(e);
			},
			touchEnd(e) {
				canvases[this.canvasId].scrollEnd(e);
			},
			error(e) {
				console.log(e)
			}
		},
	};
</script>

<style scoped>
	.charts {
		display: block;
		width: 100%;
		height: 100%;
		flex: 1;
		background-color: #FFFFFF;
	}
</style>
