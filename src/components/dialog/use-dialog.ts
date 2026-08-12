import type { MyDialogInstance, MyDialogProps } from './types';

import { defineComponent, h, ref } from 'vue';

import Dialog from './dialog.vue';
/**
 *
 * 防止未来重构影响
 *    通过统一的 useTable 钩子封装，即使内部实现发生重构，外部调用方也不会受到影响
 *    提供稳定的API接口，隔离底层实现细节的变化
 *    封装弹窗的逻辑，也便于业务中使用
 * @param props
 * @returns
 */
export function useDialog(props: MyDialogProps) {
  const dialogRef = ref<any>(null);
  const register = (dialogInstance: MyDialogInstance) => {
    dialogRef.value = dialogInstance;
  };
  const dialogMethods = {
    // 设置组件状态（props）
    setState(state: MyDialogProps) {
      return dialogRef.value?.setState(state);
    },
    // 获取组件状态
    getState() {
      return dialogRef.value?.getState();
    },
    open() {
      dialogRef.value?.open();
    },
    close() {
      dialogRef.value?.close();
    },
  };

  // 创建表单组件的配置
  const DialogComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          Dialog,
          {
            ...attrs,
            ...props,
            onRegister: register,
          },
          slots,
        );
    },
  });

  return [DialogComponent, dialogMethods] as const;
}
