<template>
  <view class="submit-page">
    <!-- 顶部装饰 -->
    <view class="page-header">
      <text class="page-title">提交回收</text>
      <text class="page-desc">填写信息，预估回收价格</text>
    </view>

    <!-- 联系信息卡片 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">📱 联系信息</text>
      </view>
      <view class="form-item">
        <input
          v-model="form.contactName"
          placeholder="联系人姓名"
          class="input"
        />
      </view>
      <view class="form-item">
        <input
          v-model="form.contactPhone"
          type="number"
          maxlength="11"
          placeholder="手机号码"
          class="input"
        />
      </view>
    </view>

    <!-- 回收品类卡片 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">📦 回收品类</text>
        <text class="add-btn" @tap="addItem">+ 添加</text>
      </view>

      <view class="item-list">
        <view class="item-card" v-for="(item, index) in items" :key="index">
          <view class="item-top">
            <text class="item-badge">品类 {{ index + 1 }}</text>
            <text
              class="item-delete"
              v-if="items.length > 1"
              @tap="removeItem(index)"
              >删除</text
            >
          </view>

          <!-- 品类选择 -->
          <picker
            v-if="item.isOther"
            @change="item.name = $event.detail.value"
            :value="item.name"
          >
            <view class="select-row">
              <input
                v-model="item.name"
                placeholder="请填写品类名称"
                class="select-input"
                @tap.stop
              />
            </view>
          </picker>
          <picker
            v-else
            @change="onCategoryChange(index, $event)"
            :range="categoryNames"
            :value="item.categoryIndex"
          >
            <view class="select-row">
              <text
                class="select-value"
                :class="{ placeholder: item.categoryIndex < 0 }"
              >
                {{ categoryNames[item.categoryIndex] || '点击选择品类 ▾' }}
              </text>
            </view>
          </picker>

          <view class="item-fields">
            <!-- 预估重量 -->
            <view class="field-row">
              <text class="field-label">重量</text>
              <view class="field-input-wrap">
                <input
                  v-model="item.weight"
                  type="digit"
                  placeholder="0"
                  class="field-input"
                  @input="calcItemAmount(index)"
                />
                <text class="field-unit">{{ item.unit || '斤' }}</text>
              </view>
            </view>

            <!-- 单价 / 预估售价 -->
            <view
              class="field-row"
              v-if="!item.isOther && item.categoryIndex >= 0"
            >
              <text class="field-label">单价</text>
              <text class="field-price">¥{{ item.price }}/{{ item.unit }}</text>
            </view>
            <view class="field-row" v-if="item.isOther">
              <text class="field-label">售价</text>
              <view class="field-input-wrap">
                <input
                  v-model="item.estimatePrice"
                  type="digit"
                  placeholder="0"
                  class="field-input"
                  @input="calcItemAmount(index)"
                />
                <text class="field-unit">元</text>
              </view>
            </view>

            <!-- 预估金额 -->
            <view
              class="amount-row"
              v-if="item.amount && parseFloat(item.amount) > 0"
            >
              <text class="amount-label">预估</text>
              <text class="amount-value">¥{{ item.amount }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 预估总金额 -->
    <view class="total-card" v-if="parseFloat(totalAmount) > 0">
      <view class="total-left">
        <text class="total-label">预估总金额</text>
      </view>
      <view class="total-right">
        <text class="total-symbol">¥</text>
        <text class="total-num">{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">💬 备注</text>
      </view>
      <textarea
        v-model="form.remark"
        placeholder="其他补充说明（选填）"
        auto-height
        class="textarea"
        maxlength="60"
      />
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @tap="handleSubmit" :loading="loading">
      提交回收请求
    </button>
    <view style="height: 40rpx"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createOrder } from '@/api/order'
import { getCategoryList, type RecycleCategory } from '@/api/category'
import { isValidPhone } from '@/utils/index'

const loading = ref(false)
const categories = ref<RecycleCategory[]>([])
const categoryNames = computed(() => categories.value.map((c) => c.name))

interface ItemRow {
  isOther: boolean
  categoryIndex: number
  name: string
  unit: string
  price: number
  weight: string
  estimatePrice: string
  amount: string
}

const items = ref<ItemRow[]>([createDefaultItem()])

function createDefaultItem(): ItemRow {
  return {
    isOther: false,
    categoryIndex: -1,
    name: '',
    unit: '斤',
    price: 0,
    weight: '',
    estimatePrice: '',
    amount: ''
  }
}

const totalAmount = computed(() => {
  let total = 0
  items.value.forEach((item) => {
    total += parseFloat(item.amount) || 0
  })
  return total.toFixed(2)
})

const form = ref({ contactName: '', contactPhone: '', remark: '' })

const onCategoryChange = (index: number, e: any) => {
  const ci = parseInt(e.detail.value)
  const item = items.value[index]
  item.categoryIndex = ci
  item.name = categories.value[ci].name
  item.unit = categories.value[ci].unit
  item.price = categories.value[ci].price
  item.amount = ''
  calcItemAmount(index)
}

const calcItemAmount = (index: number) => {
  const item = items.value[index]
  const weight = parseFloat(item.weight) || 0
  if (item.isOther) {
    item.amount = ((parseFloat(item.estimatePrice) || 0) * weight).toFixed(2)
  } else {
    item.amount = (item.price * weight).toFixed(2)
  }
}

const addItem = () => {
  items.value.push(createDefaultItem())
}
const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.value.contactName.trim())
    return uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
  if (!isValidPhone(form.value.contactPhone))
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  const validItems = items.value.filter((item) => {
    if (item.isOther)
      return (
        item.name.trim() &&
        parseFloat(item.weight) > 0 &&
        parseFloat(item.estimatePrice) > 0
      )
    return item.categoryIndex >= 0 && parseFloat(item.weight) > 0
  })
  if (validItems.length === 0)
    return uni.showToast({ title: '请完善品类信息', icon: 'none' })

  const descriptions = validItems.map((item) => ({
    name: item.name,
    weight: parseFloat(item.weight),
    price: item.isOther ? parseFloat(item.estimatePrice) : item.price,
    amount: parseFloat(item.amount),
    isOther: item.isOther
  }))
  const names = validItems.map((i) => i.name)
  const itemName = names.length === 1 ? names[0] : names[0] + '等多种'

  loading.value = true
  try {
    const orderId = await createOrder({
      contactName: form.value.contactName.trim(),
      contactPhone: form.value.contactPhone.trim(),
      itemName,
      itemDescription: JSON.stringify(descriptions),
      estimatedPrice: parseFloat(totalAmount.value),
      remark: form.value.remark.trim() || undefined
    })
    uni.showToast({ title: '提交成功！', icon: 'success' })
    setTimeout(() => {
      uni.navigateTo({ url: `/pages/recycle/detail?id=${orderId}` })
    }, 1500)
  } catch (e) {
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const list = await getCategoryList()
    if (Array.isArray(list)) categories.value = list
  } catch (e) {}
})
</script>

