<template>
  <SearchBar
    ref="formRef"
    :show-reset="formSchemaRef.showResetButton"
    :show-search="formSchemaRef.showSubmitButton"
    :show-expand="formSchemaRef.showExpandButton"
    :items="cItems"
    v-model="searchFormState"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template v-for="schema in filteredSchema" :key="schema.prop" #[schema.prop]>
      <component
        :ref="(obj: any) => setComponentRef(schema.prop, obj)"
        :is="getComponent(schema.component)"
        v-model:value="searchFormState[schema.prop]"
        v-bind="schema.componentProps"
      ></component>
    </template>
  </SearchBar>
</template>
<script setup lang="ts">
  import SearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import { FormInstance, FormItemSchema, FormSchema } from '../form'
  import { getComponent, hasComponent } from '../form/component-map'
  const props = withDefaults(
    defineProps<{
      formSchema: FormSchema
      formMethods?: any
    }>(),
    {
      formSchema: () => {
        return {
          schema: []
        }
      }
    }
  )
  const emit = defineEmits<{
    (e: 'submit', values: any): void
    (e: 'reset'): void
    (e: 'register', formInstance: FormInstance): void
    (e: 'change', values: any): void
  }>()
  const formSchemaRef = ref<FormSchema>(props.formSchema)
  const componentRef = reactive<Record<string, any>>({})
  const setComponentRef = (field: string, ref: any) => {
    componentRef[field] = ref
  }
  const handleSearch = () => {
    emit('submit', searchFormState)
  }
  const handleReset = () => {
    emit('reset')
  }
  const formRef = ref()
  const searchFormState = reactive<any>({})
  const cItems = computed(() => {
    return (
      props.formSchema.schema?.map((item: any) => {
        return {
          ...item,
          key: item.prop,
          type: item.component,
          span: item.colSpan,
          props: item.componentProps
        }
      }) || []
    )
  })

  // 过滤出有有效组件的schema
  const filteredSchema = computed(() => {
    return (props.formSchema.schema || []).filter((schema: any) => hasComponent(schema.component))
  })
  // 提取公共的表单实例方法到一个常量对象
  const formInstanceMethods: FormInstance = {
    // Element Plus 表单的原生方法
    validate(callback?: (valid: boolean, fields?: any) => void) {
      return formRef.value?.validate(callback)
    },

    validateField(props?: string | string[], callback?: (valid: boolean, fields?: any) => void) {
      if (formRef.value?.validateField) {
        return formRef.value.validateField(props, callback)
      }
      return Promise.resolve()
    },

    resetFields(props?: string | string[]) {
      formRef.value?.resetFields(props)
      // 重置特定字段后，为这些字段重新设置默认值（如果它们没有被设置）
      if (props) {
        const propList = Array.isArray(props) ? props : [props]
        const schema = formSchemaRef.value.schema || []
        propList.forEach((prop) => {
          const item = schema.find((s) => s.prop === prop)
          if (item && searchFormState[prop] === undefined) {
            searchFormState[prop] = item.defaultValue !== undefined ? item.defaultValue : undefined
          }
        })
      }
    },

    clearValidate(props?: string | string[]) {
      formRef.value?.clearValidate(props)
    },

    scrollToField(prop: string) {
      formRef.value?.scrollToField(prop)
    },

    // 自定义方法
    getValues() {
      // 通过schema来遍历key获取表单值（包含show隐藏但仍存在于DOM中的字段）
      const values: Record<string, any> = {}
      const schema = props.formSchema.schema || []

      schema.forEach((item) => {
        // 处理ifShow字段（js控制是否渲染）
        const shouldRender =
          item.ifShow === undefined ||
          (typeof item.ifShow === 'function'
            ? item.ifShow(searchFormState, props.formMethods)
            : item.ifShow)

        // 只有在DOM中渲染的字段才获取值（无论是否CSS隐藏）
        if (shouldRender) {
          values[item.prop] = searchFormState[item.prop]
        }
      })

      return Promise.resolve(values)
    },

    getFormRef() {
      return formRef.value
    },
    setValues(fields, filterFields, shouldValidate) {
      return new Promise<void>((resolve) => {
        // 获取 schema 中定义的所有字段名
        const schemaProps = (props.formSchema.schema || []).map((item) => item.prop)

        // 处理字段值设置
        Object.keys(fields).forEach((key) => {
          // 如果启用过滤，则只设置在 schema 中定义的字段
          if (!filterFields || schemaProps.includes(key)) {
            searchFormState[key] = fields[key]
          }
        })

        // 如果需要触发验证
        if (shouldValidate) {
          formRef.value
            ?.validate()
            .then(() => {
              resolve()
            })
            .catch(() => {
              resolve()
            })
        } else {
          resolve()
        }
      })
    },
    // 获取字段组件实例
    getFieldComponentRef(field: string) {
      return componentRef[field]
    },
    // 设置组件状态（props）
    setState(state: FormSchema) {
      return new Promise((resolve) => {
        formSchemaRef.value = {
          ...formSchemaRef.value,
          ...state
        }
        nextTick(() => {
          resolve()
        })
      })
    },
    getState(): Promise<FormSchema> {
      return new Promise((resolve) => {
        resolve(formSchemaRef.value)
      })
    },
    updateSchema(data: Partial<FormItemSchema> | Partial<FormItemSchema>[]) {
      return new Promise<void>((resolve) => {
        // 确保 data 是数组格式
        const updateData = Array.isArray(data) ? data : [data]

        // 创建一个 prop 到 schema 项的映射，方便查找
        const schemaMap = new Map<string, FormItemSchema>()
        formSchemaRef.value.schema?.forEach((item) => {
          schemaMap.set(item.prop, item)
        })

        // 更新对应的 schema 项
        updateData.forEach((item) => {
          if (item.prop && schemaMap.has(item.prop)) {
            const index = formSchemaRef.value.schema!.findIndex(
              (schemaItem) => schemaItem.prop === item.prop
            )
            if (index !== -1) {
              // 合并原有的配置和新的配置
              formSchemaRef.value.schema![index] = {
                ...formSchemaRef.value.schema![index],
                ...item
              }
              // 如果更新了defaultValue且当前字段值为undefined，则设置默认值
              if (
                Object.prototype.hasOwnProperty.call(item, 'defaultValue') &&
                searchFormState[item.prop] === undefined
              ) {
                searchFormState[item.prop] = item.defaultValue
              }
            }
          }
        })

        nextTick(() => {
          resolve()
        })
      })
    }
  }

  // 注册表单实例
  onMounted(() => {
    emit('register', formInstanceMethods)
  })
</script>
<style lang="less" scoped></style>
