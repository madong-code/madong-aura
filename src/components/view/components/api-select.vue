<template>
  <ApiComponent
    v-if="value"
    v-model="value"
    model-prop-name="value"
    :api="withCacheApi"
    :request-method="requestMethod"
    :params="{
      ...params,
      __value__: value,
      includeType: 2,
      includeIds: $attrs.multiple ? (typeof value === 'string' ? value.split(',') : value) : [value]
    }"
    :component="ApiView"
    :label-field="labelField"
    :value-field="valueField"
    :children-field="childrenField"
  />
</template>
<script setup lang="ts">
  import ApiComponent, { OptionsItem } from '@/components/form/api-component.vue'
  import ApiView from '@/components/view/api-view.vue'
  import { withCache } from '@/store/modules/api-cache'
  const props = defineProps<{
    value?: string | undefined | number | null | Array<string | number>
    labelField?: string
    valueField?: string
    childrenField?: string
    /** 获取options数据的函数 */
    api?: ((arg?: any) => Promise<OptionsItem[] | Record<string, any>>) | string
    // 请求方式
    requestMethod?: 'get' | 'post'
    /** 传递给api的参数 */
    params?: Record<string, any>
    cacheExpireTime?: number
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: string | undefined | number | null | Array<string | number>): void
  }>()
  const withCacheApi = withCache(props.api, {
    expireTime: props.cacheExpireTime,
    params: props.params,
    requestMethod: props.requestMethod
  }) as any
  const value = computed({
    get() {
      return props.value
    },
    set(val) {
      emit('update:value', val)
    }
  })
</script>
<style lang="scss" scoped></style>
