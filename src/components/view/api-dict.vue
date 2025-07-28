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
  type ColorType = {
    bgColor: string
    textColor: string
  }
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
      type: Object as PropType<Record<string | number, ColorType>>,
      default: () => ({})
    },
    colorList: {
      // 预设的颜色列表
      type: Array as PropType<ColorType[]>,
      default: () => [
        { textColor: '#13deb9', bgColor: '#E7FCF8' }, // 青绿色系
        { textColor: '#1890ff', bgColor: '#E6F7FF' }, // 蓝色系
        { textColor: '#52c41a', bgColor: '#F6FFED' }, // 绿色系
        { textColor: '#faad14', bgColor: '#FFFBE6' }, // 橙色系
        { textColor: '#722ed1', bgColor: '#F9F0FF' }, // 紫色系
        { textColor: '#f5222d', bgColor: '#FFF1F0' }, // 深红系
        { textColor: '#fa8c16', bgColor: '#FFF7E6' }, // 深橙系
        { textColor: '#a0d911', bgColor: '#FCFFE6' }, // 黄绿系
        { textColor: '#eb2f96', bgColor: '#FFF0F6' }, // 粉色系
        { textColor: '#13c2c2', bgColor: '#E6FFFB' }, // 青色系
        { textColor: '#531dab', bgColor: '#F3EAFD' }, // 深紫系
        { textColor: '#003a8c', bgColor: '#E6F4FF' }, // 深蓝系
        { textColor: '#237804', bgColor: '#F2FFF0' }, // 深绿系
        { textColor: '#d4b106', bgColor: '#FEFFE6' }, // 金黄系
        { textColor: '#d4380d', bgColor: '#FFF2E8' }, // 棕橙系
        { textColor: '#0050b3', bgColor: '#E8F4FF' }, // 宝蓝系
        { textColor: '#389e0d', bgColor: '#F2FFF2' }, // 草绿系
        { textColor: '#b37feb', bgColor: '#F9F0FF' }, // 浅紫系
        { textColor: '#ff7a45', bgColor: '#FFF2E8' }, // 浅橙系
        { textColor: '#36cfc9', bgColor: '#E6FFFB' }, // 浅青系
        { textColor: '#ffec3d', bgColor: '#FEFFE6' }, // 明黄系
        { textColor: '#9254de', bgColor: '#F3EAFD' }, // 薰衣系
        { textColor: '#ffc53d', bgColor: '#FFFBE6' }, // 金橙系
        { textColor: '#ff4d4f', bgColor: '#FFEDED' }, // 玫红系
        { textColor: '#40a9ff', bgColor: '#E6F7FF' }, // 天蓝系
        { textColor: '#73d13d', bgColor: '#F6FFED' }, // 嫩绿系
        { textColor: '#ff85c0', bgColor: '#FFF0F6' }, // 桃粉系
        { textColor: '#ffc069', bgColor: '#FFF7E6' }, // 杏橙系
        { textColor: '#ff4d4f', bgColor: '#FFEDED' }, // 红色系
        { textColor: '#909399', bgColor: '#F4F4F5' } // 灰色系
      ]
    },
    useColorList: {
      // 是否使用预设的颜色列表
      type: Boolean,
      default: true
    }
  })

  const dictStore = useDictStore()
  const options = ref<Option[]>([])
  const effect = computed<'dark' | 'light' | 'plain'>(() => {
    return isDark.value ? 'dark' : 'light'
  })
  const isTag = computed(
    () =>
      Object.keys(props.typeMap).length > 0 ||
      Object.keys(props.colorMap).length > 0 ||
      props.useColorList
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
  const createOption = (label: string | number, value: string | number): NewOptionType => ({
    label: String(label),
    value
  })
  const createTagOption = (
    option: Option | null,
    value: string | number,
    index: number
  ): NewOptionType => {
    if (!option) {
      return createOption(value, value)
    }

    // 从 colorMap 获取颜色配置
    const colorMapConfig = props.colorMap[option.value]
    // 从 colorList 获取颜色配置（处理索引越界）
    const colorListConfig =
      props.useColorList && props.colorList.length > 0
        ? props.colorList[index % props.colorList.length]
        : undefined

    // 优先使用 colorMap 配置，其次使用 colorList 配置
    const colorConfig = colorMapConfig || colorListConfig

    return {
      ...option,
      tagProps: {
        type: props.typeMap[option.value],
        color: colorConfig?.bgColor,
        style: {
          color: colorConfig?.textColor
        }
      }
    }
  }
  const cNewOptions = computed<NewOptionType[]>(() => {
    if (Array.isArray(props.value)) {
      return props.value.map((val: any) => {
        const option = options.value.find((opt) => opt.value === val) ?? null
        // 修复：根据选项在 options 数组中的实际索引来获取 colorList 颜色
        const optionIndex = option ? options.value.indexOf(option) : 0
        return createTagOption(option, val, optionIndex)
      })
    } else {
      if (props.value === undefined || props.value === null) {
        return []
      }
      const option = options.value.find((opt) => opt.value === props.value)
      // 修复：根据选项在 options 数组中的实际索引来获取 colorList 颜色
      const optionIndex = option ? options.value.indexOf(option) : 0
      return option
        ? [createTagOption(option, props.value, optionIndex)]
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
