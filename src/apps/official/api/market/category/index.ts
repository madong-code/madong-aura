import BaseService from '@/api/core/base'
import type { MarketCategory } from './types'

const baseUrl = '/apps/category'

/**
 * 应用分类服务
 */
export const MarketCategoryService = {
  ...BaseService<MarketCategory>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
