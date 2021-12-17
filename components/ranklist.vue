<!--
 * @Descripttion: 积分排行榜组件
 * @version:
 * @Author: falost
 * @Date: 2021-05-04 01:25:55
 * @LastEditors: falost
 * @LastEditTime: 2021-08-17 12:04:53
-->
<template>
  <view class="ranking fui-bgc-fff">
    <!-- 前三名 -->
    <view v-if="topThreeList.length > 0" class="top-three-box fui-flex ranking-bg" :class="topThreeList.length === 2 ? 'fui-flex-center-y' : 'fui-flex-center'">
      <view class="top-two ranking-top-item fx1">
        <template v-if="topThreeList[1]">
          <view class="user-avatar-box">
            <view class="user-avatar">
              <image :src="topThreeList[1].avatar" mode="" />
            </view>
          </view>
          <view class="user-name fui-tac fui-ellipsis">
            <text class="fui-fs17 fui-fw500 fui-c-fff">{{ topThreeList[1].nickname || '匿名' }}</text>
          </view>
          <view class="user-score fui-tac">
            <text class="fui-fs14 fui-fw400 fui-c-fff">{{ topThreeList[1].score || 0 }}分</text>
          </view>
        </template>
      </view>
      <view class="top-one ranking-top-item fx1">
        <template v-if="topThreeList[0]">
          <view class="user-avatar-box">
            <view class="user-avatar">
              <image :src="topThreeList[0].avatar" mode="" />
            </view>
          </view>
          <view class="user-name fui-tac fui-ellipsis">
            <text class="fui-fs18 fui-fw500 fui-c-fff">{{ topThreeList[0].nickname || '匿名' }}</text>
          </view>
          <view class="user-score fui-tac">
            <text class="fui-fs14 fui-fw400 fui-c-fff">{{ topThreeList[0].score || 0 }}分</text>
          </view>
        </template>
      </view>
      <view class="top-three ranking-top-item fx1">
        <template v-if="topThreeList[2]">
          <view class="user-avatar-box">
            <view class="user-avatar">
              <image :src="topThreeList[2].avatar" mode="" />
            </view>
          </view>
          <view class="user-name fui-tac fui-ellipsis">
            <text class="fui-fs16 fui-fw500 fui-c-fff">{{ topThreeList[2].nickname || '匿名' }}</text>
          </view>
          <view class="user-score fui-tac">
            <text class="fui-fs14 fui-fw400 fui-c-fff">{{ topThreeList[2].score || 0 }}分</text>
          </view>
        </template>
      </view>
      <view class="ranking-tips fui-tac">
        <text class="fui-fs10 fui-c-fff">* 排行榜于每日 0 时刷新</text>
      </view>
    </view>
    <view class="ranking-list">
      <view v-for="(item, index) in rankingList" :key="index" class="ranking-item fui-flex-center-y fui-line-b">
        <view class="item-num fui-tac">
          <text class="fui-fs18 fui-fw500 fui-c-theme">{{ 4 + index }}</text>
        </view>
        <view class="item-avatar fui-ml5">
          <image :src="item.avatar" mode="" />
        </view>
        <view class="fx1 item-name fui-ml10 fui-ellipsis">
          <text class="fui-fs16 fui-c-master fui-fw500">{{ item.nickname || '匿名' }}</text>
        </view>
        <view class="item-score fui-ml10">
          <text class="fui-fs14 fui-c-aux fui-fw400">{{ item.score || 0 }}分</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Rankperson',
  filters: {
    /**
     * @name formtatNameLength
     * @desc 格式化用户名长度
     * @author Falost
     * @time 2019年05月20日 09:14:56 星期一
     * @param {String} {val}
     * @return  {String} {val}
     */
    formtatNameLength(val) {
      console.log(val)
      if (val && val.length > 4) {
        return val.substring(0, 4) + '...'
      } else {
        return val
      }
    }
  },
  props: {
    datas: {
      type: Array,
      default() {
        return []
      }
    }
  },

  data() {
    return {
      rankingList: [],
      topThreeList: [],
      $STATIC: this.$STATIC
    }
  },

  computed: {
  },

  watch: {
    datas() {
      this.init()
    }
  },

  created() {
    this.init()
  },
  methods: {
    /**
     * @name init
     * @desc 初始化数据
     * @author Falost
     * @time 2019年05月14日 22:09:49 星期二
     * @param {Object} {}
     * @return  {*}
     */
    init() {
      this.$data.rankingList = this.datas.slice(3)
      this.$data.topThreeList = this.datas.slice(0, 3)
    }
  }
}
</script>
<style lang="scss" scoped>
.ranking {
  padding: 0;
  .top-three-box {
    position: relative;
    &.ranking-bg {
      padding: 25px 5px;
      background: url('#{$static}/static/images/ranking/ranking-bg.png') no-repeat;
      background-size: 100% 100%;
    }
    .ranking-tips {
      position: absolute;
      right: 10px;
      top: 10px;
      line-height: 12px;
      opacity: 0.4;
    }
    .ranking-top-item {
      position: relative;
      padding-top: 25px;
      .user-avatar-box {
        position: relative;
        width: 84px;
        height: 110px;
        margin: auto;
        background-repeat: no-repeat;
        background-size: 100%;
        background-image: url('#{$static}/static/images/ranking/ranking-1.png');
        .user-avatar {
          position: absolute;
          top: 2px;
          left: 10px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid transparent;
          background-color: $placeholderBgc;
          image {
            width: 100%;
            height: 100%;
          }
        }
        .user-name {
          height: 30px;
          overflow: hidden;
          line-height: 30px;
        }
      }
      &.top-one {
        padding: 0;
        margin-top: -10px;
      }
      &.top-two {
        .user-avatar-box {
          background-image: url('#{$static}/static/images/ranking/ranking-2.png');
        }
      }
      &.top-three {
        .user-avatar-box {
          background-image: url('#{$static}/static/images/ranking/ranking-3.png');
        }
      }
    }
  }
  .ranking-list {
    .ranking-item {
      padding: 10px 15px 10px 10px;
      .item-num {
        width: 40px;
      }
      .item-avatar {
        width: 45px;
        height: 45px;
        overflow: hidden;
        border-radius: 50%;
        background-color: $placeholderBgc;
        image {
          width: 100%;
          height: 100%;
        }
      }
      &:last-child {
        border: none;
      }
    }
  }
}
</style>
