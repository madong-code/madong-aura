import { FormSchema } from '../form'
import SearchBar from './search-bar.vue'

export function useSearchBar(formSchema: FormSchema) {
  const formRef = ref<any>(null)
  const register = (formInstance: any) => {
    formRef.value = formInstance
  }
  const formMethods = {
    // 设置组件状态（props）
    setState(state: any) {
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
