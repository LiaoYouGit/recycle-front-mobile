<template>
  <view class="detail-page">
    <view class="page-header">
      <text class="page-title">订单详情</text>
    </view>
    <template v-if="order">
      <!-- status-bar 梯形靠左，浮在卡片上方 -->
      <view class="status-bar" :style="statusGradient">
        <text class="status-text">{{ statusText }}</text>
      </view>

      <!-- 主卡片 -->
      <view class="card main-card" style="border-radius: 0 20rpx 20rpx 20rpx">
        <view class="info-section">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">#{{ order.id }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系人</text>
            <text class="info-value">{{ order.contactName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ order.contactPhone }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">回收品</text>
            <text class="info-value">{{ order.itemName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">提交时间</text>
            <text class="info-value">{{
              formatDateTime(order.createTime)
            }}</text>
          </view>
          <view class="info-row" v-if="order.actualPrice">
            <text class="info-label">成交价</text>
            <text class="info-value price success"
              >¥{{ order.actualPrice }}</text
            >
          </view>
        </view>
      </view>

      <!-- 品类明细 -->
      <view class="card" v-if="detailItems.length">
        <view class="detail-section">
          <view
            class="detail-item"
            v-for="(item, idx) in detailItems"
            :key="idx"
          >
            <view class="detail-row">
              <text class="detail-name">{{ item.name }}</text>
              <text class="detail-amount">¥{{ item.amount }}</text>
            </view>
            <view class="detail-sub">
              <text
                >{{ item.weight }}{{ item.isOther ? '' : '斤' }} × ¥{{
                  item.price
                }}{{ item.isOther ? '/斤' : '' }}</text
              >
            </view>
          </view>
        </view>
      </view>

      <!-- 估价卡片：显眼放在最下面 -->
      <view class="price-card" v-if="order.estimatedPrice">
        <text class="price-label">预估金额</text>
        <text class="price-value">¥{{ order.estimatedPrice }}</text>
        <text class="price-hint">实际价格以现场确认为准</text>
      </view>
    </template>

    <view class="empty" v-else>
      <text class="empty-icon">📭</text>
      <text class="empty-text">订单不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getOrderDetail } from '@/api/order'
import {
  formatDateTime,
  getOrderStatusText,
  getOrderStatusColor
} from '@/utils/index'

const order = ref<any>(null)
const statusText = ref('')
const statusColor = ref('#999')
const statusGradient = computed(() => {
  const c = statusColor.value
  return { background: `linear-gradient(135deg, ${c}, ${c}dd)` }
})

const detailItems = computed(() => {
  if (!order.value?.itemDescription) return []
  try {
    const parsed = JSON.parse(order.value.itemDescription)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage.options?.id || currentPage.$page?.options?.id

  if (id) {
    try {
      order.value = await getOrderDetail(Number(id))
      statusText.value = getOrderStatusText(order.value.status || 0)
      statusColor.value = getOrderStatusColor(order.value.status || 0)
    } catch (e) {}
  }
})
</script>

<style scoped lang="scss">
.detail-page {
  min-height: calc(100vh - var(--window--top));
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #07c160, #06ad56);
  padding: 60rpx 40rpx 50rpx;
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
  }
}

/* ===== 主卡片 ===== */
/* 梯形 status-bar 贴在卡片左上角（倒梯形：下宽上窄），层级在卡片下面 */
.status-bar {
  position: relative;
  width: 50%;
  padding: 4rpx 20rpx;
  text-align: center;
  margin: 30rpx 30rpx 0;
  z-index: 0;
  border-radius: 16rpx 16rpx 0 0;
  /* 倒梯形：上窄下宽，用左侧斜切代替 clip-path 以保留圆角 */
  background: linear-gradient(
    135deg,
    var(--status-bg, #999),
    var(--status-bg, #999) dd
  );
  .status-text {
    color: #fff;
    font-size: 30rpx;
    font-weight: bold;
    white-space: nowrap;
  }
}

.main-card {
  position: relative;
  z-index: 1;
  margin-top: -20rpx;
}

/* ===== 通用卡片 ===== */
.card {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.info-section {
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    &:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #999;
      font-size: 28rpx;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
      font-size: 28rpx;
      text-align: right;
      max-width: 60%;
      word-break: break-all;
    }
    .info-value.price {
      color: #ff4d4f;
      font-weight: bold;
    }
    .info-value.price.success {
      color: #07c160;
    }
  }
}

/* ===== 品类明细 ===== */
.detail-section {
  .detail-item {
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .detail-name {
      font-size: 28rpx;
      color: #333;
    }
    .detail-amount {
      font-size: 30rpx;
      font-weight: bold;
      color: #ff6600;
    }
    .detail-sub {
      font-size: 24rpx;
      color: #999;
      margin-top: 6rpx;
    }
  }
}

/* ===== 估价卡片（最底部，显眼） ===== */
.price-card {
  margin: 30rpx;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border: 3rpx solid #ff4d4f;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 77, 79, 0.12);

  .price-label {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  .price-value {
    display: block;
    font-size: 64rpx;
    font-weight: bold;
    color: #ff4d4f;
    line-height: 1.2;
  }
  .price-hint {
    display: block;
    font-size: 22rpx;
    color: #ccc;
    margin-top: 12rpx;
  }
}

/* ===== 空状态 ===== */
.empty {
  text-align: center;
  padding: 120rpx 0;
  .empty-icon {
    display: block;
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}
</style>
