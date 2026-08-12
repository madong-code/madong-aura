/**
 * 审核操作日志 - 类型定义
 */
export interface ReviewLogRow {
  id: number;
  /** 关联审核记录 ID */
  review_id: number;
  /** 操作动作代码（如 approve/reject/cancel） */
  action: string;
  /** 操作动作展示文本 */
  action_text?: string;
  /** 操作人 ID */
  operator_id?: null | number;
  /** 操作意见/原因 */
  reason?: null | string;
  /** 操作时间（秒级时间戳） */
  created_at?: null | number | string;
}

export interface ReviewLogListRes {
  items: ReviewLogRow[];
  total: number;
}
