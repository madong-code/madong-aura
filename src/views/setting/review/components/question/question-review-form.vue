<template>
  <div class="question-review-form" v-loading="loading">
    <el-alert
      title="提问审核"
      type="info"
      :closable="false"
      class="type-alert"
    >
      <template #default>
        <span>正在审核提问类型的记录</span>
      </template>
    </el-alert>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="ID">
        <span class="value-text">{{ formData.id || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-tag type="success">提问审核</el-tag>
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

      <el-descriptions-item label="内容" :span="2" class="content-item">
        <div class="md-preview-container">
          <MdPreview
            v-if="formData.content"
            :modelValue="formData.content"
            :theme="'light'"
            previewTheme="default"
            codeTheme="atom"
          />
          <div v-else class="content-text">-</div>
        </div>
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
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
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
const emit = defineEmits<{}>()

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
.question-review-form {
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

// Markdown 预览容器 - 限制宽度并允许水平滚动
.md-preview-container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 500px;

  :deep(.md-editor) {
    width: 100% !important;
    max-width: 100% !important;
  }

  :deep(.md-editor-preview-wrapper) {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  :deep(.md-editor-preview) {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  // 代码块水平滚动
  :deep(.md-editor-preview pre) {
    max-width: 100% !important;
    overflow-x: auto !important;
    white-space: pre !important;
  }

  :deep(.md-editor-preview pre code) {
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  // 表格水平滚动
  :deep(.md-editor-preview table) {
    display: block;
    overflow-x: auto;
    max-width: 100%;
  }

  // 其他内容自动换行
  :deep(.md-editor-preview p),
  :deep(.md-editor-preview div),
  :deep(.md-editor-preview ul),
  :deep(.md-editor-preview ol),
  :deep(.md-editor-preview li) {
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    overflow-wrap: break-word;
  }

  :deep(.md-editor-preview-only) {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  // 限制代码块容器 - 关键修复
  :deep(.md-editor-code) {
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  :deep(.md-editor-code-head) {
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  // 限制代码块内容
  :deep(.md-editor-code pre) {
    max-width: 100% !important;
    overflow-x: auto !important;
    white-space: pre !important;
  }

  :deep(.md-editor-code pre code) {
    max-width: 100% !important;
    overflow-x: auto !important;
    display: block !important;
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

// 确保 content item 不溢出
:deep(.content-item) {
  overflow: hidden;
}

// 从 el-descriptions 开始限制宽度 - 根本解决方案
:deep(.el-descriptions) {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  table-layout: fixed;
}

:deep(.el-descriptions__body) {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background-color: #fafafa;
}

:deep(.el-descriptions__table) {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  table-layout: fixed;
}

:deep(.el-descriptions__row) {
  width: 100%;
  max-width: 100%;
}

:deep(.el-descriptions__cell) {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 12px 16px;
}

:deep(.el-descriptions__content) {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  color: #303133;
  position: relative;
}
</style>
