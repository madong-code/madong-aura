/**
 * 会员余额记录模型
 */
export interface MemberBalanceLog {
  id?: number;
  member_id?: number;
  username?: string;
  nickname?: string;
  type?: number;
  amount?: number;
  balance_before?: number;
  balance_after?: number;
  remark?: string;
  operator?: string;
  create_time?: string;
}