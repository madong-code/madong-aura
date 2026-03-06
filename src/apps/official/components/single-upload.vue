<script setup lang="ts">
import { ref } from "vue";
import { useVModel } from "@vueuse/core";
import { ElUpload as Upload, ElButton, ElMessage } from "element-plus";
import { FilesService } from "@/api/tools/files";
import { Icon } from "@/components/icon";
import { buildStaticUrl, extractRelativePath } from "@/utils/url/static-resource";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  // 是否自动添加/移除公共路径前缀
  autoHandleBaseUrl: {
    type: Boolean,
    default: true,
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 按钮类型
  buttonType: {
    type: String as () =>
      | "primary"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "default",
    default: "primary",
  },
  // 按钮大小
  buttonSize: {
    type: String as () => "large" | "default" | "small",
    default: "default",
  },
  // 自定义按钮文本
  buttonText: {
    type: String,
    default: "",
  },
  // 上传中的提示文本
  uploadingText: {
    type: String,
    default: "上传中...",
  },
  // 接受的文件类型（accept 属性），例如：'.zip,.rar' 或 'image/*'
  accept: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:value", "change"]);
const mValue = useVModel(props, "value", emits);

// 上传中状态
const uploading = ref(false);

/**
 * 获取图片完整 URL（用于显示）
 */
const getDisplayUrl = (url: string): string => {
  if (!url) return "";
  if (!props.autoHandleBaseUrl) return url;
  return buildStaticUrl(url);
};

/**
 * 获取存储 URL（用于保存到数据库）
 */
const getStorableUrl = (url: string): string => {
  if (!url) return "";
  if (!props.autoHandleBaseUrl) return url;
  const relativePath = extractRelativePath(url);
  // 确保返回的 URL 以 / 开头
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
};

/**
 * 上传处理
 */
const customRequest = async (e: any) => {
  try {
    uploading.value = true;
    const data = await FilesService.uploadFile({
      file: e.file,
    });

    // 处理上传的文件 URL
    const fileUrl = getStorableUrl(data.base_path || "");

    // 更新父组件的值
    mValue.value = fileUrl;

    // 触发 change 事件
    emits("change", fileUrl);
  } catch (error) {
    console.error("Upload failed:", error);
    ElMessage.error("上传失败");
  } finally {
    uploading.value = false;
  }
};

/**
 * 删除文件
 */
const handleDelete = () => {
  mValue.value = "";
  emits("change", "");
};

/**
 * 点击删除按钮
 */
const onDeleteClick = (e: Event) => {
  e.stopPropagation();
  handleDelete();
};
</script>

<template>
  <div class="single-upload">
    <Upload
      :http-request="customRequest"
      :show-file-list="false"
      :disabled="disabled || uploading"
      :accept="accept"
      class="m-upload upload-trigger"
    >
      <el-button
        :type="buttonType"
        :size="buttonSize"
        :disabled="disabled || uploading"
        :loading="uploading"
      >
        <Icon icon="ant-design:upload-outlined" />
        {{ uploading ? uploadingText : buttonText || "上传文件" }}
      </el-button>
    </Upload>

    <!-- 文件预览 -->
    <div v-if="mValue" class="file-preview">
      <div class="file-info">
        <Icon
          v-if="mValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)"
          icon="ant-design:picture-outlined"
          class="file-icon"
        />
        <Icon
          v-else-if="mValue.match(/\.(pdf)$/i)"
          icon="ant-design:file-pdf-outlined"
          class="file-icon"
        />
        <Icon
          v-else-if="mValue.match(/\.(doc|docx)$/i)"
          icon="ant-design:file-word-outlined"
          class="file-icon"
        />
        <Icon
          v-else-if="mValue.match(/\.(xls|xlsx)$/i)"
          icon="ant-design:file-excel-outlined"
          class="file-icon"
        />
        <Icon
          v-else-if="mValue.match(/\.(zip|rar|7z|tar|gz)$/i)"
          icon="ant-design:file-zip-outlined"
          class="file-icon"
        />
        <Icon
          v-else
          icon="ant-design:file-outlined"
          class="file-icon"
        />

        <span class="file-name" :title="mValue">{{ mValue }}</span>

        <el-button
          link
          type="danger"
          size="small"
          :disabled="disabled"
          @click="onDeleteClick"
        >
          <Icon icon="ant-design:delete-outlined" />
          删除
        </el-button>
      </div>

      <!-- 图片预览 -->
      <img
        v-if="mValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)"
        :src="getDisplayUrl(mValue)"
        class="preview-image"
        alt="预览"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-trigger {
  :deep(.el-upload) {
    display: inline-block;
  }
}

.file-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;

  .file-icon {
    flex-shrink: 0;
    font-size: 18px;
    color: #409eff;
  }

  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: #303133;
  }
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style>