<style scoped lang="scss">
.submit-page {
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
    margin-bottom: 8rpx;
  }
  .page-desc {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

.card {
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx 30rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  &:first-child {
    margin-top: -30rpx;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }
  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }
  .add-btn {
    font-size: 26rpx;
    color: #07c160;
    font-weight: bold;
    padding: 8rpx 16rpx;
  }

  .form-item {
    margin-bottom: 20rpx;
  }
  .form-item:last-child {
    margin-bottom: 0;
  }

  .input {
    width: 100%;
    height: 84rpx;
    background: #f7f8fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    border: none;
  }

  .textarea {
    width: 100%;
    min-height: 60px;
    background: #f7f8fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: #333;
    border: none;
    box-sizing: border-box;
  }
}

.item-list {
  margin-top: 8rpx;
}

.item-card {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  .item-badge {
    font-size: 24rpx;
    color: #07c160;
    background: rgba(7, 193, 96, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-weight: bold;
  }
  .item-delete {
    font-size: 24rpx;
    color: #ff4d4f;
    padding: 8rpx 16rpx;
  }

  .select-row {
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 16rpx;
    .select-value {
      font-size: 28rpx;
      color: #333;
    }
    .select-value.placeholder {
      color: #ccc;
    }
    .select-input {
      font-size: 28rpx;
      color: #333;
    }
  }

  .item-fields {
    padding: 0 4rpx;
  }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  .field-label {
    font-size: 26rpx;
    color: #999;
  }
  .field-input-wrap {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1rpx solid #e8e8e8;
    border-radius: 8rpx;
    padding: 8rpx 16rpx;
  }
  .field-input {
    width: 160rpx;
    text-align: right;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    background: transparent;
  }
  .field-unit {
    font-size: 24rpx;
    color: #999;
    margin-left: 8rpx;
  }
  .field-price {
    font-size: 28rpx;
    color: #ff6600;
    font-weight: 500;
  }

  .amount-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    margin-top: 4rpx;
    border-top: 1rpx solid #e8e8e8;
    .amount-label {
      font-size: 24rpx;
      color: #999;
    }
    .amount-value {
      font-size: 32rpx;
      font-weight: bold;
      color: #07c160;
    }
  }
}

.total-card {
  margin: 20rpx 30rpx;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 102, 0, 0.3);

  .total-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
  .total-right {
    display: flex;
    align-items: baseline;
  }
  .total-symbol {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
    margin-right: 4rpx;
  }
  .total-num {
    font-size: 48rpx;
    color: #fff;
    font-weight: bold;
  }
}

.submit-btn {
  margin: 30rpx 30rpx 0;
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  height: 96rpx;
  line-height: 96rpx;
  box-shadow: 0 6rpx 24rpx rgba(7, 193, 96, 0.35);
  border: none;
}
</style>
