<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElUpload, ElImage, ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  uploadType: {
    type: String as () => 'icon' | 'cover',
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const imageUrl = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const uploadRef = ref();

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!');
    return false;
  }
  return true;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const handleUpload = async (file: File) => {
  try {
    const base64 = await fileToBase64(file);
    imageUrl.value = base64;
  } catch (error: any) {
    ElMessage.error(error.message || '图片处理失败');
    uploadRef.value?.clearFiles();
  }
};

const handleRemove = () => {
  imageUrl.value = '';
};
</script>

<template>
  <div class="plugin-image-upload">
    <ElUpload
      ref="uploadRef"
      class="image-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="({ file }) => handleUpload(file)"
      accept="image/png,image/jpeg,image/jpg,image/gif"
    >
      <ElImage
        v-if="imageUrl"
        :src="imageUrl"
        fit="cover"
        class="uploaded-image"
      >
        <template #error>
          <div class="image-error">
            <Plus />
          </div>
        </template>
      </ElImage>
      <div v-else class="upload-trigger">
        <Plus class="upload-icon" />
        <div class="upload-text">{{ uploadType === 'icon' ? '上传图标' : '上传封面' }}</div>
      </div>
    </ElUpload>
    <div v-if="imageUrl" class="remove-btn" @click="handleRemove">删除</div>
  </div>
</template>

<style lang="scss" scoped>
.plugin-image-upload {
  position: relative;
  display: inline-block;

  .image-uploader {
    :deep(.el-upload) {
      position: relative;
      overflow: hidden;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }
    }

    .uploaded-image {
      width: 320px;
      height: 160px;
      display: block;

      :deep(.image-error) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: #f5f5f5;
        color: #909399;
        font-size: 28px;
      }
    }

    .upload-trigger {
      width: 320px;
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;

      .upload-icon {
        font-size: 28px;
        color: #8c939d;
        margin-bottom: 8px;
      }

      .upload-text {
        font-size: 14px;
        color: #8c939d;
      }
    }
  }

  .remove-btn {
    margin-top: 8px;
    font-size: 14px;
    color: #f56c6c;
    cursor: pointer;
    text-align: center;

    &:hover {
      color: #f23d3d;
    }
  }
}
</style>
