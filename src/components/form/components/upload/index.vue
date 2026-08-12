<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useSlots, watch } from 'vue';

import { ElButton, ElMessage } from 'element-plus';

import { Icon } from '#/components/icon';
import { useAccessStore } from '#/core/stores';

defineOptions({
  name: 'Upload',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    accept?: string;
    action?: string;
    disabled?: boolean;
    headers?: Record<string, string>;
    limit?: number;
    listType?: 'picture' | 'picture-card' | 'text';
    maxCount?: number;
    maxSize?: number;
    modelValue?: string;
    separator?: string;
    uploadName?: string;
  }>(),
  {
    modelValue: '',
    action: '/files/upload-file',
    headers: () => ({}),
    disabled: false,
    listType: 'text',
    maxCount: undefined,
    uploadName: undefined,
    separator: ',',
    accept: undefined,
    maxSize: 5 * 1024 * 1024 * 1024,
    limit: 10,
  },
);

const emit = defineEmits(['update:modelValue']);

const accessStore = useAccessStore();
const fileList = ref<any[]>([]);
const attrs = useAttrs();
const slots = useSlots();
const slotNames = computed(() => Object.keys(slots));

const bindProps = computed(() => {
  const excluded = new Set(['name', 'onBlur', 'onChange', 'onInput']);
  const filtered = Object.fromEntries(
    Object.entries(attrs).filter(([k]) => !excluded.has(k)),
  );
  return {
    ...filtered,
    ...props,
    name: props.uploadName || 'file',
  };
});

const mValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const mHeaders = computed<Record<string, string>>(() => ({
  Authorization: accessStore.accessToken ?? '',
  ...props.headers,
}));

const handleChange = (info: any) => {
  if (info.status === 'success') {
    fileList.value = fileList.value.map((item: any) => {
      if (item.uid === info.uid) {
        return {
          ...item,
          uid:
            info.response?.data?.fileInfoId ||
            info.response?.base_path ||
            info.response?.url,
        };
      }
      return item;
    });
    mValue.value = fileList.value
      .map((item: any) => item.uid)
      .join(props.separator);
  } else if (info.status === 'fail') {
    ElMessage.error(`${info.name} 上传失败`);
  }
};

const handleRemove = (file: any) => {
  mValue.value = fileList.value
    .filter((item: any) => item.uid !== file.uid)
    .map((item: any) => item.uid)
    .join(props.separator);
  return true;
};

const beforeUpload = (file: File) => {
  if (file.size > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize / 1024 / 1024} MB`);
    return false;
  }
  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map((type) => type.trim());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileExtension)) {
      ElMessage.error(`只能上传 ${props.accept} 格式的文件！`);
      return false;
    }
  }
  return true;
};

watch(
  () => props.modelValue,
  () => {
    fileList.value = [];
  },
);

onMounted(() => {
  fileList.value = [];
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
      <Icon v-if="listType === 'picture-card'" :size="24" icon="lucide:plus" />
      <ElButton v-else>
        <Icon icon="lucide:upload" class="mr-1" />
        上传文件
      </ElButton>
    </template>
    <template v-for="item in slotNames" :key="item" #[item]>
      <slot :name="item"></slot>
    </template>
  </Upload>
</template>
