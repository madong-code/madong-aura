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

  return {
    async list(params?: Record<string, any>): Promise<any> {
      checkMethod('list');
      return requestClient.get(baseUrl, { params });
    },

    get(id: number | string): Promise<any> {
      checkMethod('get');
      return requestClient.get(`${baseUrl}/${id}`);
    },

    create(params: Record<string, any>): Promise<any> {
      checkMethod('create');
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
      return requestClient.put(`${baseUrl}/${id}`, params);
    },

    remove(params?: Record<string, any>): Promise<any> {
      checkMethod('remove');
      return requestClient.delete(baseUrl, { params });
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
