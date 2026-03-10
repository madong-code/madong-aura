/**
 * 会员标签模型
 */
export interface MemberTag {
  id?: number;
  name?: string;
  color?: string;
  description?: string;
  member_count?: number;
  sort?: number;
  status?: number;
  create_time?: string;
}