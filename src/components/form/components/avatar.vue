<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { ElUpload as Upload } from "element-plus";

import { FilesService } from "@/api/system/files";
import { Icon } from "@/components/icon";
import { fullUrl, stripBaseUrl } from "@/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  // 是否自动添加/移除公共路径前缀
  autoHandleBaseUrl: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["update:modelValue", "change"]);
const mValue = useVModel(props, "modelValue", emits, {
  defaultValue: props.modelValue,
  passive: true,
});

// 处理显示URL（确保回显时带公共路径）
const displayUrl = computed(() => {
  return props.autoHandleBaseUrl && mValue.value ? fullUrl(mValue.value) : mValue.value;
});

// 处理存储URL（确保存储时无公共路径）
const getStorableUrl = (url: string) => {
  return props.autoHandleBaseUrl ? stripBaseUrl(url) : url;
};

const customRequest = (e: any) => {
  return new Promise((resolve, reject) => {
    FilesService.uploadFile({
      file: e.file,
    })
      .then((data: any) => {
        mValue.value = data.base_path;
        resolve(data);
      })
      .catch(reject);
  });
};

// const customRequest = async (e: any) => {
//   try {
//     const data = await FilesService.uploadFile({
//       file: e.file,
//     });
//     const processedUrl = getStorableUrl(data.base_path || "");
//     mValue.value = processedUrl;
//     emits("update:modelValue", processedUrl);
//   } catch (error) {
//     console.error("Upload failed:", error);
//   }
// };

const handleRemove = (e: Event) => {
  e.stopPropagation();
  mValue.value = "";
  emits("update:modelValue", "");
};
</script>
<template>
  <Upload
    :http-request="customRequest"
    :show-file-list="false"
    class="m-upload"
    list-type="picture-card"
  >
    <div v-if="displayUrl" class="m-avatar-wrap">
      <Icon class="m-avatar-icon-delete" icon="&#xe783;" @click="handleRemove" />
      <img :src="displayUrl" width="100%" />
    </div>
    <Icon v-else icon="&#xe6c6;" />
  </Upload>
</template>
<style lang="scss" scoped>
.m-avatar-wrap {
  position: relative;
  height: 102px;
  .m-avatar-icon-delete {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
}
.m-upload {
  :deep(.el-upload--picture-card) {
    width: 102px;
    height: 102px;
  }
}
</style>
