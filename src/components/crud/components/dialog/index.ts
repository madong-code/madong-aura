/**
 * useFormDialog 表单对话框 composable
 */

import type { FormDialogApi, FormDialogOptions } from './types';

import { computed, defineComponent, h, ref } from 'vue';

import FormDialogComponent from './dialog.vue';

export function useFormDialog(options: FormDialogOptions) {
  const dialogRef = ref<InstanceType<typeof FormDialogComponent> | null>(null);

  // 保持 options 响应式
  const dialogOptions = ref(options);

  // 计算属性保持响应式
  const dialogOptionsComputed = computed(() => dialogOptions.value);

  const api: FormDialogApi = {
    openAdd: (data?: Record<string, any>) => {
      dialogRef.value?.openAdd(data);
    },
    openEdit: (row: Record<string, any>) => {
      dialogRef.value?.openEdit(row);
    },
    openView: (row: Record<string, any>) => {
      dialogRef.value?.openView(row);
    },
    close: () => {
      dialogRef.value?.close();
    },
    getFormApi: () => {
      return dialogRef.value?.getFormApi();
    },
    getActionType: () => {
      return dialogRef.value?.getActionType() || 'add';
    },
    getCurrentRow: () => {
      return dialogRef.value?.getCurrentRow() || {};
    },
    show: ({ data, type }: { data: any; type: 'add' | 'edit' | 'view' }) => {
      dialogRef.value?.show({ data, type });
    },
  };

  return [
    defineComponent({
      name: 'FormDialog',
      setup(_, { expose }) {
        expose(api);
        return () =>
          h(FormDialogComponent as any, {
            ref: dialogRef,
            options: dialogOptionsComputed.value,
          });
      },
    }),
    api,
  ] as const;
}
