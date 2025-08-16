import Dialog from './dialog.vue'
import { MyDialogInstance, MyDialogProps } from './types'

export function useDialog(props: MyDialogProps) {
  const dialogRef = ref<any>(null)
  const register = (dialogInstance: MyDialogInstance) => {
    dialogRef.value = dialogInstance
  }
  const dialogMethods = {
    // 设置组件状态（props）
    setState(state: MyDialogProps) {
      return dialogRef.value?.setState(state)
    },
    // 获取组件状态
    getState() {
      return dialogRef.value?.getState()
    },
    open() {
      dialogRef.value?.open()
    },
    close() {
      dialogRef.value?.close()
    }
  }

  // 创建表单组件的配置
  const DialogComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          Dialog,
          {
            ...attrs,
            ...props,
            onRegister: register
          },
          slots
        )
    }
  })

  return [DialogComponent, dialogMethods] as const
}
