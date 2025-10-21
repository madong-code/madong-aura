import { DeptTree } from './dept-model.d';
/**
 * 部门实体接口
 */
export interface DeptRow {
  id: string;
  pid: string | number;
  level: string;
  code: string;
  name: string;
  main_leader_id: string;
  phone: string;
  enabled: string;
  sort: string;
  children?: DeptRow[];
  remark: string;
}



export interface DeptTree {
  [key: string]: any;
  children?: DeptRow[];
  id: string;
  name: string;
  remark?: string;
  enabled: number;
}



/**
* @description: 部门树
*/
export interface DeptTree {
  id: number | string;
  /**
   * antd组件必须要这个属性 实际是没有这个属性的
   */
  key?: string;
  pid: number | string;
  name: string;
  sort: number;
  children?: DeptTableTree[];
}


/**
 * 
 */
export interface DeptOptionsTree {
  id?: number | string;
  label: string;
  value: string | number;
  children?: DeptOptionsTree[];
}

