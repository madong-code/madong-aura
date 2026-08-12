/**
 *+------------------
 * madong
 *+------------------
 * Copyright (c) https://gitee.com/motion-code  All rights reserved.
 *+------------------
 * Author: Mr. April (405784684@qq.com)
 *+------------------
 * Official Website: https://madong.tech
 */

export interface MemberSignRow {
  id: number | string;
  /** 签到积分 */
  points: number;
  /** 创建时间戳 */
  created_at: number;
  /** 会员ID */
  member_id: number;
  device_ip: string;
  /** 签到日期 */
  sign_date: string;
  device_ua: string;
  /** 连续签到天数 */
  continuous_days: number;
  updated_at: number;
}
