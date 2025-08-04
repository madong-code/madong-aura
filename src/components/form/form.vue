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
      />
    </ElFormItem>
  </ElForm>
</template>
<script setup lang="ts">
  import { FormSchema } from '@/types/component/form'
  import { getComponent } from './component-map'
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
</script>
<style lang="scss" scoped></style>
