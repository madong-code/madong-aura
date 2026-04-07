import BaseService from '@/api/core/base'
import type { CrontabLogRow, CrontabRow } from './types'
import request from '@/utils/http'

const baseUrl = '/crontab/task'

/**
 * 定时任务
 */
export const CrontabService = {
  ...BaseService<CrontabRow>({ baseUrl }),

  /**
   * 启动
   * @param params
   * @returns
   */
  start(id: string | number, params?: Record<string, any>) {
    return request.put({
      url: `${baseUrl}/${id}/resume`,
      params
    })
  },

  /**
   * 恢复
   * @param params
   * @returns
   */
  resume(id: string | number, params?: Record<string, any>) {
    return request.put({ url: `${baseUrl}/${id}/resume`, params })
  },

  /**
   * 暂停
   * @param params
   * @returns
   */
  pause(id: string | number, params?: Record<string, any>) {
    return request.put({ url: `${baseUrl}/${id}/pause`, params })
  },

  /**
   * 立即执行
   * @param params
   * @returns
   */
  execute(id: string | number, params?: Record<string, any>) {
    return request.put({ url: `${baseUrl}/${id}/execute`, params })
  }
}

/**
 * 定时任务日志
 */
export const CrontabLogService = {
  ...BaseService<CrontabLogRow>({ baseUrl: '/crontab/log' })
}
