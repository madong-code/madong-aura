export interface MemberPointsLog {
  id?: number;
  member_id?: number;
  username?: string;
  nickname?: string;
  type?: number;
  points?: number;
  points_before?: number;
  points_after?: number;
  source?: string;
  remark?: string;
  operator?: string;
  create_time?: string;
}
