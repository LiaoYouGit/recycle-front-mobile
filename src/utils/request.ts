// 后端API地址
const BASE_URL = 'http://localhost:8090'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  showMsg?: boolean
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

/**
 * 统一请求封装
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    showMsg = true,
  } = options

  if (showLoading) {
    uni.showLoading({ title: '加载中...' })
  }

  // 合并header
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: headers,
      success: (res) => {
        const result = res.data as ApiResponse<T>

        if (result.code === 200 && result.success) {
          resolve(result.data)
        } else {
          if (showMsg) {
            uni.showToast({
              title: result.message || '请求失败',
              icon: 'none',
            })
          }
          reject(new Error(result.message))
        }
      },
      fail: (err) => {
        if (showMsg) {
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
          })
        }
        reject(err)
      },
      complete: () => {
        if (showLoading) {
          uni.hideLoading()
        }
      },
    })
  })
}

// GET请求
export function get<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'GET', data })
}

// POST请求
export function post<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'POST', data })
}

// PUT请求
export function put<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'PUT', data })
}

// DELETE请求
export function del<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'DELETE', data })
}

export default request
