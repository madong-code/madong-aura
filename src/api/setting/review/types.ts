// 审核列表请求参数
export interface ReviewListRequest {
  page?: number
  limit?: number
  title?: string
  type?: string  // 改为string类型，对应reviewable_type
  status?: number
  applicant?: string
  LIKE_title?: string
  LIKE_applicant?: string
  reviewable_type?: string // 新增：审核类型（morph_map别名）
}

// 审核项（支持插件字段映射）
export interface ReviewRow {
  // 基础字段
  id: number
  status: number
  status_text: string
  reason?: string
  reviewer_id?: number
  reviewer_name?: string
  reviewed_at?: number
  created_at: number
  updated_at: number
  
  // 关联信息
  reviewable_type: string
  reviewable_id: number
  display_name?: string  // 审核类型显示名称
  morph_alias?: string   // morph_map别名
  
  // 映射字段（通过配置动态生成）
  title: string
  content: string
  applicant: string
  
  // 额外映射字段（插件自定义）
  [key: string]: any
  
  // 关联对象
  reviewer?: {
    id: number
    user_name: string
    real_name: string
    nick_name: string
  }
}

// 审核类型配置
export interface ReviewTypeConfig {
  display_name: string
  model?: string
  morph_alias?: string
  priority?: number
  icon?: string
  color?: string
  fields?: Record<string, ReviewFieldConfig>
}

// 字段配置
export interface ReviewFieldConfig {
  type: 'attribute' | 'relation' | 'callback' | 'fixed'
  source?: string
  attribute?: string
  label: string
  fallback?: string
  format?: string
  multiple?: boolean
  callback?: Function
}

// 创建审核请求参数
export interface ReviewCreateRequest {
  reviewable_type: string  // 审核类型（morph_map别名）
  reviewable_id: number    // 关联对象ID
  reason?: string          // 审核原因
  flow_instance_id?: string // 审批流实例ID
  extra_data?: Record<string, any> // 扩展数据
}

// 更新审核请求参数
export interface ReviewUpdateRequest {
  reason?: string
  review_note?: string
}

// 审核操作响应
export interface ReviewActionResult {
  success: boolean
  message: string
  data?: any
}