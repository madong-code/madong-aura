import BaseService from '@/api/core/base'
import type { DocProject, DocProjectSearchParams } from './types'
import request from '@/utils/http'

const baseUrl = '/docs'

/**
 * 文档项目服务
 */
export const DocProjectService = {
  ...BaseService<DocProject>({
    baseUrl,
    forbiddenMethods: ['export', 'changStatus']

  }),
  //克隆文档
  clone(id: string | number): Promise<any> {
    return request.post<any>({
      url: `${baseUrl}/clone`,
      data: {
        id,
      },
    })
  }
}
