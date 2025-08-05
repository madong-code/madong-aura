<template>
  <div>
    <ElForm
      ref="formRef"
      :rules="formSchema.rules"
      :model="formModel"
      :label-width="formSchema.labelWidth || '80px'"
    >
      <ElRow :gutter="formSchema.gutter || 0">
        <ElCol v-for="item in formSchema.schema" :key="item.prop" :span="item.colSpan || 24">
          <ElFormItem
            :prop="item.prop"
            :label="item.label"
            :label-width="item.labelWidth || formSchema.labelWidth || '80px'"
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
    <ElRow v-if="formSchema.showDefaultActions !== false">
      <ElCol>
        <div class="form-actions">
          <ElButton type="primary" @click="handleSubmit">{{
            formSchema.submitButtonText || '提交'
          }}</ElButton>
          <ElButton @click="handleReset">{{ formSchema.resetButtonText || '重置' }}</ElButton>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { getComponent } from './component-map'
  import { FormSchema } from './types'
  import { h, reactive } from 'vue'

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

  withDefaults(
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

  const emit = defineEmits<{
    (e: 'submit', values: any): void
    (e: 'reset'): void
  }>()

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
