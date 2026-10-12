<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { ElMessage, ElUpload } from 'element-plus';

import { computed, ref, watch } from 'vue';

import { ProfileService } from '#/api/auth/profile';
import { preferences } from '#/core/preferences';
import { buildStaticUrl } from '#/utils/url';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    shape?: 'circle' | 'square';
  }>(),
  {
    modelValue: '',
    shape: 'square',
  },
);

const emit = defineEmits<{
  success: [url: string];
  'update:modelValue': [modelValue: string];
}>();

const mValue = useVModel(props, 'modelValue', emit, {
  defaultValue: props.modelValue,
  passive: true,
});

/**
 * 头像地址可能是站点相对路径（/upload/avatar/...）。
 * 云存储模式下必须经 buildStaticUrl 补全 CDN 域名，
 * 否则浏览器会按前端站点域名请求（dev 下即 5500）而 404。
 */
const baseSrc = computed(() => buildStaticUrl(mValue.value || ''));

// 历史遗留头像可能指向已不存在的文件（如 CDN 上已丢失的对象），
// 加载失败时回退到内置默认头像，避免出现裂图；
// 私有空间下首帧为未签名地址（必然 403），签名地址到位后 baseSrc 变化需重置失败态
const loadFailed = ref(false);
watch([mValue, baseSrc], () => {
  loadFailed.value = false;
});

const displaySrc = computed(() =>
  loadFailed.value || !baseSrc.value
    ? preferences.app.defaultAvatar
    : baseSrc.value,
);

const customRequest = (e: any) => {
  return new Promise<void>((resolve, reject) => {
    ProfileService.uploadAvatarFile(e.file)
      .then((data) => {
        // 后端返回 { avatar: '/upload/avatar/...' } 相对路径
        const avatar = data?.avatar || '';
        if (avatar) {
          mValue.value = avatar;
          emit('success', avatar);
        }
        resolve();
      })
      .catch((error) => {
        ElMessage.error('头像上传失败');
        reject(error);
      });
  });
};

const handleRemove = (e: Event) => {
  e.stopPropagation();
  mValue.value = '';
};
</script>

<template>
  <ElUpload
    :http-request="customRequest"
    :show-file-list="false"
    class="m-upload"
    :class="`is-${shape}`"
    list-type="picture-card"
    v-bind="$attrs"
  >
    <div v-if="mValue" class="m-avatar-wrap" :class="`is-${shape}`">
      <span class="m-avatar-icon-delete" @click="handleRemove">✕</span>
      <img :src="displaySrc" width="100%" @error="loadFailed = true" />
    </div>
    <span v-else>+</span>
  </ElUpload>
</template>

<style scoped>
.m-avatar-wrap {
  position: relative;
  height: 102px;
  overflow: hidden;
}

.m-avatar-wrap.is-circle {
  border-radius: 50%;
}

.m-avatar-wrap.is-square {
  border-radius: 8px;
}

.m-avatar-icon-delete {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  font-size: 12px;
  cursor: pointer;
}

.m-avatar-wrap img {
  height: 100%;
  object-fit: cover;
}

.m-upload :deep(.el-upload--picture-card) {
  width: 102px;
  height: 102px;
}

.m-upload.is-circle :deep(.el-upload--picture-card) {
  border-radius: 50%;
}

.m-upload.is-square :deep(.el-upload--picture-card) {
  border-radius: 8px;
}
</style>
