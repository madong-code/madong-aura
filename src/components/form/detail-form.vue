<template>
  <div class="detail-form" :class="{ bordered: border, 'dark-mode': isDark && border }">
    <ElForm
      ref="formRef"
      :label-position="formSchemaRef.labelPosition"
      :model="formModel"
      :class="{ 'form-with-top-spacing': shouldAddTopSpacing }"
      :inline="formSchemaRef.inline || false"
      :label-width="formSchemaRef.labelWidth || '80px'"
    >
      <ElRow :gutter="formSchemaRef.gutter || 0">
        <ElCol v-for="item in schemaList" :key="item.prop" :span="item.colSpan || 24">
          <ElFormItem
            :prop="item.prop"
            :label="item.label"
            :label-width="item.labelWidth || formSchemaRef.labelWidth || '80px'"
            :class="{ 'divider-form-item': item.component === 'Divider' }"
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
                v-if="hasComponent(item.component)"
                :is="getComponent(item.component)"
                :value="get(formModel, item.prop)"
                v-bind="getComponentProps(item)"
              >
              </component>
              <template v-else>
                {{ get(formModel, item.prop) }}
              </template>
            </template>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ElForm, ElRow, ElCol, ElFormItem, ElTooltip } from 'element-plus'
  import { getComponent, hasComponent } from '@/components/view/component-map'
  import { FormItemSchema, FormSchema } from './types'
  import { computed, reactive, ref, watch } from 'vue'
  import { useChart } from '@/composables/useChart'
  import { get } from 'lodash-es'

  const props = withDefaults(
    defineProps<{
      formSchema: FormSchema
      model: Record<string, any>
      border?: boolean
    }>(),
    {
      formSchema: () => {
        return {
          schema: []
        }
      },
      model: () => ({}),
      border: true
    }
  )
  const emit = defineEmits<{
    (e: 'register', formInstance: any): void
  }>()
  // 判断是否需要添加顶部间距
  const shouldAddTopSpacing = computed(() => {
    // 获取第一个显示的组件
    const firstVisibleItem = schemaList.value.find((item) => shouldShow(item))
    // 如果第一个显示的组件不是分割线，则添加顶部间距
    return firstVisibleItem && firstVisibleItem.component !== 'Divider'
  })
  const formModel = reactive<any>({})
  const formSchemaRef = ref<FormSchema>(props.formSchema)
  const formRef = ref()
  const { isDark } = useChart()
  // 监听传入的model变化
  watch(
    () => props.model,
    (newModel) => {
      Object.keys(newModel).forEach((key) => {
        formModel[key] = newModel[key]
      })
    },
    { deep: true, immediate: true }
  )

  // 监听表单结构变化
  watch(
    () => props.formSchema,
    () => {
      formSchemaRef.value = props.formSchema
    },
    { deep: true, immediate: true }
  )
  // 是否显示
  const shouldShow = (item: FormItemSchema) => {
    if (item.ifDetail !== undefined) {
      if (typeof item.ifDetail === 'function') {
        return item.ifDetail(formModel, null)
      } else if (typeof item.ifDetail === 'boolean') {
        return item.ifDetail
      }
    }
    return true
  }

  const schemaList = computed<FormItemSchema[]>(() => {
    return (formSchemaRef.value.schema || []).filter((item) => {
      return shouldShow(item)
    })
  })

  // 获取组件属性，处理componentProps为函数的情况
  const getComponentProps = (item: FormItemSchema) => {
    // 处理componentProps可能为函数的情况
    const componentProps =
      typeof item.componentProps === 'function'
        ? item.componentProps(formModel, null)
        : item.componentProps || {}

    return componentProps
  }
  const formInstanceMethods = {
    // 设置组件状态（props）
    setState(state: FormSchema) {
      return new Promise<void>((resolve) => {
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
    }
  }
  // 注册表单实例
  onMounted(() => {
    emit('register', formInstanceMethods)
  })
</script>
<style lang="scss" scoped>
  .detail-form {
    // .form-with-top-spacing {
    //   margin-top: 0px;
    // }
    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    // 添加类似表格布局的边框样式
    &.bordered {
      :deep(.el-form) {
        // border: 1px solid #ebeef5;
        // border-radius: 4px;
        overflow: hidden;
        background-color: #ffffff;
      }

      :deep(.el-row) {
        &:not(:last-child) {
          border-bottom: 1px solid #ebeef5;
        }
      }

      :deep(.el-col) {
        border-right: 1px solid #ebeef5;

        &:nth-child(2n) {
          border-right: none;
        }
        &:last-child {
          margin-bottom: 18px;
        }
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #606266;
        height: auto;
        display: flex;
        align-items: center;
        padding: 8px 0;
        padding-right: 8px;
        background-color: #f5f7fa;
        border-right: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(.el-form-item__content) {
        padding: 0;
        border-bottom: 1px solid #ebeef5;
        padding-left: 8px;
      }
      // 分割线特殊样式处理
      :deep(.divider-form-item) {
        .el-form-item__content {
          border: none;
          padding-left: 0;
        }
      }
    }

    // 黑夜模式样式
    &.dark-mode {
      :deep(.el-form) {
        background-color: #1a1a1a;
      }

      :deep(.el-row) {
        &:not(:last-child) {
          border-bottom: 1px solid #333;
        }
      }

      :deep(.el-col) {
        border-right: 1px solid #333;
      }

      :deep(.el-form-item__label) {
        color: #b0b0b0;
        background-color: #2a2a2a;
        border-right: 1px solid #333;
        border-bottom: 1px solid #333;
      }

      :deep(.el-form-item__content) {
        border-bottom: 1px solid #333;
        padding-left: 8px;
      }
      // 分割线特殊样式处理
      :deep(.divider-form-item) {
        .el-form-item__content {
          border: none;
          padding-left: 0px;
        }
      }

      .help-icon {
        color: #909399;
      }
    }

    .help-icon {
      margin-left: 4px;
      cursor: pointer;
      color: #909399;
    }
  }
</style>
