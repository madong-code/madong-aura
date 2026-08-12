/**
 * 审核记录 - 类型定义
 */
export interface ReviewRow {
  id: number;
  reviewable_type: string;
  reviewable_id: number;
  status: number;
  status_text?: string;
  reason?: string;
  reviewer_id?: number;
  reviewed_at?: null | number | string;
  cancel_reason?: string;
  flow_type?: string;
  flow_instance_id?: null | string;
  extra_data?: Record<string, any>;
  applicant?: string;
  type_text?: string;
  /** 审核类型展示名（如「应用上架」），由后端字段映射返回 */
  display_name?: string;
  /** 被审核对象标题 */
  title?: string;
  /** 被审核对象内容/摘要 */
  content?: string;
  /** 审核人姓名 */
  reviewer_name?: string;
  created_at?: number | string;
  created_by?: number;
  updated_at?: number | string;
  updated_by?: number;
}

export interface ReviewEvent {
  id: number;
  action: string;
  action_text: string;
  operator_id?: null | number;
  reason?: null | string;
  created_at?: null | number | string;
  created_by?: null | number;
}

export type ReviewFormData = Record<string, any>;

export interface ReviewStatusInfo {
  status: number;
  status_text: string;
  flow_type: string;
  flow_instance_id: null | string;
  reviewer_id: null | number;
  reviewed_at: null | number | string;
  reason: null | string;
  cancel_reason: null | string;
}

export interface ReviewDetail {
  is_archived: boolean;
  review_info: ReviewRow;
  form: ReviewFormData;
  status: ReviewStatusInfo;
  events: ReviewEvent[];
}

export interface ReviewTypeItem {
  type: string;
  model: string;
  label: string;
  fields: Record<string, any>;
}

export interface ReviewListRes {
  items: ReviewRow[];
  total: number;
}
