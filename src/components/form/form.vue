<template>
  <ElForm ref="formRef" :model="formModel" :label-width="formSchema.labelWidth || '80px'">
    <ElFormItem
      v-for="item in formSchema.schema"
      :prop="item.prop"
      :label="item.label"
      :key="item.prop"
    >
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
          :key="slotName"
          v-for="slotName in Object.keys(renderComponentContent(item) || {})"
          #[slotName]
        >
          <RenderSlot
            :render-func="renderComponentContent(item)[slotName]"
            :form-model="formModel"
          />
        </template>
      </component>
    </ElFormItem>
  </ElForm>
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

  // 与 vben5 一致的函数名
  const renderComponentContent = (item: any) => {
    if (typeof item.renderComponentContent === 'function') {
      return item.renderComponentContent() || {}
    }
    return item.renderComponentContent || {}
  }
</script>
<style lang="scss" scoped></style>
