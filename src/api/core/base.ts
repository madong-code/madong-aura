import request from '@/utils/http'

type Method = 'list' | 'get' | 'create' | 'update' | 'remove' | 'export' | 'changStatus'

interface BaseApiOptions {
    baseUrl: string
    forbiddenMethods?: Method[]
    allowedMethods?: Method[]
}

function BaseService<T = any>(options: BaseApiOptions) {
    const { baseUrl, forbiddenMethods = [], allowedMethods = [] } = options

    function checkMethod(method: Method) {
        if (forbiddenMethods.includes(method)) {
            throw new Error(`${method} method is forbidden.`)
        }
        if (allowedMethods.length > 0 && !allowedMethods.includes(method)) {
            throw new Error(`${method} method is not allowed.`)
        }
    }

    return {
        async list(params?: Record<string, any>): Promise<T[]> {
            checkMethod('list')
            return request.get<T[]>({
                url: baseUrl,
                params,
            })
        },

        get(id: string | number): Promise<T> {
            checkMethod('get')
            return request.get<T>({
                url: `${baseUrl}/${id}`,
            })
        },

        create(params: Omit<T, 'id'>): Promise<T> {
            checkMethod('create')
            return request.post<T>({
                url: baseUrl,
                params,
            })
        },

        update(params: Partial<T>): Promise<T> {
            checkMethod('update')
            return request.put<T>({
                url: baseUrl,
                params,
            })
        },

        remove(params?: Record<string, any>): Promise<T> {
            checkMethod('remove')
            return request.del({
                url: `${baseUrl}/0`,
                params,
            })
        },

        delete(id: string | number, params?: Record<string, any>): Promise<T> {
            checkMethod('remove')
            return request.del({
                url: `${baseUrl}/${id}`,
                params,
            })
        },

        export(params: any) {
            checkMethod('export')
            return request.post({
                url: `${baseUrl}/export`,
                params,
            })
        },

        changStatus(params: Partial<T>): Promise<T> {
            checkMethod('changStatus')
            return request.put<T>({
                url: `${baseUrl}/change-status`,
                params,
            })
        },
        detail(params: any): Promise<T> {
            checkMethod('get')
            const { id } = params;
            return request.get<T>({
                url: `${baseUrl}/${id}`,
            })
        },
    }
}

export default BaseService
