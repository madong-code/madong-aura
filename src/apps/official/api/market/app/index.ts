import BaseService from '@/api/core/base'
import type { MarketApp, MarketAppSearchParams } from './types'
import request from '@/utils/http'


const baseUrl = '/market/apps'

/**
 * 应用服务
 */
export const MarketAppService = {
  ...BaseService<MarketApp>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  }),

  /**
   * 发布新版本
   */
  async publishVersion(data: { version: string; attachment: string, id: number | string, }) {
    return request.post({
      url: `${baseUrl}/publish-version`,
      data,
    })
  }
}
