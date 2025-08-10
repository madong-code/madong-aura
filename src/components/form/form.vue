<template>
  <div>
    <ElForm
      ref="formRef"
      :rules="formSchemaRef.rules"
      :model="formModel"
      :label-width="formSchemaRef.labelWidth || '80px'"
    >
      <ElRow :gutter="formSchemaRef.gutter || 0">
        <ElCol v-for="item in formSchemaRef.schema" :key="item.prop" :span="item.colSpan || 24">
          <ElFormItem
            :prop="item.prop"
            :label="item.label"
            :label-width="item.labelWidth || formSchemaRef.labelWidth || '80px'"
            :rules="item.rules"
          >
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
                :ref="(obj: any) => setComponentRef(item.prop, obj)"
                v-model:value="formModel[item.prop]"
                :is="getComponent(item.component)"
                v-bind="{
                  ...item.componentProps,
                  placeholder: item.componentProps?.placeholder || `请输入${item.label}`
                }"
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
          <ElButton type="primary" @click="handleSubmit">{{
            formSchemaRef.submitButtonText || '提交'
          }}</ElButton>
          <ElButton @click="handleReset">{{ formSchemaRef.resetButtonText || '重置' }}</ElButton>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { getComponent } from './component-map'
  import { FormInstance, FormSchema } from './types'
  import { h, reactive, onMounted } from 'vue'

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
  }>()
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
    emit('reset')
  }
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
    },

    clearValidate(props?: string | string[]) {
      formRef.value?.clearValidate(props)
    },

    scrollToField(prop: string) {
      formRef.value?.scrollToField(prop)
    },

    // 自定义方法
    getValues() {
      return Promise.resolve({ ...formModel })
    },

    getFormRef() {
      return formRef.value
    },
    setValues(fields, filterFields, shouldValidate) {
      return new Promise<void>((resolve) => {
        // 获取 schema 中定义的所有字段名
        const schemaProps = props.formSchema.schema.map((item) => item.prop)

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
      if (state.schema.length === 0) {
        state.schema = formSchemaRef.value.schema
      }
      formSchemaRef.value = {
        ...formSchemaRef.value,
        ...state
      }
      console.log(formSchemaRef.value)
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
</style>
