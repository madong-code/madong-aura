<template>
  <el-tag v-if="cType" :type="cType">{{ cValue }}</el-tag>
  <span v-else>{{ cValue }}</span>
</template>
<script lang="ts" setup>
  import { Option } from '@/types'
  import { useDictStore } from '@/store/modules/dict'

  const props = defineProps({
    value: {
      type: [String, Number, Array]
    },
    code: {
      type: String
    },
    typeMap: {
      // 标签type映射关系
      type: Object,
      default: () => ({})
    }
  })

  const dictStore = useDictStore()
  const options = ref<Option[]>([])

  const cValue = computed(() => {
    // 查找匹配的选项并返回标签
    if (Array.isArray(props.value)) {
      // 处理数组值的情况
      return props.value
        .map((val) => {
          const option = options.value.find((opt) => opt.value === val)
          return option ? option.label : val
        })
        .join(', ')
    } else {
      // 处理单个值的情况
      const option = options.value.find((opt) => opt.value === props.value)
      return option ? option.label : props.value
    }
  })
  const cType = computed(() => {
    const key = props.value?.toString() || '_'
    return props.typeMap[key]
  })

  onBeforeMount(() => {
    requestData()
  })

  const requestData = async () => {
    if (!props.code) return

    try {
      // 从 store 获取字典数据（会自动缓存）
      const data = await dictStore.getDictByType(props.code)
      options.value = data
    } catch (error) {
      console.error('获取字典数据失败:', error)
      options.value = []
    }
  }
</script>
