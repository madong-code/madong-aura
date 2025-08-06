// src/components/form/useForm.ts
import { ref, unref } from 'vue'
import type { FormInstance, FormSchema } from './types'
import BasicForm from './form.vue'

export function useForm(formSchema: FormSchema) {
  const formRef = ref<FormInstance | null>(null)

  const register = (formInstance: FormInstance) => {
    formRef.value = formInstance
  }

  const formMethods = {
    // 获取表单实例
    getForm() {
      return formRef.value
    },

    // 表单验证
    async validate() {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return false
      }
      return await form.validate()
    },

    // 验证特定字段
    async validateField(props?: string | string[]) {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return
      }
      return await form.validateField(props)
    },

    // 重置表单
    resetFields(props?: string | string[]) {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return
      }
      form.resetFields(props)
    },

    // 清除验证
    clearValidate(props?: string | string[]) {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return
      }
      form.clearValidate(props)
    },

    // 滚动到字段
    scrollToField(prop: string) {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return
      }
      form.scrollToField(prop)
    },

    // 获取表单值
    async getValues() {
      const form = unref(formRef)
      if (!form) {
        console.warn('表单实例未注册')
        return {}
      }
      return await form.getValues()
    }

    // 设置表单值
    // setValues(values: Record<string, any>) {
    //   // 这里需要通过其他方式实现设置值
    //   console.warn('setValues 方法需要在表单组件中实现')
    // }
  }

  // 创建表单组件的配置
  const FormComponent = defineComponent({
    setup(_, { attrs, slots }) {
      return () =>
        h(
          BasicForm,
          {
            ...attrs,
            formSchema: formSchema,
            onRegister: register
          },
          slots
        )
    }
  })

  return [FormComponent, formMethods] as const
}
