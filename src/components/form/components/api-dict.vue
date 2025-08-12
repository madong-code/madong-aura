<template>
  <RadioGroup v-if="renderType === 'RadioGroup'" :options="options">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </RadioGroup>
  <CheckboxGroup v-else-if="renderType === 'CheckboxGroup'" :options="options">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </CheckboxGroup>
  <Select v-else :options="options">
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </Select>
</template>
<script setup lang="ts">
  import { useDictStore } from '@/store/modules/dict'
  import { NewOption } from '@/types/component/dict'
  import Select from './select.vue'
  import RadioGroup from './radio-group.vue'
  import CheckboxGroup from './checkbox-group.vue'
  const props = defineProps<{
    code: string
    renderType?: 'Select' | 'RadioGroup' | 'CheckboxGroup'
  }>()
  const dictStore = useDictStore()
  onBeforeMount(() => {
    requestData()
  })
  const options = ref<NewOption[]>([])
  const requestData = async () => {
    const code = props.code
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
<style lang="scss" scoped></style>
