<!--
 * @Descripttion:
 * @version:
 * @Author: falost
 * @Date: 2021-05-17 10:18:53
 * @LastEditors: falost
 * @LastEditTime: 2021-08-08 02:51:12
-->
<template>
  <view class="fui-search-box">
    <view class="search-box">
      <uni-search-bar :placeholder="placeholder" :clear-button="clearButton" @confirm="search" />
    </view>
  </view>
</template>
<script>
export default {
  name: 'FuiSearchBox',
  props: {
    placeholder: {
      type: String,
      default: '请输入关键词'
    },
    clearButton: {
      type: String,
      default: 'auto'
    }
  },
  data() {
    return {
      keywords: ''
    }
  },
  watch: {},
  onLoad() {},
  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {},
  onResize() {},
  onBackPress() {},
  methods: {
    search(e) {
      uni.navigateTo({
        url: '/pages/search/search?keywords=' + e.value,
        animationDuration: 300,
        animationType: 'slide-out-top' // 从顶部滑入
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
