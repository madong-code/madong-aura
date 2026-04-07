import request from '@/utils/http'
import { AuthInfo } from './types'


const baseUrl = '/madong'


/** 授权模块服务 */
export const ToolsAuthService = {
    // 获取授权信息
    getAuthInfo: (params?: any) => {
        return request.get<AuthInfo>({
            url: `${baseUrl}/auth-info`,
            params,
        })
    },

    // 设置授权信息
    setAuthInfo: (params: any) => {
        return request.post<AuthInfo>({
            url: `${baseUrl}/auth-info`,
            params,
        })
    },
    // 获取框架版本
    getFrameworkVersion: (params?: any) => {
        return request.get<any[]>({
            url: `${baseUrl}/version`,
            params,
        })
    },
}


export type * from './types';