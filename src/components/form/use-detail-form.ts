// src/components/form/useDetailForm.ts
import type { FormSchema } from './types'
import DetailForm from './detail-form.vue'

export function useDetailForm(formSchema: FormSchema) {
  const formRef = ref<any>(null)
  const register = (formInstance: any) => {
    formRef.value = formInstance
  }
  const formMethods = {
    // 设置组件状态（props）
    setState(state: FormSchema) {
      return formRef.value?.setState(state)
    },
    // 获取组件状态
    getState() {
      return formRef.value?.getState()
    }
  }

  // 创建表单组件的配置
  const FormComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          DetailForm,
          {
            ...attrs,
            formSchema: formSchema,
            model: attrs.model || {},
            onRegister: register
          },
          slots
        )
    }
  })

  return [FormComponent, formMethods] as const
}
