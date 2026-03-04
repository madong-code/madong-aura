import BaseService from '@/api/core/base'
import type { DocMenu, DocMenuSearchParams } from './types'

const baseUrl = '/doc/menu'

/**
 * 文档目录服务
 */
export const DocMenuService = {
  ...BaseService<DocMenu>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']
  })
}
