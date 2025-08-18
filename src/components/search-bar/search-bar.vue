<template>
  <SearchBar
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
        :is="getComponent(schema.component)"
        v-model:value="searchFormState[schema.prop]"
        v-bind="schema.componentProps"
      ></component>
    </template>
  </SearchBar>
</template>
<script setup lang="ts">
  import SearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import { FormInstance, FormSchema } from '../form'
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
  const handleSearch = () => {
    emit('submit', searchFormState)
  }
  const handleReset = () => {
    emit('reset')
  }
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
</script>
<style lang="less" scoped></style>
