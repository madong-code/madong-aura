<template>
  <div class="comment-review-form" v-loading="loading">
    <el-alert
      title="评论审核"
      type="info"
      :closable="false"
      class="type-alert"
    >
      <template #default>
        <span>正在审核评论类型的记录</span>
      </template>
    </el-alert>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="ID">
        <span class="value-text">{{ formData.id || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-tag type="primary">评论审核</el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="标题" :span="2">
        <div class="content-text">{{ formData.title || '-' }}</div>
      </el-descriptions-item>

      <el-descriptions-item label="申请人">
        <span class="value-text">{{ formData.applicant || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="审核状态">
        <el-tag :type="statusTagType">
          {{ formData.status_text }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="内容" :span="2">
        <el-input
          :model-value="formData.content || ''"
          type="textarea"
          :rows="8"
          readonly
          resize="none"
          class="readonly-textarea"
        />
      </el-descriptions-item>

      <el-descriptions-item v-if="formData.reviewer_name" label="审核人">
        <span class="value-text">{{ formData.reviewer_name }}</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="formData.reviewed_at_text" label="审核时间">
        <span class="value-text">{{ formData.reviewed_at_text }}</span>
      </el-descriptions-item>

      <el-descriptions-item label="创建时间" :span="2">
        <span class="value-text">{{ formData.created_at_text || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils'
import { $t } from '@/locales'

// Props
interface Props {
  formData: any
  reviewType: string
  loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  reviewType: '',
  loading: false
})

// Emits
const emit = defineEmits<{
  approve: []
  reject: [reason: string]
}>()

// 计算属性
const statusTagType = computed(() => {
  const status = props.formData?.status
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    case 3:
      return 'info'
    default:
      return 'info'
  }
})

// 方法
const formatTime = (time: any): string => {
  if (!time) return ''
  // 如果是对象格式（Carbon 格式化后的对象）
  if (typeof time === 'object' && time.formatted) {
    return time.formatted
  }
  // 如果是时间戳
  if (typeof time === 'number') {
    return formatDateTime(time)
  }
  // 其他情况直接返回字符串
  return String(time)
}

const handleApprove = () => {
  emit('approve')
}

const handleReject = () => {
  ElMessageBox.prompt($t('setting.review.detail.reject.confirm_title'), $t('setting.review.actions.reject'), {
    confirmButtonText: $t('setting.review.detail.reject.confirm_button'),
    cancelButtonText: $t('setting.review.detail.reject.cancel_button'),
    inputPattern: /.+/,
    inputErrorMessage: $t('setting.review.detail.reject.confirm_error')
  }).then(({ value }) => {
    emit('reject', value)
  }).catch(() => {})
}

// 格式化数据
watch(() => props.formData, (newData) => {
  if (newData && newData.created_at) {
    newData.created_at_text = formatTime(newData.created_at)
  }
  if (newData && newData.reviewed_at) {
    newData.reviewed_at_text = formatTime(newData.reviewed_at)
  }
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.comment-review-form {
  padding: 10px;
}

.type-alert {
  margin-bottom: 20px;
}

.value-text {
  color: #606266;
  font-size: 14px;
}

.content-text {
  color: #303133;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  padding: 4px 0;
}

.readonly-textarea {
  :deep(textarea) {
    color: #303133;
    font-size: 14px;
    line-height: 1.6;
    background-color: #fafafa;
    resize: none !important;
  }

  :deep(.el-input__wrapper) {
    padding: 8px 12px;
    background-color: #fafafa;
    box-shadow: none;
    border: 1px solid #e5e7eb;

    &:hover,
    &.is-focus {
      box-shadow: none;
      border-color: #e5e7eb;
    }
  }
}

.action-buttons {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

:deep(.el-divider__text) {
  background-color: #fff;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  background-color: #f5f5f5;
  min-width: 120px;
  width: 120px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

:deep(.el-descriptions__content) {
  color: #303133;
}
</style>
