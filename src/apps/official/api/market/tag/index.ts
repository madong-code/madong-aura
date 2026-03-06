import BaseService from '@/api/core/base'
import type { MarketTag, MarketTagSearchParams } from './types'

const baseUrl = '/market/tag'

/**
 * 应用标签服务
 */
export const MarketTagService = {
  ...BaseService<MarketTag>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
