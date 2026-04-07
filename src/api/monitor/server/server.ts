import request from '@/utils/http'
import { type ServerInfo } from './types'

const baseUrl = '/monitor/server'

/**
 * 性能监控
 */
export const ServerService = {
    /**
     * 列表
     * @param params
     * @returns
     */
    list(params?: Record<string, any>): Promise<ServerInfo> {
        return request.get({ url: baseUrl, params })
    }
}
