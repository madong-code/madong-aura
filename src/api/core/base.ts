import { requestClient } from '#/api/request';

type Method =
  | 'changStatus'
  | 'create'
  | 'delete'
  | 'export'
  | 'get'
  | 'list'
  | 'remove'
  | 'update';

interface BaseApiOptions {
  baseUrl: string;
  forbiddenMethods?: Method[];
  allowedMethods?: Method[];
  removeKey?: string;
}

function BaseService<_T = Record<string, any>>(options: BaseApiOptions) {
  const { baseUrl, forbiddenMethods = [], allowedMethods = [] } = options;

  function checkMethod(method: Method) {
    if (forbiddenMethods.includes(method)) {
      throw new Error(`${method} method is forbidden.`);
    }
    if (allowedMethods.length > 0 && !allowedMethods.includes(method)) {
      throw new Error(`${method} method is not allowed.`);
    }
  }

  // 解析最终请求地址：传入 path 则以其为准，否则按 baseUrl 拼接
  function resolve(path?: string, suffix = ''): string {
    return path ? path : `${baseUrl}${suffix}`;
  }

  return {
    async list(
      params?: Record<string, any>,
      extra?: { path?: string },
    ): Promise<any> {
      checkMethod('list');
      return requestClient.get(resolve(extra?.path), { params });
    },

    get(
      id: number | string,
      extra?: { path?: string; params?: Record<string, any> },
    ): Promise<any> {
      checkMethod('get');
      return requestClient.get(resolve(extra?.path, `/${id}`), {
        params: extra?.params,
      });
    },

    create(params: Record<string, any>): Promise<any> {
      checkMethod('create');
      const { path, data } = params as Record<string, any>;
      if (path) {
        return requestClient.post(path, data ?? params);
      }
      return requestClient.post(baseUrl, params);
    },

    update(
      id: number | Record<string, any> | string,
      params?: Record<string, any>,
    ): Promise<any> {
      checkMethod('update');
      if (typeof id === 'object' && id !== null) {
        const { id: extractedId, ...extractedParams } = id as any;
        if (extractedId !== undefined) {
          return requestClient.put(
            `${baseUrl}/${extractedId}`,
            extractedParams,
          );
        }
        return requestClient.put(baseUrl, id);
      }
      // 支持 update({ path, data }) 形式指向特殊端点
      if (params && (params as any).path) {
        const { path, data } = params as any;
        return requestClient.put(path, data ?? params);
      }
      return requestClient.put(`${baseUrl}/${id}`, params);
    },

    remove(
      ids:
        | (string | number)[]
        | { ids?: (string | number)[]; [key: string]: any },
      extra: { key?: string } = {},
    ): Promise<any> {
      checkMethod('remove');
      const key = extra.key ?? 'ids';
      // 兼容对象形式（CrudApiInstance.batchRemove 契约：remove({ ids: [...], ...pathParams })）
      const data = Array.isArray(ids)
        ? { [key]: ids }
        : { ...ids, [key]: (ids as any)?.[key] ?? [] };
      return requestClient.delete(baseUrl, { data });
    },

    delete(id: number | string, params?: Record<string, any>): Promise<any> {
      checkMethod('delete');
      return requestClient.delete(`${baseUrl}/${id}`, { params });
    },

    export(params: any) {
      checkMethod('export');
      return requestClient.post(`${baseUrl}/export`, params);
    },

    changStatus(
      id: number | string,
      params: Record<string, any>,
    ): Promise<any> {
      checkMethod('changStatus');
      return requestClient.put(`${baseUrl}/${id}/change-status`, params);
    },

    detail(params: any): Promise<any> {
      checkMethod('get');
      const { id } = params;
      return requestClient.get(`${baseUrl}/${id}`);
    },
  };
}

export default BaseService;
