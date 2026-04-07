<script setup lang="ts">
import type { PropType } from "vue";

import { computed, onMounted, ref, useAttrs, watch } from "vue";

import { ElMessage as message, ElUpload as Upload } from "element-plus";

import { FilesService } from "@/api/tools/files";
import { Icon } from "@/components/icon";
import { useUserStore } from "@/store/modules/user";
import { omit } from "lodash-es";
const abortMultipartUpload = FilesService.abortMultipartUpload,
  completeMultipartUpload = FilesService.completeMultipartUpload,
  getFileInfoByIds = FilesService.getFileInfoByIds,
  initiateMultipartUpload = FilesService.initiateMultipartUpload,
  uploadPart = FilesService.uploadPart;
defineOptions({
  name: "Upload",
  inheritAttrs: false,
});
const props = defineProps({
  value: {
    // 文件id，多个使用英文逗号分割
    type: [String] as PropType<string>,
    default: undefined,
  },
  action: {
    // 上传的地址
    type: String,
    default: `${import.meta.env.VITE_API_URL}/files/upload-file`,
  },
  headers: {
    // 上传请求的 headers
    type: Object,
    default: () => ({}),
  },
  disabled: {
    // 是否禁用
    type: Boolean,
    default: false,
  },
  listType: {
    // 上传类型
    type: String as PropType<"picture" | "picture-card" | "text">,
    default: "text",
  },
  maxCount: {
    // 最大上传数量
    type: Number,
    default: undefined,
  },
  uploadName: {
    // 文件上传字段名,name被字段名覆写了，要换成uploadName
    type: String,
    default: undefined,
  },
  separator: {
    // 文件id分隔符
    type: String,
    default: ",",
  },
  accept: {
    // 接受的文件类型
    type: String,
    default: undefined,
  },
  multipart: {
    // 是否启用分片上传
    type: Boolean,
    default: false,
  },
  chunkSize: {
    // 分片大小（字节）
    type: Number,
    default: 5 * 1024 * 1024, // 默认5MB
  },
  maxSize: {
    // 最大文件大小
    type: Number,
    default: 5 * 1024 * 1024 * 1024, // 默认5GB
  },
  objectType: {
    // 对象类型
    type: String,
    default: "default",
  },
  limit: {
    // 最大上传数量
    type: Number,
    default: 10,
  },
});
const emits = defineEmits(["update:value"]);
const { accessToken } = useUserStore();
const fileList = ref<any[]>([]);
// 新增状态
const uploadId = ref<string>(""); // 上传会话ID
const currentChunk = ref<number>(0); // 当前分片序号
const totalChunks = ref<number>(0); // 总分片数
const isUploading = ref(false); // 上传状态标志
const uploadProgress = ref<number>(0); // 上传进度
const attrs = useAttrs();
const bindProps = computed(() => {
  return {
    ...omit(attrs, ["onChange", "onInput", "onBlur", "name"]),
    ...props,
    name: props.uploadName || "file",
  };
});
// 初始化分片上传
const initializeChunk = async (file: File) => {
  try {
    const initData = {
      contentType: file.type,
      originalFilename: file.name,
      objectType: props.objectType,
      size: file.size.toString(),
    };
    const response = await initiateMultipartUpload(initData);
    if (!response) throw new Error("初始化切片失败");
    return response;
  } catch (error) {
    message.error("初始化切片失败");
    throw error;
  }
};

// 文件切片
const createFileChunks = (file: File) => {
  const chunks = [];
  let start = 0;
  let index = 0;
  totalChunks.value = Math.ceil(file.size / props.chunkSize);

  while (start < file.size) {
    const chunk = file.slice(start, start + props.chunkSize);
    chunks.push({
      chunk,
      index,
    });
    start += props.chunkSize;
    index++;
  }
  return chunks;
};

// 上传单个切片
const uploadChunk = async (
  chunk: Blob,
  filename: string,
  uploadId: string,
  fileInfoId: string,
  index: number
) => {
  await uploadPart({
    partNumber: index + 1,
    uploadId,
    fileInfoId,
    file: new File([chunk], filename),
  });
  currentChunk.value = index + 1;
  uploadProgress.value = Math.round(((index + 1) / totalChunks.value) * 100);
};

