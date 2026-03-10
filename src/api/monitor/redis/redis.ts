import request from '@/utils/http'
import { RedisMonitorData } from './redis-model'

const baseUrl = '/monitor/redis'


/**
 * Redis监控
 */
export const RedisService = {
    /**
     * 列表
     * @param params
     * @returns
     */
    list(params?: Record<string, any>): Promise<RedisMonitorData> {
        return request.get({ url: baseUrl, params })
    }
}

