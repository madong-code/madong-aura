/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'
import { AuthService } from '@/api/system/auth/auth'


/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000

/** Token刷新配置（从环境变量读取，可通过 setTokenRefreshEnabled 动态修改） */
let tokenRefreshEnabled = true // 初始化为 true，后面会被环境变量覆盖
const REFRESH_TIMEOUT = 10000 // 刷新超时 10 秒

/** Token刷新相关状态 */
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []
let refreshFailed = false
let refreshStartTime = 0

/**
 * 设置 Token 刷新开关
 * @param enabled 是否启用 token 刷新
 */
export function setTokenRefreshEnabled(enabled: boolean) {
  tokenRefreshEnabled = enabled
}

/**
 * 获取 Token 刷新开关状态
 */
export function isTokenRefreshEnabled() {
  return tokenRefreshEnabled
}

/**
 * 重置 Token 刷新状态（登录成功后调用）
 */
export function resetTokenRefreshState() {
  refreshFailed = false
  resetRefreshState()
}

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS, VITE_TOKEN_REFRESH } = import.meta.env

// 初始化 Token 刷新配置
tokenRefreshEnabled = VITE_TOKEN_REFRESH !== 'false'

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', accessToken)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    if (response.config.responseType === 'blob') return response
    const { code, msg } = response.data
    if (code === ApiStatus.success) return response
    // 业务层 401/402 由下方的 error 处理
    throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
  },
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const responseData = error.response?.data

    // 判断是否是 401/402：HTTP状态码 或 业务code
    const isAuthError = status === 401 || status === 402 ||
                        responseData?.code === 401 || responseData?.code === 402

    // 处理 401/402 错误
    if (isAuthError && originalRequest) {
      const userStore = useUserStore()
      const hasToken = userStore.hasRefreshToken()

      // 如果未启用 token 刷新，直接退出
      if (!tokenRefreshEnabled) {
        logOut()
        return Promise.reject(error)
      }

      // 如果已有刷新失败标记，直接退出
      if (refreshFailed) {
        return Promise.reject(error)
      }

      // 正在刷新中，检查是否超时
      if (isRefreshing) {
        const elapsed = Date.now() - refreshStartTime
        if (elapsed > REFRESH_TIMEOUT) {
          // 刷新超时，重置状态，允许新的刷新
          resetRefreshState()
        } else {
          // 还在刷新中，加入队列等待
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((token: string) => {
              if (token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`
                resolve(axiosInstance(originalRequest))
              } else {
                reject(error)
              }
            })
          })
        }
      }

      // 如果有 refresh token，尝试刷新
      if (hasToken) {
        isRefreshing = true
        refreshStartTime = Date.now()

        try {
          const newAccessToken = await refreshAccessToken()

          // 更新请求头并重试
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

          // 通知队列中的请求并重试
          executeRefreshSubscribers(newAccessToken)

          // 重置刷新状态
          resetRefreshState()

          return axiosInstance(originalRequest)
        } catch (e) {
          // 刷新失败，通知队列
          executeRefreshSubscribers('')
          resetRefreshState()
          refreshFailed = true
          logOut()
          return Promise.reject(error)
        }
      }

      // 没有 refresh token，直接退出
      logOut()
      return Promise.reject(error)
    }

    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 添加刷新订阅者 */
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

/** 执行刷新订阅者 */
function executeRefreshSubscribers(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

/** 重置刷新状态 */
function resetRefreshState() {
  isRefreshing = false
  refreshSubscribers = []
  refreshFailed = false
}

/** 刷新token */
async function refreshAccessToken(): Promise<string> {
  const userStore = useUserStore()

  if (!userStore.hasRefreshToken()) {
    throw new HttpError('没有可用的刷新令牌', ApiStatus.unauthorized)
  }

  try {
    // 调用刷新token接口
    const response = await AuthService.refreshAccessToken(userStore.refreshToken) as AxiosResponse
    const data = response.data

    // 检查响应结构
    if (!data || typeof data.code === 'undefined') {
      throw new HttpError('刷新响应格式错误', ApiStatus.error)
    }

    if (data.code !== ApiStatus.success) {
      if (data.code === 402) {
        throw new HttpError('登录已过期，请重新登录', 402)
      }
      throw new HttpError(data.msg || '刷新令牌失败', data.code || ApiStatus.unauthorized)
    }

    const tokenData = data.data
    if (!tokenData || !tokenData.access_token) {
      throw new HttpError('刷新响应数据错误', ApiStatus.error)
    }

    const newAccessToken = tokenData.access_token
    const newRefreshToken = tokenData.refresh_token
    const newExpiresAt = tokenData.expires_at || (Math.floor(Date.now() / 1000) + (tokenData.expires_in || 7200))

    // 更新store中的token
    userStore.updateAccessToken(newAccessToken)

    // 如果有新的refresh token，也更新
    if (newRefreshToken) {
      userStore.updateRefreshToken(newRefreshToken)
    }

    // 更新过期时间
    userStore.expiresAt = newExpiresAt

    return newAccessToken
  } catch (e) {
    // 如果是 HttpError，直接抛出
    if (e instanceof HttpError) {
      throw e
    }
    // 其他错误（如网络错误）
    throw new HttpError('刷新令牌失败，请检查网络', ApiStatus.error)
  }
}

/** 退出登录函数 */
function logOut() {
  resetRefreshState()
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    if (config.responseType === 'blob') return res.data as T

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  patch<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PATCH' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config })
  },
  upload<T = any>(
    url: string,
    data: Record<string, any> & { file: Blob | File },
    config?: ExtendedAxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else {
        formData.append(key, value)
      }
    })

    const finalConfig: ExtendedAxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }

    return retryRequest({
      url: url,
      data: formData,
      method: 'POST',
      ...finalConfig
    })
  },
  /**
   * SSE (Server-Sent Events) 请求方法
   * @param config 请求配置
   * @param eventHandlers 事件处理函数
   * @returns SSE连接对象，包含关闭方法
   */
  sse(
    config: ExtendedAxiosRequestConfig,
    eventHandlers: {
      message?: (data: any) => void;
      error?: (error: Event) => void;
      open?: () => void;
      [eventName: string]: ((data: any) => void) | undefined;
    }
  ) {
    const { url, params } = config
    if (!url) {
      throw new Error('SSE request requires a URL')
    }

    // 构建完整URL，包括baseURL
    let fullUrl = url
    // 检查是否为绝对路径
    if (!/^https?:\/\//i.test(url)) {
      // 使用VITE_API_URL作为基础URL
      fullUrl = `${VITE_API_URL}${url.startsWith('/') ? '' : '/'}${url}`
    }

    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
      }
    }

    // 添加认证token（注意：EventSource不支持自定义headers，这里使用URL参数传递token作为备选方案）
    // 如果需要在headers中传递token，可能需要使用Fetch API模拟SSE
    const { accessToken } = useUserStore()
    if (accessToken && !fullUrl.includes('token=')) {
      // 检查accessToken是否已经包含Bearer前缀
      let bearerToken = accessToken
      if (!bearerToken.startsWith('Bearer ')) {
        // 后端期望 Bearer xxx 格式，需要添加 Bearer 前缀
        bearerToken = `Bearer ${bearerToken}`
      }
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + `token=${encodeURIComponent(bearerToken)}`
    }

    // 创建EventSource
    const eventSource = new EventSource(fullUrl, {
      withCredentials: VITE_WITH_CREDENTIALS === 'true'
    })

    // 注册事件处理器
    if (eventHandlers.message) {
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          eventHandlers.message?.(data)
        } catch (error) {
          eventHandlers.message?.(event.data)
        }
      })
    }

    // 打开事件处理
    eventSource.addEventListener('open', () => {
      console.log('SSE连接已打开')
      // 调用用户提供的打开处理函数
      if (eventHandlers.open) {
        eventHandlers.open()
      }
    })

    // 注册自定义事件处理器（包括服务器发送的 error 事件）
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      if (eventName !== 'message' && eventName !== 'connectionError' && eventName !== 'open' && typeof handler === 'function') {
        eventSource.addEventListener(eventName, (event) => {
          try {
            const data = JSON.parse(event.data)
            handler(data)
          } catch (error) {
            handler(event.data)
          }
        })
      }
    })

    // 处理 EventSource 连接错误
    eventSource.addEventListener('error', (event) => {
      console.log('SSE connection error:', event)
      console.log('SSE readyState:', eventSource.readyState)

      // 如果 readyState 为 2 (CLOSED)，说明连接已关闭
      if (eventSource.readyState === 2) {
        // 调用用户提供的连接错误处理函数
        if (eventHandlers.connectionError) {
          eventHandlers.connectionError(event)
        }
      }
    })

    // 返回SSE连接对象
    return {
      eventSource,
      close: () => {
        console.log('SSE连接手动关闭')
        eventSource.close()
      },
      readyState: () => eventSource.readyState
    }
  }
}

export default api
