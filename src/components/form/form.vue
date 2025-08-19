<template>
  <div>
    <ElForm
      ref="formRef"
      class="form-container"
      :label-position="formSchemaRef.labelPosition"
      :rules="formSchemaRef.rules"
      :model="formModel"
      :inline="formSchemaRef.inline || false"
      :label-width="formSchemaRef.labelWidth || '80px'"
    >
      <ElRow :gutter="formSchemaRef.gutter || 0">
        <ElCol
          v-for="item in schemaList"
          :key="item.prop"
          :span="item.colSpan || 24"
          :style="{ display: shouldShow(item) ? 'block' : 'none' }"
        >
          <ElFormItem
            :prop="item.prop"
            :label="item.label"
            :label-width="item.labelWidth || formSchemaRef.labelWidth || '80px'"
            :rules="item.rules"
          >
            <template v-if="item.label" #label>
              <span
                >{{ item.label
                }}<ElTooltip
                  v-if="item.helpMessage"
                  :content="
                    Array.isArray(item.helpMessage) ? item.helpMessage.join('\n') : item.helpMessage
                  "
                  placement="top"
                >
                  <Icon class="help-icon" icon="&#xe636;" /> </ElTooltip
              ></span>
            </template>
            <!-- 字段插槽优先级最高 -->
            <slot
              v-if="$slots[item.prop]"
              :name="item.prop"
              :form-model="formModel"
              :model="formModel"
              :field="item"
            />
            <template v-else>
              <component
                style="padding-right: 8px"
                :ref="(obj: any) => setComponentRef(item.prop, obj)"
                v-model:value="formModel[item.prop]"
                v-if="hasComponent(item.component)"
                :is="getComponent(item.component)"
                v-bind="getComponentProps(item)"
              >
                <!-- 渲染组件内容(slot) -->
                <template
                  v-for="slotName in Object.keys(renderComponentContent(item) || {})"
                  :key="slotName"
                  #[slotName]
                >
                  <RenderSlot
                    :render-func="renderComponentContent(item)[slotName]"
                    :form-model="formModel"
                  />
                </template>
              </component>
            </template>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <!-- 默认操作按钮 -->
    <ElRow v-if="formSchemaRef.showDefaultActions !== false">
      <ElCol>
        <div class="form-actions">
          <ElButton v-if="formSchemaRef.showSubmitButton" type="primary" @click="handleSubmit">{{
            formSchemaRef.submitButtonText || '提交'
          }}</ElButton>
          <ElButton v-if="formSchemaRef.showResetButton" @click="handleReset">{{
            formSchemaRef.resetButtonText || '重置'
          }}</ElButton>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { getComponent, hasComponent } from './component-map'
  import { FormInstance, FormItemSchema, FormSchema } from './types'
  import { h, reactive, onMounted, watch } from 'vue'

  // slot 渲染组件
  const RenderSlot = defineComponent({
    props: {
      renderFunc: Function,
      formModel: Object
    },
    setup(props) {
      return () => {
        if (props.renderFunc) {
          return props.renderFunc(h, props.formModel)
        }
        return null
      }
    }
  })

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

  const formModel = reactive<any>({})
  const formSchemaRef = ref<FormSchema>(props.formSchema)

  const emit = defineEmits<{
    (e: 'submit', values: any): void
    (e: 'reset'): void
    (e: 'register', formInstance: FormInstance): void
    (e: 'change', values: any): void
  }>()

  // 初始化表单默认值
  const initFormModel = () => {
    const schema = props.formSchema.schema || []
    schema.forEach((item) => {
      // 只有当formModel中没有该属性时才设置默认值
      if (!(item.prop in formModel)) {
        formModel[item.prop] = item.defaultValue !== undefined ? item.defaultValue : undefined
      }
    })
  }
  const schemaList = computed<FormItemSchema[]>(() => {
    return (formSchemaRef.value.schema || []).filter((item) => {
      if (item.ifShow !== undefined) {
        if (typeof item.ifShow === 'function') {
          // formApi
          return item.ifShow(formModel, props.formMethods)
        } else if (typeof item.ifShow === 'boolean') {
          return item.ifShow
        }
      }
      return true
    })
  })

  // 判断是否显示，用css控制
  const shouldShow = (item: FormItemSchema) => {
    if (item.show !== undefined) {
      if (typeof item.show === 'function') {
        return item.show(formModel, props.formMethods)
      } else {
        return item.show
      }
    }
    return true
  }

  // 获取组件属性，处理componentProps为函数的情况
  const getComponentProps = (item: FormItemSchema) => {
    // 处理componentProps可能为函数的情况
    const componentProps =
      typeof item.componentProps === 'function'
        ? item.componentProps(formModel, props.formMethods)
        : item.componentProps || {}
    // 对于日期范围组件，使用 start-placeholder 和 end-placeholder
    if (item.component.toLowerCase().includes('date')) {
      if (
        ['daterange', 'datetimerange', 'monthrange', 'yearrange'].includes(componentProps?.type)
      ) {
        // 如果已经定义了 startPlaceholder 和 endPlaceholder，则不覆盖
        if (!componentProps.startPlaceholder && !componentProps.endPlaceholder) {
          // 根据类型设置不同的默认文本
          switch (componentProps.type) {
            case 'monthrange':
              return {
                ...componentProps,
                startPlaceholder: '开始月份',
                endPlaceholder: '结束月份'
              }
            case 'yearrange':
              return {
                ...componentProps,
                startPlaceholder: '开始年份',
                endPlaceholder: '结束年份'
              }
            case 'datetimerange':
              return {
                ...componentProps,
                startPlaceholder: '开始时间',
                endPlaceholder: '结束时间'
              }
            default:
              return {
                ...componentProps,
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期'
              }
          }
        }
        // 如果已经有 startPlaceholder 或 endPlaceholder，则直接返回
        return componentProps
      }
    }
    // 合并属性，如果未提供placeholder则自动生成
    const text = item.component.toLowerCase().includes('select') ? '请选择' : '请输入'
    return {
      ...componentProps,
      placeholder: componentProps.placeholder || `${text}${item.label}`
    }
  }

  const componentRef = reactive<Record<string, any>>({})
  const setComponentRef = (field: string, ref: any) => {
    componentRef[field] = ref
  }

  // 与 vben5 一致的函数名
  const renderComponentContent = (item: any) => {
    if (typeof item.renderComponentContent === 'function') {
      return item.renderComponentContent() || {}
    }
    return item.renderComponentContent || {}
  }

  const formRef = ref()

  // 提交表单
  const handleSubmit = () => {
    formRef.value.validate().then(() => {
      emit('submit', formModel)
    })
  }

  // 重置表单
  const handleReset = () => {
    formRef.value.resetFields()
    // 重置后重新设置默认值
    initFormModel()
    emit('reset')
  }

  // 监听表单结构变化，重新初始化默认值
  watch(
    () => props.formSchema,
    () => {
      formSchemaRef.value = props.formSchema
      initFormModel()
    },
    { deep: true, immediate: true }
  )
  watch(
    () => formModel,
    () => {
      emit('change', formModel)
    },
    { deep: true, immediate: true }
  )
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
          if (item && formModel[prop] === undefined) {
            formModel[prop] = item.defaultValue !== undefined ? item.defaultValue : undefined
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
            ? item.ifShow(formModel, props.formMethods)
            : item.ifShow)

        // 只有在DOM中渲染的字段才获取值（无论是否CSS隐藏）
        if (shouldRender) {
          values[item.prop] = formModel[item.prop]
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
            formModel[key] = fields[key]
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
                formModel[item.prop] === undefined
              ) {
                formModel[item.prop] = item.defaultValue
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

  // 暴露所有 Element Plus 表单实例方法和自定义方法
  defineExpose<FormInstance>(formInstanceMethods)
</script>

<style lang="scss" scoped>
  .form-actions {
    display: flex;
    justify-content: center;
    padding: 20px 0;

    .el-button {
      margin: 0 10px;
    }
  }
  .help-icon {
    margin-left: 4px;
    cursor: pointer;
  }
</style>
