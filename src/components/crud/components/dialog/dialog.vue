<script setup lang="ts">
import type { FormActionType, FormDialogOptions } from './types';

import { computed, nextTick, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer, useVbenModal } from '#/core/ui/common';
import { $t } from '#/locales';

import { DetailViewer } from '../viewer';

const props = defineProps<{
  options: FormDialogOptions;
}>();

const viewType = ref<FormActionType>('view');
const currentRow = ref<Record<string, any>>({});

// 解析 schema：支持函数和数组
const formSchema = computed(() => {
  const schema =
    typeof props.options.schema === 'function'
      ? props.options.schema()
      : props.options.schema;
  return schema || [];
});

// 对齐方式转 CSS 类（默认右对齐）
function alignToClass(align?: 'left' | 'right'): string {
  if (!align) return 'text-right';
  return align === 'left' ? 'text-left' : 'text-right';
}

// DetailViewer 的 commonConfig：从 FormDialogOptions 的 commonConfig 中提取
const detailCommonConfig = computed(() => {
  const common = props.options.commonConfig;
  if (!common) return undefined;
  return {
    labelClass: alignToClass(common.detailLabelAlign ?? common.labelAlign),
    labelWidth: common.labelWidth,
    labelAlign: common.detailLabelAlign ?? common.labelAlign ?? 'right',
    controlClass: common.controlClass,
    wrapperClass: common.wrapperClass,
    hideLabel: common.hideLabel,
    hideRequiredMark: common.hideRequiredMark,
    formItemClass:
      typeof common.formItemClass === 'function'
        ? undefined
        : common.formItemClass,
  };
});

// 表单的 commonConfig：从 FormDialogOptions 的 commonConfig 中提取
const formCommonConfig = computed(() => {
  const common = props.options.commonConfig;
  if (!common) return undefined;
  return {
    labelWidth: common.labelWidth,
    labelClass: alignToClass(common.formLabelAlign ?? common.labelAlign),
    hideLabel: common.hideLabel,
    hideRequiredMark: common.hideRequiredMark,
    controlClass: common.controlClass,
    wrapperClass: common.wrapperClass,
  };
});

// 构建 useVbenForm 的完整参数，兼容所有 VbenFormProps
const formOptions = computed(() => {
  const {
    // 弹窗特有字段，不传给 useVbenForm
    schema: _schema,
    api: _api,
    dialogType: _dialogType,
    title: _title,
    width: _width,
    rowKey: _rowKey,
    draggable: _draggable,
    fullscreenButton: _fullscreenButton,
    onSuccess: _onSuccess,
    beforeSubmit: _beforeSubmit,
    onOpen: _onOpen,
    confirmText: _confirmText,
    cancelText: _cancelText,
    transformFormValues: _transformFormValues,
    // useVbenForm 参数
    ...formProps
  } = props.options;

  return {
    ...formProps,
    schema: formSchema.value,
    showDefaultActions: formProps.showDefaultActions ?? false,
    // 合并 commonConfig，并确保顶层 wrapperClass 优先
    commonConfig: {
      ...formCommonConfig.value,
      ...formProps.commonConfig,
      // 顶层 wrapperClass 优先级最高
      wrapperClass:
        props.options.wrapperClass || formProps.commonConfig?.wrapperClass,
    },
  };
});

const [BasicForm, formApi] = useVbenForm(formOptions.value);

const dialogTitle = computed(() => {
  const title = props.options.title || '';
  if (viewType.value === 'add') return $t('components.dialog.add') + title;
  if (viewType.value === 'edit') return $t('components.dialog.edit') + title;
  return title + $t('components.dialog.view');
});

const dialogWidth = computed(() => props.options.width || 'w-[50%]');
const dialogClass = computed(() => {
  const cls = [dialogWidth.value];
  if (props.options.class) cls.push(props.options.class);
  return cls.join(' ');
});
const rowKey = computed(() => props.options.rowKey || 'id');
const isView = computed(() => viewType.value === 'view');

// DetailViewer 的 layout：从 FormDialogOptions 的 layout 映射
const detailLayout = computed(() => {
  return (
    (props.options.layout as 'horizontal' | 'inline' | 'vertical') ||
    'horizontal'
  );
});

// DetailViewer 的 wrapperClass：从 formOptions 的 wrapperClass 映射（用于网格布局）
const detailWrapperClass = computed(() => {
  return props.options.wrapperClass || '';
});

// === Modal ===
const [Modal, modalApi] = useVbenModal({
  draggable: props.options.draggable !== false,
  fullscreenButton: props.options.fullscreenButton !== false,
  zIndex: props.options.zIndex,
  confirmText: props.options.confirmText,
  cancelText: props.options.cancelText,
  async onConfirm() {
    await handleSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) handleOpen();
  },
});

// === Drawer ===
const [Drawer, drawerApi] = useVbenDrawer({
  confirmText: props.options.confirmText,
  cancelText: props.options.cancelText,
  async onConfirm() {
    await handleSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) handleOpen();
  },
});

