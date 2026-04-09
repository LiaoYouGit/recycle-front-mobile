/**
 * 回收订单API
 */
import { get, post } from '@/utils/request'

export interface RecycleOrder {
  id?: number
  contactName: string
  contactPhone: string
  itemName: string
  itemDescription?: string
  estimatedPrice?: number
  actualPrice?: number
  itemImages?: string
  status?: number
  remark?: string
  createTime?: string
  updateTime?: string
  completeTime?: string
}

/** 提交回收请求 */
export function createOrder(data: RecycleOrder) {
  return post<number>('/api/order/create', data)
}

/** 查询订单详情 */
export function getOrderDetail(id: number) {
  return get<RecycleOrder>(`/api/order/detail/${id}`)
}

/** 按手机号查询回收记录 */
export function getOrdersByPhone(phone: string, page = 1, size = 10) {
  return get<{ total: number; list: RecycleOrder[] }>('/api/order/listByPhone', { phone, page, size })
}
