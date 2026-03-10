import request from '@/utils/http'
import BaseService from '../../../core/base'


const baseUrl = '/generator/code'

// 代码生成服务
export const GeneratorCodeService = {
    ...BaseService<any>({ baseUrl }),
    getTableList: (params?: any) => {
        return request.get({
            url: `${baseUrl}/table-list`,
            params,
        })
    },
    getPluginDevList: (params?: any) => {
        return request.get({
            url: `/plugin-dev`,
            params,
        })
    },
    getPreview: (id: number | string) => {
        return request.get({
            url: `${baseUrl}/${id}/preview`,
        })
    },
    download: (id: string | number, params?: any) => {
        return request.get({
            url: `${baseUrl}/${id}/download`,
            responseType: 'blob',
            timeout: 20 * 1000,
            params,
        })
    },

    deploy: (id: number | string, params?: any) => {
        return request.put({
            url: `${baseUrl}/${id}/deploy`,
            params,
        })
    },

}