const currentApi = computed(() =>
  props.options.dialogType === 'drawer' ? drawerApi : modalApi,
);

function handleOpen() {
  const data = currentApi.value.getData<Record<string, any>>();
  if (data) currentRow.value = data;

  if (viewType.value === 'view') {
    currentApi.value.setState({ footer: false, closeOnClickModal: true });
  } else {
    currentApi.value.setState({ footer: true, closeOnClickModal: false });
  }

  if (viewType.value === 'edit' || viewType.value === 'view') {
    const api = props.options.api;
    if (api?.view) {
      api.view(currentRow.value[rowKey.value]).then((res: any) => {
        currentRow.value = { ...currentRow.value, ...res };
        if (viewType.value !== 'view') {
          nextTick(() => {
            formApi.setValues(currentRow.value);
          });
        }
      });
    } else {
      if (viewType.value !== 'view') {
        nextTick(() => {
          formApi.setValues(currentRow.value);
        });
      }
    }
  } else {
    nextTick(() => {
      // 先重置清空旧数据，再设置新值（树形新增子节点时会带 pid）
      formApi.resetForm();
      formApi.setValues(currentRow.value);
    });
  }

  props.options.onOpen?.(viewType.value, currentRow.value);
}

async function handleSubmit() {
  if (viewType.value === 'view') {
    currentApi.value.close();
    return;
  }

  const { valid } = await formApi.validate();
  if (!valid) return;

  currentApi.value.lock();
  try {
    let values = await formApi.getValues();

    // 提交前转换
    if (props.options.transformFormValues) {
      values = props.options.transformFormValues(
        values,
        viewType.value === 'edit' ? 'edit' : 'add',
      );
    }

    // 提交前回调
    if (props.options.beforeSubmit) {
      const result = await props.options.beforeSubmit(values, viewType.value);
      if (result === false) return;
      if (result && typeof result === 'object') values = result;
    }

    const api = props.options.api;
    const submitApi = viewType.value === 'edit' ? api?.edit : api?.add;
    if (submitApi) {
      await submitApi(values);
      ElMessage.success(
        viewType.value === 'edit'
          ? $t('components.dialog.success.edit')
          : $t('components.dialog.success.add'),
      );
    }

    currentApi.value.close();
    props.options.onSuccess?.(viewType.value, values);
  } finally {
    currentApi.value.unlock();
  }
}

function openAdd(data: Record<string, any> = {}) {
  viewType.value = 'add';
  currentRow.value = data;
  currentApi.value.setData(data).open();
}

function openEdit(row: Record<string, any>) {
  viewType.value = 'edit';
  currentRow.value = row;
  currentApi.value.setData(row).open();
}

function openView(row: Record<string, any>) {
  viewType.value = 'view';
  currentRow.value = row;
  currentApi.value.setData(row).open();
}

function close() {
  currentApi.value.close();
}

/**
 * 兼容 crud dialog-form 的 show 方法
 */
function show({ data, type }: { data: any; type: FormActionType }) {
  if (type === 'add') {
    openAdd(data);
  } else if (type === 'edit') {
    openEdit(data);
  } else {
    openView(data);
  }
}

defineExpose({
  openAdd,
  openEdit,
  openView,
  close,
  show,
  getFormApi: () => formApi,
  getActionType: () => viewType.value,
  getCurrentRow: () => currentRow.value,
});
</script>

<template>
  <Modal
    v-if="options.dialogType !== 'drawer'"
    :title="dialogTitle"
    :class="dialogClass"
  >
    <!-- 查看模式：使用 DetailViewer 详情组件 -->
    <DetailViewer
      v-if="isView"
      class="p-4"
      :model="currentRow"
      :schema="formSchema"
      :layout="detailLayout"
      :wrapper-class="detailWrapperClass"
      :common-config="detailCommonConfig"
    />
    <!-- 新增/编辑模式：使用 Form 表单 -->
    <BasicForm v-else class="p-4" :show-default-actions="false" />
  </Modal>
  <Drawer v-else :title="dialogTitle" :class="dialogClass">
    <!-- 查看模式：使用 DetailViewer 详情组件 -->
    <DetailViewer
      v-if="isView"
      class="p-4"
      :model="currentRow"
      :schema="formSchema"
      :layout="detailLayout"
      :wrapper-class="detailWrapperClass"
      :common-config="detailCommonConfig"
    />
    <!-- 新增/编辑模式：使用 Form 表单 -->
    <BasicForm v-else class="p-4" :show-default-actions="false" />
  </Drawer>
</template>

<style lang="scss" scoped>
::v-deep(.vben-form) {
  max-height: none !important;
  overflow: visible !important;
}

::v-deep(.vben-form > form) {
  max-height: none !important;
  overflow: visible !important;
}

::v-deep(.vben-form > form > div) {
  max-height: none !important;
  overflow: visible !important;
}

::v-deep(.el-form) {
  max-height: none !important;
  overflow: visible !important;
}

::v-deep(.el-form-item) {
  margin-bottom: 16px;
}

::v-deep(.detail-view) {
  max-height: none !important;
  overflow: visible !important;
}
</style>
