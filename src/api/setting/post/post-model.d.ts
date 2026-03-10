
/**
 * 职位接口
 */
export interface PostRow {
  id: number | string;
  dept_id: string | number;
  code: string;
  name: string;
  sort: number;
  enabled: number;
  remark: string;
}
