import BaseService from '@/api/core/base'
import type { Tag, TagSearchParams } from './types'

const baseUrl = '/ask/tag'

/**
 * 标签服务
 */
export const TagService = {
  ...BaseService<Tag>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
