import { FormSchema } from '../form'
import SearchBar from './search-bar.vue'

export function useSearchBar(formSchema: FormSchema) {
  const formRef = ref<any>(null)
  const register = (formInstance: any) => {
    formRef.value = formInstance
  }
  const formMethods = {
    // 获取表单实例
    getFormRef() {
      return formRef.value
    },
    // 设置组件状态（props）
    setState(state: any) {
      return formRef.value?.setState(state)
    },
    // 获取组件状态
    getState() {
      return formRef.value?.getState()
    },
    // 获取表单值
    getValues() {
      return formRef.value?.getValues()
    },
    // 设置表单值
    setValues(fields: Record<string, any>, filterFields?: boolean, shouldValidate?: boolean) {
      return formRef.value?.setValues(fields, filterFields, shouldValidate)
    }
  }

  // 创建表单组件的配置
  const FormComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          SearchBar,
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
