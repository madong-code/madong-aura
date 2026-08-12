import { requestClient } from '#/api/request';

/**
 * 数据表维护服务
 * 对应后端 GeneratorTableController（域 /generator/table）
 */
export const GeneratorTableService = {
  /**
   * 数据库表列表
   */
  getTableList(params: Record<string, any>) {
    return requestClient.get('/codegen/generator/table/table-list', { params });
  },

  /**
   * 表结构
   */
  getStructure(name: string) {
    return requestClient.get(`/codegen/generator/table/${name}/structure`);
  },

  /**
   * 优化表（names 为空时优化全库）
   */
  optimize(names: string[] = []) {
    return requestClient.post('/codegen/generator/table/optimize', { names });
  },

  /**
   * 清理碎片（names 为空时清理全库）
   */
  cleanup(names: string[] = []) {
    return requestClient.post('/codegen/generator/table/cleanup', { names });
  },

  /**
   * 创建表
   */
  createTable(payload: Record<string, any>) {
    return requestClient.post('/codegen/generator/table/create', payload);
  },

  /**
   * 移入回收站
   */
  recycle(ids: (number | string)[]) {
    return requestClient.post('/codegen/generator/table/recycle', { ids });
  },

  /**
   * 回收站列表
   */
  recycleList(params: Record<string, any>) {
    return requestClient.get('/codegen/generator/table/recycle-list', {
      params,
    });
  },

  /**
   * 回收站恢复
   */
  recycleRestore(ids: (number | string)[]) {
    return requestClient.put('/codegen/generator/table/recycle/restore', {
      ids,
    });
  },

  /**
   * 回收站删除
   */
  recycleDelete(ids: (number | string)[]) {
    return requestClient.delete('/codegen/generator/table/recycle', {
      data: { ids },
    });
  },
};
