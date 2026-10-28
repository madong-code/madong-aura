import type { WebSiteConfig } from './types'

import { requestClient } from '#/api/request'

/** 站点设置类型对外再导出（views/web/site-config 消费） */
export type { WebSiteConfig } from './types'

const baseUrl = '/web/site-config'

export const WebSiteService = {
  /** 读取站点设置（14 键，不含 membership_enabled） */
  getConfig: () => requestClient.get<WebSiteConfig>(baseUrl),
  /** 保存站点设置（后端白名单 merge，不影响同行的 membership_enabled） */
  saveConfig: (data: Partial<WebSiteConfig>) => requestClient.post<WebSiteConfig>(baseUrl, data)
}
