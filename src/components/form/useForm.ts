// src/components/form/useForm.ts
import { ref, unref } from 'vue'
import type { FormInstance, FormSchema } from './types'
import BasicForm from './form.vue'

export function useForm(formSchema: FormSchema) {
  const formRef = ref<FormInstance | null>(null)

  const register = (formInstance: FormInstance) => {
    formRef.value = formInstance
  }
  // 这里对外的所有方法不一定是暴露出去（defineExpose），可以只暴露需要的方法
  // 这里的方法实现，可以调用表单实例的方法，也可以通过useForm(...)这里的参数一起实现逻辑
  const formMethods = {
    // 获取表单实例
    getFormRef() {
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
    },

    async setValues(fields: Record<string, any>, filterFields?: boolean, shouldValidate?: boolean) {
      return await formRef.value?.setValues(fields, filterFields, shouldValidate)
    },
    // 可以增加非formInstance的方法
    // 获取表单配置元数据
    getFormSchema() {
      return formSchema
    },
    // 获取表单字段配置
    getFormItemSchema(field: string) {
      return formSchema.schema.find((item) => item.prop === field)
    },
    // 获取指定字段的组件实例
    getFieldComponentRef(field: string) {
      return formRef.value?.getFieldComponentRef(field)
    },
    // 设置组件状态（props）
    setState(state: FormSchema) {
      formRef.value?.setState(state)
    }
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
