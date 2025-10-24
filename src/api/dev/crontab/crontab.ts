import BaseService from '@/api/core/base'
import type { CrontabLogRow, CrontabRow } from './crontab-model'
import request from '@/utils/http'

const baseUrl = '/dev/crontab'

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
  start(params: Record<string, any>) {
    return request.post({
      url: `${baseUrl}/resume`,
      params
    })
  },

  /**
   * 恢复
   * @param params
   * @returns
   */
  resume(params: Record<string, any>) {
    return request.put({ url: `${baseUrl}/resume`, params })
  },

  /**
   * 暂停
   * @param params
   * @returns
   */
  pause(params: Record<string, any>) {
    return request.put({ url: `${baseUrl}/pause`, params })
  },

  /**
   * 立即执行
   * @param params
   * @returns
   */
  execute(params: Record<string, any>) {
    return request.put({ url: `${baseUrl}/execute`, params })
  }
}

/**
 * 定时任务日志
 */
export const CrontabLogService = {
  ...BaseService<CrontabLogRow>({ baseUrl: '/dev/crontab-log' })
}
