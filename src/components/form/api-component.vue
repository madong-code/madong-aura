<script lang="ts" setup>
  // https://github.com/vbenjs/vue-vben-admin/blob/main/packages/effects/common-ui/src/components/api-component/api-component.vue
  import type { Component } from 'vue'
  import request from '@/utils/http'

  import { computed, nextTick, ref, unref, useAttrs, watch } from 'vue'

  import { objectOmit } from '@vueuse/core'
  import { Icon } from '../icon'
  import { cloneDeep, get, isFunction } from 'lodash-es'

  /**
   * 比较两个值是否相等
   * @param a 第一个值
   * @param b 第二个值
   * @returns 如果相等返回true，否则返回false
   */
  const isEqual = (a: any, b: any): boolean => {
    // 严格相等检查
    if (a === b) {
      return true
    }

    // 处理 NaN 的特殊情况
    if (a !== a && b !== b) {
      return true
    }

    // 类型不同直接返回 false
    if (typeof a !== typeof b) {
      return false
    }

    // null 或 undefined 检查
    if (a == null || b == null) {
      return a === b
    }

    // 处理日期类型
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime()
    }

    // 处理数组类型
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) {
          return false
        }
      }
      return true
    }

    // 处理对象类型
    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)

      if (aKeys.length !== bKeys.length) {
        return false
      }

      for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) {
          return false
        }
        if (!isEqual(a[key], b[key])) {
          return false
        }
      }

      return true
    }

    return false
  }
  /**
   * 任意类型的异步函数
   */

  type AnyPromiseFunction<T extends any[] = any[], R = void> = (...arg: T) => PromiseLike<R>
  export type OptionsItem = {
    [name: string]: any
    children?: OptionsItem[]
    disabled?: boolean
    label?: string
    value?: string
  }

  export interface Props {
    /** 组件 */
    component: Component
    /** 是否将value从数字转为string */
    numberToString?: boolean
    /** 获取options数据的函数 */
    api?: ((arg?: any) => Promise<OptionsItem[] | Record<string, any>>) | string
    // 请求方式
    requestMethod?: 'get' | 'post'
    /** 传递给api的参数 */
    params?: Record<string, any>
    /** 从api返回的结果中提取options数组的字段名 */
    resultField?: string
    /** label字段名 */
    labelField?: string
    /** children字段名，需要层级数据的组件可用 */
    childrenField?: string
    /** value字段名 */
    valueField?: string
    /** 组件接收options数据的属性名 */
    optionsPropName?: string
    /** 是否立即调用api */
    immediate?: boolean
    /** 每次`visibleEvent`事件发生时都重新请求数据 */
    alwaysLoad?: boolean
    /** 在api请求之前的回调函数 */
    beforeFetch?: AnyPromiseFunction<any, any>
    /** 在api请求之后的回调函数 */
    afterFetch?: AnyPromiseFunction<any, any>
    /** 直接传入选项数据，也作为api返回空数据时的后备数据 */
    options?: OptionsItem[]
    /** 组件的插槽名称，用来显示一个"加载中"的图标 */
    loadingSlot?: string
    /** 触发api请求的事件名 */
    visibleEvent?: string
    /** 组件的v-model属性名，默认为modelValue。部分组件可能为value */
    modelPropName?: string
    /**
     * 自动选择
     * - `first`：自动选择第一个选项
     * - `last`：自动选择最后一个选项
     * - `one`: 当请求的结果只有一个选项时，自动选择该选项
     * - 函数：自定义选择逻辑，函数的参数为请求的结果数组，返回值为选择的选项
     * - false：不自动选择(默认)
     */
    autoSelect?: 'first' | 'last' | 'one' | ((item: OptionsItem[]) => OptionsItem) | false
  }

  defineOptions({ name: 'ApiComponent', inheritAttrs: false })

  const props = withDefaults(defineProps<Props>(), {
    labelField: 'label',
    valueField: 'value',
    childrenField: '',
    optionsPropName: 'options',
    resultField: '',
    visibleEvent: '',
    numberToString: false,
    params: () => ({}),
    immediate: true,
    alwaysLoad: false,
    loadingSlot: '',
    beforeFetch: undefined,
    afterFetch: undefined,
    modelPropName: 'modelValue',
    api: undefined,
    autoSelect: false,
    options: () => [],
    requestMethod: 'post'
  })

  const emit = defineEmits<{
    optionsChange: [OptionsItem[]]
  }>()

  const modelValue = defineModel<any>({ default: undefined })

  const attrs = useAttrs()
  const innerParams = ref({})
  const refOptions = ref<OptionsItem[]>([])
  const loading = ref(false)
  // 首次是否加载过了
  const isFirstLoaded = ref(false)
  // 标记是否有待处理的请求
  const hasPendingRequest = ref(false)

  const getOptions = computed(() => {
    const { labelField, valueField, childrenField, numberToString } = props

    const refOptionsData = unref(refOptions)

    function transformData(data: OptionsItem[]): OptionsItem[] {
      return data.map((item) => {
        const value = get(item, valueField)
        return {
          ...objectOmit(item, [labelField, valueField, childrenField]),
          label: get(item, labelField),
          value: numberToString ? `${value}` : value,
          ...(childrenField && item[childrenField]
            ? { children: transformData(item[childrenField]) }
            : {})
        }
      })
    }

    const data: OptionsItem[] = transformData(refOptionsData)

    return data.length > 0 ? data : props.options
  })

  const bindProps = computed(() => {
    return {
      [props.modelPropName]: unref(modelValue),
      [props.optionsPropName]: unref(getOptions),
      [`onUpdate:${props.modelPropName}`]: (val: string) => {
        modelValue.value = val
      },
      ...objectOmit(attrs, [`onUpdate:${props.modelPropName}`]),
      ...(props.visibleEvent
        ? {
            [props.visibleEvent]: handleFetchForVisible
          }
        : {})
    }
  })

  async function fetchApi() {
    const { api, beforeFetch, afterFetch, resultField } = props
    let funApi = api
    if (api && typeof api === 'string') {
      funApi = (params) => {
        return request[props.requestMethod]({
          url: api,
          params
        })
      }
    }
    if (!funApi || !isFunction(funApi)) {
      return
    }

    // 如果正在加载，标记有待处理的请求并返回
    if (loading.value) {
      hasPendingRequest.value = true
      return
    }

    refOptions.value = []
    try {
      loading.value = true
      let finalParams = unref(mergedParams)
      if (beforeFetch && isFunction(beforeFetch)) {
        finalParams = (await beforeFetch(cloneDeep(finalParams))) || finalParams
      }
      let res = await funApi(finalParams)
      if (afterFetch && isFunction(afterFetch)) {
        res = (await afterFetch(res)) || res
      }
      isFirstLoaded.value = true
      if (Array.isArray(res)) {
        refOptions.value = res
        emitChange()
        return
      }
      if (resultField) {
        refOptions.value = get(res, resultField) || []
      }
      emitChange()
    } catch (error) {
      console.warn(error)
      // reset status
      isFirstLoaded.value = false
    } finally {
      loading.value = false
      // 如果有待处理的请求，立即触发新的请求
      if (hasPendingRequest.value) {
        hasPendingRequest.value = false
        // 使用 nextTick 确保状态更新完成后再触发新请求
        await nextTick()
        fetchApi()
      }
    }
  }

  async function handleFetchForVisible(visible: boolean) {
    if (visible) {
      if (props.alwaysLoad) {
        await fetchApi()
      } else if (!props.immediate && !unref(isFirstLoaded)) {
        await fetchApi()
      }
    }
  }

  const mergedParams = computed(() => {
    return {
      ...props.params,
      ...unref(innerParams)
    }
  })

  watch(
    mergedParams,
    (value, oldValue) => {
      if (isEqual(value, oldValue)) {
        return
      }
      fetchApi()
    },
    { deep: true, immediate: props.immediate }
  )

  function emitChange() {
    if (modelValue.value === undefined && props.autoSelect && unref(getOptions).length > 0) {
      let firstOption
      if (isFunction(props.autoSelect)) {
        firstOption = props.autoSelect(unref(getOptions))
      } else {
        switch (props.autoSelect) {
          case 'first': {
            firstOption = unref(getOptions)[0]
            break
          }
          case 'last': {
            firstOption = unref(getOptions)[unref(getOptions).length - 1]
            break
          }
          case 'one': {
            if (unref(getOptions).length === 1) {
              firstOption = unref(getOptions)[0]
            }
            break
          }
        }
      }

      if (firstOption) modelValue.value = firstOption.value
    }
    emit('optionsChange', unref(getOptions))
  }
  const componentRef = ref()
  defineExpose({
    /** 获取options数据 */
    getOptions: () => unref(getOptions),
    /** 获取当前值 */
    getValue: () => unref(modelValue),
    /** 获取被包装的组件实例 */
    getComponentRef: <T = any,>() => componentRef.value as T,
    /** 更新Api参数 */
    updateParam(newParams: Record<string, any>) {
      innerParams.value = newParams
    }
  })
</script>
<template>
  <component
    :is="component"
    v-bind="bindProps"
    :placeholder="$attrs.placeholder"
    ref="componentRef"
  >
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template v-if="loadingSlot && loading" #[loadingSlot]>
      <Icon class="animate-spin" icon="iconsys-shuaxin9" />
    </template>
  </component>
</template>
