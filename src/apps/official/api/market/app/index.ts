import BaseService from '@/api/core/base'
import type { MarketApp, MarketAppSearchParams } from './types'

const baseUrl = '/apps'

/**
 * 应用服务
 */
export const MarketAppService = {
  ...BaseService<MarketApp>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