// 分片上传方法
const uploadMultipart = async (file: File) => {
  try {
    isUploading.value = true;
    uploadProgress.value = 0;

    // 1. 初始化分片上传
    const initResponse: any = await initializeChunk(file);
    uploadId.value = initResponse.uploadId;
    const fileInfoId = initResponse.fileInfoId;

    // 2. 分片上传
    const chunks = createFileChunks(file);
    for (const chunk of chunks) {
      try {
        await uploadChunk(
          chunk.chunk,
          file.name,
          uploadId.value,
          fileInfoId,
          chunk.index
        );
      } catch {
        // 取消上传
        await abortMultipartUpload({
          fileInfoId,
        });
        return {};
      }
    }

    // 3. 完成上传
    const completeRes: any = await completeMultipartUpload({
      uploadId: uploadId.value,
      fileInfoId,
    });

    return {
      uid: completeRes.fileInfoId,
      name: file.name,
      status: "success",
      response: { data: { fileInfoId: completeRes.fileInfoId } },
    };
  } catch (error) {
    message.error(`${file.name} 上传失败`);
    throw error;
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};
const _getFileInfoByIds = (val: string | string[] | undefined) => {
  if (!val) return;
  getFileInfoByIds({
    fileInfoIds: val,
  }).then((res) => {
    if (!Array.isArray(res)) {
      console.warn("Expected array from getFileInfoByIds, but got:", res);
      return;
    }
    fileList.value = (res || []).map((item: any) => {
      return {
        ...item,
        url:
          props.listType === "text"
            ? item.previewUrl || item.fullUrl || item.url
            : item.fullUrl || item.url,
      };
    });
  });
};
const mValue = computed({
  get() {
    return props.value;
  },
  set(val) {
    emits("update:value", val);
  },
});
const mHeaders = {
  Authorization: accessToken,
  ...props.headers,
};
const handleChange = (info: any) => {
  if (info.status === "success") {
    // 更新file-list当前file的uid
    fileList.value = fileList.value.map((item: any) => {
      if (item.uid === info.uid) {
        return {
          ...item,
          uid: info.response.data.fileInfoId,
        };
      }
      return item;
    });
    mValue.value = fileList.value
      .map((item: any) => {
        return item.uid;
      })
      .join(props.separator);
  } else if (info.status === "fail") {
    message.error(`${info.name} file upload failed.`);
  }

  if (props.accept) {
    const acceptedTypes = props.accept.split(",").map((type) => type.trim());
    const fileExtension = `.${info.file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      // 清除fileList中的无效文件
      fileList.value = fileList.value.filter((item) => item.uid !== info.file.uid);
    }
  }
};
const handleRemove = (file: any) => {
  mValue.value = fileList.value
    .filter((item: any) => item.uid !== file.uid)
    .map((item: any) => item.uid)
    .join(props.separator);
  return true;
};
const beforeUpload = async (file: File) => {
  // 文件大小校验
  if (file.size > props.maxSize) {
    message.error(`文件大小不能超过${props.maxSize / 1024 / 1024}MB`);
    return false;
  }

  // 文件类型验证
  if (props.accept) {
    const acceptedTypes = props.accept.split(",").map((type) => type.trim());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      message.error(`只能上传 ${props.accept} 格式的文件！`);
      return false;
    }
  }

  // 分片上传
  if (props.multipart) {
    try {
      const result = await uploadMultipart(file);
      if (Object.keys(result).length === 0) {
        message.error("分片上传失败");
        return false;
      }
      // 手动更新fileList和value
      fileList.value = [
        ...fileList.value,
        {
          ...(result as any),
          status: "success",
        },
      ];
      mValue.value = fileList.value
        .filter((item: any) => item.status === "success" || item.status === "done")
        .map((item: any) => item.uid)
        .join(props.separator);
      return false; // 返回false阻止后续action上传
    } catch {
      return false;
    }
  }

  return true; // 非分片上传保持原逻辑
};

watch(
  () => props.value,
  (val) => {
    if (!(val || "").includes("vc-upload")) {
      _getFileInfoByIds(val);
    }
  }
);
onMounted(() => {
  _getFileInfoByIds(props.value);
});
</script>
<template>
  <Upload
    v-model:file-list="fileList"
    v-bind="bindProps"
    :action="action"
    :disabled="disabled"
    :headers="mHeaders"
    :list-type="listType"
    :max-count="maxCount"
    :before-upload="beforeUpload"
    @change="handleChange"
    @remove="handleRemove"
  >
    <template #default>
      <Icon
        v-if="listType === 'picture-card'"
        :size="24"
        icon="ant-design:plus-outlined"
      />
      <ElButton v-else :loading="isUploading">
        {{ isUploading ? "上传中..." : "上传文件" }}
        <template #icon>
          <Icon icon="ant-design:cloud-upload-outlined" />
        </template>
      </ElButton>
    </template>
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </Upload>
  <!-- 分片上传进度展示 -->
  <div v-if="isUploading" class="upload-progress">
    <div class="progress-info">
      <span>上传进度: {{ uploadProgress }}%</span>
      <span>分片: {{ currentChunk }}/{{ totalChunks }}</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>

    <!-- 分片详情进度 -->
    <div v-if="totalChunks > 1" class="chunks-progress">
      <div
        v-for="(_, index) in totalChunks"
        :key="index"
        class="chunk-item"
        :class="{ completed: index < currentChunk }"
      ></div>
    </div>
  </div>
</template>
<style scoped>
.upload-progress {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.progress-bar-container {
  height: 6px;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 3px;
}

.progress-bar {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s;
}

.chunks-progress {
  display: flex;
  gap: 2px;
  margin-top: 8px;
}

.chunk-item {
  flex: 1;
  height: 4px;
  background-color: #e8e8e8;
  border-radius: 2px;
}

.chunk-item.completed {
  background-color: #52c41a;
}
</style>
