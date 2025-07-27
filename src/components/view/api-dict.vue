<template>
  <span>{{ cValue }}</span>
</template>
<script lang="ts" setup>
  import request from '@/utils/http'
  import { Option } from '@/types'
  const props = defineProps({
    value: {
      type: [String, Number, Array]
    },
    code: {
      type: String
    }
  })
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
  onBeforeMount(() => {
    requestData()
  })
  const requestData = () => {
    request
      .post<Option[]>({
        url: '/sys/dict/getByDictType',
        params: {
          dictType: props.code
        }
      })
      .then((res) => {
        // 保存获取到的选项数据
        options.value = res || []
      })
  }
</script>
