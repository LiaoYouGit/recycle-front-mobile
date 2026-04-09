<template>
  <view class="list-page">
    <!-- 顶部装饰 -->
    <view class="page-header">
      <text class="page-title">我的回收</text>
      <text class="page-desc">查询您的回收记录</text>
    </view>

    <!-- 搜索卡片 -->
    <view class="search-card">
      <view class="search-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="phone"
          type="number"
          maxlength="11"
          placeholder="输入手机号查询"
          class="search-input"
        />
        <text class="search-btn" @tap="handleSearch">查询</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length">
      <view
        class="order-card"
        v-for="item in orders"
        :key="item.id"
        @tap="goDetail(item.id)"
      >
        <view class="order-top">
          <view class="order-name-row">
            <text class="order-icon">♻️</text>
            <text class="order-name">{{ item.itemName }}</text>
          </view>
          <text
            class="order-status"
            :style="{
              color: getOrderStatusColor(item.status),
              background: getOrderStatusBg(item.status)
            }"
          >
            {{ getOrderStatusText(item.status) }}
          </text>
        </view>
        <view class="order-info-row">
          <text class="order-info" v-if="item.estimatedPrice"
            >估价 <text class="price">¥{{ item.estimatedPrice }}</text></text
          >
          <text class="order-info" v-if="item.actualPrice"
            >成交 <text class="price">¥{{ item.actualPrice }}</text></text
          >
        </view>
        <view class="order-bottom">
          <text class="order-contact">{{ item.contactName }}</text>
          <text class="order-time">{{ formatDateTime(item.createTime) }}</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore" @tap="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
      <view class="load-more" v-else>
        <text class="load-more-text end">— 没有更多了 —</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-else-if="searched">
      <text class="empty-icon">📭</text>
      <text class="empty-title">暂无回收记录</text>
      <text class="empty-desc">提交回收请求后即可在这里查看</text>
    </view>
    <view class="empty" v-else>
      <text class="empty-icon">📋</text>
      <text class="empty-title">查询回收记录</text>
      <text class="empty-desc">输入手机号查看历史回收订单</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getOrdersByPhone } from '@/api/order'
import {
  formatDateTime,
  getOrderStatusText,
  getOrderStatusColor,
  isValidPhone
} from '@/utils/index'

const phone = ref('')
const orders = ref<any[]>([])
const searched = ref(false)
const page = ref(1)
const total = ref(0)
const hasMore = ref(false)

const getOrderStatusBg = (status: number): string => {
  const map: Record<number, string> = {
    0: 'rgba(255,153,0,0.1)',
    1: 'rgba(24,144,255,0.1)',
    2: 'rgba(114,46,209,0.1)',
    3: 'rgba(82,196,26,0.1)',
    4: 'rgba(0,0,0,0.05)'
  }
  return map[status] || 'rgba(0,0,0,0.05)'
}

const handleSearch = async () => {
  if (!phone.value.trim())
    return uni.showToast({ title: '请输入手机号', icon: 'none' })
  if (!isValidPhone(phone.value))
    return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  uni.showLoading({ title: '查询中...' })
  try {
    page.value = 1
    const res = await getOrdersByPhone(phone.value.trim(), 1, 10)
    orders.value = res?.list || []
    total.value = res?.total || 0
    hasMore.value = orders.value.length < total.value
    searched.value = true
  } catch (e) {
  } finally {
    uni.hideLoading()
  }
}

const loadMore = async () => {
  if (!hasMore.value) return
  uni.showLoading({ title: '加载中...' })
  try {
    page.value++
    const res = await getOrdersByPhone(phone.value.trim(), page.value, 10)
    orders.value = [...orders.value, ...(res?.list || [])]
    hasMore.value = orders.value.length < total.value
  } catch (e) {
    page.value--
  } finally {
    uni.hideLoading()
  }
}

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/recycle/detail?id=${id}` })
}
</script>

<style scoped lang="scss">
.list-page {
  min-height: calc(100vh - var(--window--top));
  background: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #07c160, #06ad56);
  padding: 60rpx 40rpx 50rpx;
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }
  .page-desc {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

.search-card {
  margin: -30rpx 30rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  .search-wrap {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 12rpx;
    padding: 0 20rpx;
    height: 76rpx;
  }
  .search-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
  }
  .search-input {
    flex: 1;
    font-size: 28rpx;
    background: transparent;
  }
  .search-btn {
    font-size: 26rpx;
    color: #07c160;
    font-weight: bold;
    padding: 10rpx 20rpx;
  }
}

.order-list {
  padding: 0 30rpx;
}

.order-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .order-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  .order-name-row {
    display: flex;
    align-items: center;
  }
  .order-icon {
    font-size: 32rpx;
    margin-right: 10rpx;
  }
  .order-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }
  .order-status {
    font-size: 22rpx;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    font-weight: 500;
  }

  .order-info-row {
    display: flex;
    gap: 40rpx;
    margin-bottom: 16rpx;
  }
  .order-info {
    font-size: 26rpx;
    color: #666;
  }
  .price {
    color: #ff6600;
    font-weight: 500;
  }

  .order-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
  }
  .order-contact {
    font-size: 24rpx;
    color: #999;
  }
  .order-time {
    font-size: 24rpx;
    color: #ccc;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
  .load-more-text {
    font-size: 26rpx;
    color: #999;
  }
  .load-more-text.end {
    color: #ddd;
  }
}

.empty {
  text-align: center;
  padding: 120rpx 60rpx;
  .empty-icon {
    display: block;
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }
  .empty-title {
    display: block;
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 12rpx;
  }
  .empty-desc {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}
</style>
