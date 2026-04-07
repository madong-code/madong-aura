<template>
  <Dialog>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 动态表单：根据 reviewable_type 显示不同的表单 -->
    <div v-else-if="formData" class="drawer-content">
      <component
        :is="currentFormComponent"
        :form-data="formData"
        :review-type="reviewableType"
        :loading="loading"
      />

      <!-- 底部审核按钮 -->
      <div v-if="formData.status === 0" class="action-buttons ml-2">
        <el-button type="danger" @click="handleReject">{{ $t("setting.review.actions.reject") }}</el-button>
        <el-button type="primary" @click="handleApprove">{{ $t("setting.review.actions.approve") }}</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDialog } from "@/components/dialog";
import { ReviewService } from "@/api/setting/review";
import { formatDateTime } from "@/utils";
import { $t } from "@/locales";

// 类型表单组件（从模块目录导入）
const QuestionReviewForm = defineAsyncComponent(() =>
  import("./question/index").then((m) => m.QuestionReviewForm)
);

const CommentReviewForm = defineAsyncComponent(() =>
  import("./comment/index").then((m) => m.CommentReviewForm)
);

const DefaultReviewForm = defineAsyncComponent(() =>
  import("./default/index").then((m) => m.DefaultReviewForm)
);

const record = ref<any>({});
const crudApi = ref<any>();

const [Dialog, dialogApi] = useDialog({
  title: $t("setting.review.detail.title"),
  width: "70%",
  dialogType: "drawer",
  footer: false,
  modal: true,
  closeOnClickModal: true,
  destroyOnClose: true,
});

// 响应式数据
const loading = ref(false);
const formData = ref<any>(null);

// 计算属性
const reviewableType = computed(() => {
  return formData.value?.morph_alias || formData.value?.reviewable_type || "";
});

// 当前表单组件
const currentFormComponent = computed(() => {
  const type = reviewableType.value.toLowerCase();
  switch (type) {
    case "question":
      return QuestionReviewForm;
    case "comment":
      return CommentReviewForm;
    // 其他类型默认使用 更多表单实现
    default:
      return DefaultReviewForm;
  }
});

// 方法
const loadReviewDetail = async (reviewId: number) => {
  if (!reviewId) return;

  loading.value = true;
  try {
    const response = await ReviewService.get(reviewId);
    formData.value = formatReviewData(response);
  } catch (error) {
    console.error("加载审核详情失败:", error);
    ElMessage.error($t("setting.review.detail.load_failed"));
  } finally {
    loading.value = false;
  }
};

const formatReviewData = (data: any) => {
  if (!data) return null;

  const formatTime = (time: any) => {
    if (!time) return "";
    // 如果是对象格式（Carbon 格式化后的对象）
    if (typeof time === "object" && time.formatted) {
      return time.formatted;
    }
    // 如果是时间戳
    if (typeof time === "number") {
      return formatDateTime(time);
    }
    // 其他情况直接返回字符串
    return String(time);
  };

  return {
    ...data,
    created_at_text: formatTime(data.created_at),
    reviewed_at_text: formatTime(data.reviewed_at),
  };
};

const handleClose = () => {
  dialogApi.close();
  formData.value = null;
};

const handleApprove = async () => {
  try {
     const { value: reason } = await ElMessageBox.prompt($t("setting.review.detail.approve.confirm_title"), $t("setting.review.actions.approve"), {
      confirmButtonText: $t("setting.review.detail.approve.confirm_button"),
      cancelButtonText: $t("setting.review.detail.approve.cancel_button"),
      inputPattern: /.+/,
      inputErrorMessage: $t("setting.review.detail.approve.confirm_error"),
    });
    await ReviewService.approve(formData.value.id);
    if (crudApi.value) {
      crudApi.value.reload();
    }
    handleClose();
    ElMessage.success($t("setting.review.detail.approve.success"));
  } catch (error) {
    ElMessage.error($t("setting.review.detail.approve.failed"));
  }
};

const handleReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt($t("setting.review.detail.reject.confirm_title"), $t("setting.review.actions.reject"), {
      confirmButtonText: $t("setting.review.detail.reject.confirm_button"),
      cancelButtonText: $t("setting.review.detail.reject.cancel_button"),
      inputPattern: /.+/,
      inputErrorMessage: $t("setting.review.detail.reject.confirm_error"),
    });
    await ReviewService.reject(formData.value.id, reason);
    if (crudApi.value) {
      crudApi.value.reload();
    }
    handleClose();
    ElMessage.success($t("setting.review.detail.reject.success"));
  } catch (error) {
    // 用户取消操作不显示错误
    if (error !== "cancel") {
      ElMessage.error($t("setting.review.detail.reject.failed"));
    }
  }
};

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => any }) {
    record.value = data;
    crudApi.value = getCrudApi();
    dialogApi.setState({
      title: `${data.reviewable_id}-${$t("setting.review.detail.title")}`,
    });
    dialogApi.open();
    // 通过 data.id 获取后端数据
    loadReviewDetail(data.id);
  },
});
</script>

<style lang="scss" scoped>
.loading-wrapper {
  padding: 20px;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.action-buttons {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 10;
}

// 限制 Markdown 编辑器预览区域的高度，防止超出
:deep(.md-editor-preview) {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.md-editor-preview-wrapper) {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

// 限制代码块宽度，支持水平滚动 - 关键修复
:deep(.md-editor-code) {
  max-width: 100% !important;
  overflow-x: auto !important;
}

:deep(.md-editor-code-head) {
  max-width: 100% !important;
  overflow-x: auto !important;
}

:deep(.md-editor-preview pre) {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre;
}

:deep(.md-editor-preview pre code) {
  max-width: 100% !important;
  overflow-x: auto !important;
  display: block !important;
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

// 限制表格宽度
:deep(.md-editor-preview table) {
  max-width: 100%;
  overflow-x: auto;
  display: block;
}

// 限制其他可能超长的内容
:deep(.md-editor-preview p),
:deep(.md-editor-preview div),
:deep(.md-editor-preview ul),
:deep(.md-editor-preview ol) {
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

// 确保 MdPreview 不会超出容器
:deep(.md-editor) {
  max-width: 100% !important;
  width: 100% !important;
}

:deep(.md-editor-preview-only) {
  max-width: 100% !important;
  overflow-x: hidden !important;
}

// 从根元素开始限制宽度 - 根本解决方案
:deep(.el-descriptions) {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
  table-layout: fixed;
}

:deep(.el-descriptions__body) {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
}

:deep(.el-descriptions__table) {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
  table-layout: fixed;
}

:deep(.el-descriptions__row) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.el-descriptions__cell) {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
}

:deep(.el-descriptions__content) {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
  position: relative;
}
</style>
