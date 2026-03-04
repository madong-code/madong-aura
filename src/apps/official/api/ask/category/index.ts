import BaseService from '@/api/core/base'
import type { Category } from './types'

const baseUrl = '/ask/category'

/**
 * 分类服务
 */
export const CategoryService = {
  ...BaseService<Category>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
