<script setup lang="ts">
import { computed } from "vue";
import { useVModel } from "@vueuse/core";
import { ElUpload as Upload } from "element-plus";
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
  // URL 处理模式：'relative' 保存相对路径，'absolute' 保存完整 URL
  urlMode: {
    type: String,
    default: "auto", // 'auto' | 'relative' | 'absolute'
  },
  // 宽度
  width: {
    type: Number,
    default: 320,
  },
  // 高度
  height: {
    type: Number,
    default: 150,
  },
});

const emits = defineEmits(["update:value"]);
const mValue = useVModel(props, "value", emits);

/**
 * 获取图片完整 URL（用于显示）
 */
const displayUrl = computed(() => {
  if (!mValue.value) return "";

  // 如果关闭自动处理，直接返回原值
  if (!props.autoHandleBaseUrl) return mValue.value;

  // 使用静态资源模块构建 URL
  return buildStaticUrl(mValue.value);
});

/**
 * 获取存储 URL（用于保存到数据库）
 */
const getStorableUrl = (url: string): string => {
  if (!url) return "";

  // 如果关闭自动处理，直接返回原值
  if (!props.autoHandleBaseUrl) return url;

  // 使用 extractRelativePath 提取相对路径
  return extractRelativePath(url);
};

const customRequest = async (e: any) => {
  try {
    const data = await FilesService.uploadFile({
      file: e.file,
    });

    // 使用资源处理机制智能处理 URL（参考 avatar 组件，只使用 base_path）
    const processedUrl = getStorableUrl(data.base_path || "");

    // 更新值并通知父组件（参考 avatar 组件）
    mValue.value = processedUrl;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

const handleRemove = (e: Event) => {
  e.stopPropagation();
  mValue.value = "";
};
</script>

<template>
  <Upload
    :http-request="customRequest"
    :show-file-list="false"
    class="m-upload poster-uploader"
    list-type="picture-card"
    :style="{ '--poster-width': width + 'px', '--poster-height': height + 'px' }"
  >
    <div v-if="displayUrl" class="poster-preview">
      <Icon
        class="poster-delete-icon"
        icon="ant-design:delete-outlined"
        @click="handleRemove"
      />
      <img :src="displayUrl" />
    </div>
    <Icon v-else icon="ant-design:plus-outlined" />
  </Upload>
</template>

<style lang="scss" scoped>
.poster-uploader {
  :deep(.el-upload--picture-card) {
    width: var(--poster-width) !important;
    height: var(--poster-height) !important;
  }
}

.poster-preview {
  width: var(--poster-width);
  height: var(--poster-height);
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .poster-delete-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 4px;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
}
</style>
