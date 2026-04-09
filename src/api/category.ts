import { get } from '@/utils/request'

export interface RecycleCategory {
  id: number
  name: string
  unit: string
  price: number
  status?: number
}

/** 获取启用的品类列表 */
export function getCategoryList() {
  return get<RecycleCategory[]>('/api/category/list')
}
