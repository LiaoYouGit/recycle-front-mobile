/**
 * 格式化金额（分转元）
 */
export function formatMoney(amount: number | string, decimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化金额带符号
 */
export function formatMoneyWithSymbol(amount: number | string): string {
  return '¥' + formatMoney(amount)
}

/**
 * 解析日期字符串（兼容各种格式）
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const cleaned = dateStr.replace(/\.\d+$/, '').replace('T', ' ')
  const parts = cleaned.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/)
  if (parts) {
    return new Date(
      parseInt(parts[1]),
      parseInt(parts[2]) - 1,
      parseInt(parts[3]),
      parseInt(parts[4]),
      parseInt(parts[5]),
      parseInt(parts[6])
    )
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  const date = parseDate(dateStr)
  if (!date) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

/**
 * 格式化日期（不含时间）
 */
export function formatDate(dateStr: string | null | undefined): string {
  const date = parseDate(dateStr)
  if (!date) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 订单状态映射
 */
export const ORDER_STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: '待接单', color: '#ff9900' },
  1: { text: '已接单', color: '#1890ff' },
  2: { text: '已取货', color: '#722ed1' },
  3: { text: '已完成', color: '#52c41a' },
  4: { text: '已取消', color: '#999' },
}

/**
 * 获取订单状态文字
 */
export function getOrderStatusText(status: number): string {
  return ORDER_STATUS_MAP[status]?.text || '未知'
}

/**
 * 获取订单状态颜色
 */
export function getOrderStatusColor(status: number): string {
  return ORDER_STATUS_MAP[status]?.color || '#999'
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 500): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  } as T
}

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 校验手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}
