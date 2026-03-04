import BaseService from '@/api/core/base'
import type { DocContent, DocContentSearchParams } from './types'

const baseUrl = '/doc/content'

/**
 * 文档内容服务
 */
export const DocContentService = {
  ...BaseService<DocContent>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
