import { useUserStore } from '@/store/modules/user'
import { FormSchema } from '../form'
import SearchBar from './search-bar.vue'

/**
 *
 * 防止未来重构影响
 *    通过统一的 useTable 钩子封装，即使内部实现发生重构，外部调用方也不会受到影响
 *    提供稳定的API接口，隔离底层实现细节的变化
 *    顺便使用../form/components/**下的自定义控件，保持一form组件统一
 * @param formSchema
 * @returns
 */
export function useSearchBar(formSchema: FormSchema | (() => FormSchema)) {
  const userStore = useUserStore()
  const { language } = storeToRefs(userStore)
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
      // 监听语言变化触发重新渲染
      watch(language, () => {
        // 语言变化时的操作，如强制更新组件
        formRef.value?.setState({
          schema: typeof formSchema === 'function' ? formSchema().schema : formSchema.schema
        }) // 或其他需要的操作
      })
      return () =>
        h(
          SearchBar,
          {
            ...attrs,
            formSchema: typeof formSchema === 'function' ? formSchema() : formSchema,
            model: attrs.model || {},
            onRegister: register
          },
          slots
        )
    }
  })

  return [FormComponent, formMethods] as const
}
