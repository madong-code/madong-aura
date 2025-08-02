<template>
  <ElRadioGroup
    v-if="renderType == 'RadioGroup'"
    v-model="value"
    v-bind="config"
    @change="(val) => changeValue(val)"
  >
    <template v-if="isBtn">
      <ElRadioButton v-for="v in options" :key="v.value" :value="v.value">{{
        v.label
      }}</ElRadioButton>
    </template>
    <template v-else>
      <ElRadio v-for="v in options" :key="v.value" :value="v.value">{{ v.label }}</ElRadio>
    </template>
  </ElRadioGroup>
  <ElSelect v-else v-model="value" v-bind="config" @change="(val) => changeValue(val)">
    <ElOption
      v-for="v in options"
      :key="v.value"
      :label="v.label"
      :value="v.value"
      :disabled="v.disabled || false"
    >
    </ElOption>
  </ElSelect>
</template>

<script setup lang="ts">
  import { useDictStore } from '@/store/modules/dict'
  import { SearchFormItem } from '@/types'
  import { NewOption } from '@/types/component/dict'
  import { useI18n } from 'vue-i18n'
  const dictStore = useDictStore()
  const { t } = useI18n()

  // 定义组件值类型
  export type ValueVO = unknown

  // 定义组件props
  const prop = defineProps<{
    value: ValueVO // 选择框的值
    item: SearchFormItem // 表单项配置
  }>()

  // 定义emit事件
  const emit = defineEmits<{
    (e: 'update:value', value: ValueVO): void // 更新选择框值的事件
  }>()

  // 计算属性:处理v-model:value双向绑定
  const value = computed({
    get: () => prop.value as string,
    set: (value: ValueVO) => emit('update:value', value)
  })

  // 合并默认配置和自定义配置
  const config = computed(() => {
    const defaultConfig = {
      placeholder: `${t('table.searchBar.searchSelectPlaceholder')}${prop.item.label}`, // 修改默认placeholder文案
      ...(prop.item.config || {})
    } as any
    delete defaultConfig.code
    delete defaultConfig.renderType
    delete defaultConfig.isBtn
    return defaultConfig
  })
  // 渲染类型
  const renderType = computed<'RadioGropu' | 'Select' | 'CheckboxGroup' | unknown>(() => {
    return prop.item.config?.renderType
  })
  // 是否按钮
  const isBtn = computed<boolean | unknown>(() => {
    return prop.item.config?.isBtn
  })

  // 选择框值变化处理函数
  const changeValue = (val: unknown): void => {
    if (prop.item.onChange) {
      prop.item.onChange({
        prop: prop.item.prop,
        val
      })
    }
  }
  onBeforeMount(() => {
    requestData()
  })
  const options = ref<NewOption[]>([])

  const requestData = async () => {
    const code = prop.item.config?.code
    if (!code) return

    try {
      // 从 store 获取字典数据（会自动缓存）
      const data = await dictStore.getDictByType(code as string)
      options.value = data
    } catch (error) {
      console.error('获取字典数据失败:', error)
      options.value = []
    }
  }
</script>
