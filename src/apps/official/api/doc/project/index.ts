import BaseService from '@/api/core/base'
import type { DocProject, DocProjectSearchParams } from './types'

const baseUrl = '/doc'

/**
 * 文档项目服务
 */
export const DocProjectService = {
  ...BaseService<DocProject>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
