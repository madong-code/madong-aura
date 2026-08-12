<script setup lang="ts">
import { watch } from 'vue';

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
} from 'element-plus';
import { ArrowLeft, Check, Settings } from 'lucide-vue-next';

import { useVbenModal } from '#/core/ui/common';
import { $t } from '#/locales';

defineOptions({ name: 'TerminalConfigDialog' });

const props = defineProps<{
  formData: {
    automatic_cleanup_task: string;
    composer_registry: string;
    npm_registry: string;
    package_manager: string;
  };
  visible: boolean;
}>();

const emit = defineEmits<{
  changeCleanup: [val: string];
  changePackageManager: [val: string];
  changeRegistry: [val: string, type: 'composer' | 'npm'];
  close: [];
  save: [];
}>();

const [Modal, modalApi] = useVbenModal({
  title: ' ',
  class: 'w-[640px]',
  draggable: true,
  closable: true,
  showConfirmButton: false,
  showCancelButton: false,
  footer: true,
  destroyOnClose: false,
  closeOnClickModal: false,
});

// 同步 visible prop 到 modal 显隐
watch(
  () => props.visible,
  (val) => {
    if (val) {
      modalApi.open();
    } else {
      modalApi.close();
    }
  },
);

function handleClose() {
  emit('close');
}

function handleSave() {
  emit('save');
}
</script>

<template>
  <Modal>
    <template #title>
      <div class="flex items-center gap-2">
        <Settings class="size-[18px]" />
        <span class="font-bold text-base">{{
          $t('devtools.terminal.title')
        }}</span>
      </div>
    </template>
    <template #footer>
      <div class="mt-4 flex items-center justify-end gap-3 border-t pt-4">
        <ElButton @click="handleClose">
          <template #icon>
            <ArrowLeft class="size-3.5" />
          </template>
          {{ $t('devtools.terminal.actions.return_terminal') }}
        </ElButton>
        <ElButton type="primary" @click="handleSave">
          <template #icon>
            <Check class="size-3.5" />
          </template>
          {{ $t('common.operate.save') }}
        </ElButton>
      </div>
    </template>
    <div>
      <ElForm :model="formData" label-width="120px">
        <ElFormItem :label="$t('devtools.terminal.form.npm_registry')">
          <ElSelect
            :model-value="formData.npm_registry"
            :placeholder="$t('devtools.terminal.form.placeholder.npm_registry')"
            clearable
            style="width: 100%"
            @update:model-value="
              (val) => $emit('changeRegistry', String(val), 'npm')
            "
          >
            <ElOption label="NPM" value="npm" />
            <ElOption label="Taobao" value="taobao" />
            <ElOption label="Tencent" value="tencent" />
            <ElOption label="Huawei" value="huawei" />
            <ElOption label="Aliyun" value="aliyun" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem :label="$t('devtools.terminal.form.composer_registry')">
          <ElSelect
            :model-value="formData.composer_registry"
            :placeholder="
              $t('devtools.terminal.form.placeholder.composer_registry')
            "
            clearable
            style="width: 100%"
            @update:model-value="
              (val) => $emit('changeRegistry', String(val), 'composer')
            "
          >
            <ElOption label="Composer" value="composer" />
            <ElOption label="Huawei" value="huawei" />
            <ElOption label="Aliyun" value="aliyun" />
            <ElOption label="Tencent" value="tencent" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem :label="$t('devtools.terminal.form.package_manager')">
          <ElSelect
            :model-value="formData.package_manager"
            :placeholder="
              $t('devtools.terminal.form.placeholder.package_manager')
            "
            clearable
            style="width: 100%"
            @update:model-value="
              (val) => $emit('changePackageManager', String(val))
            "
          >
            <ElOption label="NPM" value="npm" />
            <ElOption label="CNPM" value="cnpm" />
            <ElOption label="PNPM" value="pnpm" />
            <ElOption label="YARN" value="yarn" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem
          :label="$t('devtools.terminal.form.automatic_cleanup_task')"
        >
          <ElRadioGroup
            :model-value="formData.automatic_cleanup_task"
            @update:model-value="(val) => $emit('changeCleanup', String(val))"
          >
            <ElRadioButton value="0">{{ $t('common.no') }}</ElRadioButton>
            <ElRadioButton value="1">{{ $t('common.yes') }}</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
    </div>
  </Modal>
</template>
