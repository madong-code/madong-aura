import request from '@/utils/http'

type Method = 'list' | 'get' | 'create' | 'update' | 'patch' | 'remove' | 'delete' | 'export' | 'changStatus'

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

        // update(params: Partial<T>): Promise<T> {
        //     checkMethod('update')
        //     return request.put<T>({
        //         url: baseUrl,
        //         params,
        //     })
        // },
        update(id: string | number | Partial<T>, params?: Partial<T>): Promise<T> {
            checkMethod('update');
            if (typeof id === 'object' && id !== null) {
                //@ts-expect-error
                const { id: extractedId, ...extractedParams } = id;
                if (extractedId !== undefined) {
                    return request.put<T>({
                        url: `${baseUrl}/${extractedId}`,
                        params: extractedParams,
                    });
                } else {
                    return request.put<T>({
                        url: baseUrl,
                        params: id,
                    });
                }
            } else {
                return request.put<T>({
                    url: `${baseUrl}/${id}`,
                    params,
                });
            }
        },

        patch(id: string | number, params: Partial<T>): Promise<T> {
            checkMethod('patch')
            return request.patch<T>({
                url: `${baseUrl}/${id}`,
                params,
            })
        },

        remove(params?: Record<string, any>): Promise<T> {
            checkMethod('remove')
            return request.del({
                url: `${baseUrl}`,
                params,
            })
        },

        delete(id: string | number, params?: Record<string, any>): Promise<T> {
            checkMethod('delete')
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

        changStatus(id: string | number, params: Partial<T>): Promise<T> {
            checkMethod('changStatus')
            return request.put<T>({
                url: `${baseUrl}/${id}/change-status`,
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
