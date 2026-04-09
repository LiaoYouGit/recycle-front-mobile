<template>
  <view class="index-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-title">上门回收</view>
      <view class="header-subtitle">高价回收 · 上门服务 · 极速到账</view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-card" @tap="goSubmit">
        <text class="action-icon">♻️</text>
        <text class="action-text">发起回收</text>
      </view>
      <view class="action-card" @tap="goMyList">
        <text class="action-icon">📋</text>
        <text class="action-text">我的回收</text>
      </view>
    </view>

    <!-- 流程说明 -->
    <view class="section">
      <view class="section-title">回收流程</view>
      <view class="steps">
        <view class="step">
          <view class="step-dot">1</view>
          <text class="step-text">提交回收请求</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <view class="step-dot">2</view>
          <text class="step-text">等待接单</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <view class="step-dot">3</view>
          <text class="step-text">上门取货</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <view class="step-dot">4</view>
          <text class="step-text">即时到账</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goSubmit = () => {
  uni.navigateTo({ url: '/pages/recycle/submit' })
}

const goMyList = () => {
  uni.switchTab({ url: '/pages/my/list' })
}
</script>

<style scoped lang="scss">
.index-page {
  min-height: calc(100vh - var(--window--top));
}

.header {
  background: linear-gradient(135deg, #07c160, #06ad56);
  padding: 80rpx 40rpx 60rpx;
  color: #fff;

  .header-title {
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .header-subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 40rpx 30rpx;
  margin: -30rpx 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;

    .action-icon {
      font-size: 60rpx;
      margin-bottom: 12rpx;
    }

    .action-text {
      font-size: 26rpx;
      color: #333;
    }
  }
}

.section {
  margin: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
}

.steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;

    .step-dot {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: #07c160;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: bold;
      margin-bottom: 12rpx;
    }

    .step-text {
      font-size: 22rpx;
      color: #666;
    }
  }

  .step-line {
    flex: 1;
    height: 2rpx;
    background: #ddd;
    margin: 0 10rpx;
    margin-bottom: 40rpx;
  }
}
</style>
