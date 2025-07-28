<template>
  <template v-if="isTag">
    <el-space v-if="cNewOptions.length">
      <template v-for="item in cNewOptions" :key="item.value">
        <el-tag
          :size="size"
          :hit="hit"
          :effect="effect"
          v-if="item.tagProps"
          v-bind="item.tagProps"
          >{{ item.label }}</el-tag
        >
        <span v-else>{{ item.label }}</span>
      </template>
    </el-space>
  </template>
  <span v-else>{{ cValue }}</span>
</template>
<script lang="ts" setup>
  import { Option } from '@/types'
  import { useDictStore } from '@/store/modules/dict'
  import { useChart } from '@/composables/useChart'
  import { PropType } from 'vue'
  // 使用基础的 useChart hook
  const { isDark } = useChart()

  const props = defineProps({
    value: {
      type: [String, Number, Array]
    },
    code: {
      type: String
    },
    hit: {
      type: Boolean,
      default: false
    },

    size: {
      type: [String] as PropType<'' | 'small' | 'default' | 'large'>,
      default: 'small'
    },
    typeMap: {
      // 标签type映射关系
      type: Object,
      default: () => ({})
    },
    colorMap: {
      // 标签color映射关系
      type: Object,
      default: () => ({})
    }
  })

  const dictStore = useDictStore()
  const options = ref<Option[]>([])
  const effect = computed<'dark' | 'light' | 'plain'>(() => {
    return isDark.value ? 'dark' : 'light'
  })
  const isTag = computed(
    () => Object.keys(props.typeMap).length > 0 || Object.keys(props.colorMap).length > 0
  )
  type NewOptionType = Option & { tagProps?: any }
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
  const cNewOptions = computed<NewOptionType[]>(() => {
    const createOption = (label: string | number, value: string | number): NewOptionType => ({
      label: String(label),
      value
    })

    if (Array.isArray(props.value)) {
      return props.value.map((val: any) => {
        const option = options.value.find((opt) => opt.value === val)
        return option
          ? {
              ...option,
              tagProps: {
                type: props.typeMap[val],
                color: props.colorMap[val]
              }
            }
          : createOption(val, val)
      })
    } else {
      const option = options.value.find((opt) => opt.value === props.value)
      return option
        ? [
            {
              ...option,
              tagProps: {
                type: props.typeMap[option.value],
                color: props.colorMap[option.value]
              }
            }
          ]
        : props.value !== null && props.value !== undefined
          ? [createOption(props.value, props.value)]
          : []
    }
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
