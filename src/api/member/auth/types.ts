export interface MemberAuthInfo {
  id: number | string;
  member_id: number | string;
  auth_type: string;
  openid: string;
  unionid?: string;
  nickname?: string;
  avatar?: string;
}
