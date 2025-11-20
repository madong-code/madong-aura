<!-- 图标选择器 -->
<template>
  <div class="icon-selector">
    <div
      class="select"
      @click="handleClick"
      :style="{ width: props.width }"
      :class="[size, { 'is-disabled': disabled }, { 'has-icon': selectValue }]"
    >
      <div class="icon">
        <i
          :class="`iconfont-sys ${selectValue}`"
          v-show="props.iconType === IconTypeEnum.CLASS_NAME"
        ></i>
        <i
          class="iconfont-sys"
          v-html="selectValue"
          v-show="props.iconType === IconTypeEnum.UNICODE"
        ></i>
        <Icon v-show="selectValue?.includes(':')" :icon="selectValue" />
      </div>
      <div class="text"> {{ props.text }} </div>
      <div class="arrow">
        <i class="iconfont-sys arrow-icon">&#xe709;</i>
        <i class="iconfont-sys clear-icon" @click.stop="clearIcon">&#xe83a;</i>
      </div>
    </div>

    <el-dialog title="选择图标" width="40%" v-model="visible" align-center>
      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="prefix in iconifyPrefixs" :key="prefix" :label="prefix" :name="prefix">
          <el-scrollbar height="400px">
            <el-input v-model="searchText" placeholder="请输入图标名称"></el-input>
            <ul class="icons-list" style="margin-top: 10px">
              <li
                v-for="icon in paginatedIconifyList"
                :key="icon"
                @click="selectorIconifyIcon(icon)"
              >
                <i class="iconfont-sys">
                  <Icon :icon="icon" />
                </i>
              </li>
            </ul>
            <el-pagination
              v-if="filteredIconifyList.length > iconifyPageSize"
              layout="prev, pager, next"
              :total="filteredIconifyList.length"
              :page-size="iconifyPageSize"
              v-model:current-page="iconifyCurrentPage"
              size="small"
              style="margin-top: 10px; justify-content: center"
            />
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="Svg图标" name="svg">
          <el-scrollbar height="400px">
            <ul class="icons-list">
              <li v-for="icon in svgList" :key="icon" @click="selectorIconifyIcon(icon)">
                <i class="iconfont-sys">
                  <Icon :icon="icon" />
                </i>
              </li>
            </ul>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="原内置图标" name="icons">
          <el-scrollbar height="400px">
            <ul class="icons-list" v-show="activeName === 'icons'">
              <li v-for="icon in iconsList" :key="icon.className" @click="selectorIcon(icon)">
                <i
                  :class="`iconfont-sys ${icon.className}`"
                  v-show="iconType === IconTypeEnum.CLASS_NAME"
                ></i>
                <i
                  class="iconfont-sys"
                  v-html="icon.unicode"
                  v-show="iconType === IconTypeEnum.UNICODE"
                ></i>
              </li>
            </ul>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">取 消</el-button>
          <el-button type="primary" @click="visible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@/components/icon'
  import { listIcons } from '@iconify/vue'
  import { fetchIconsData } from './icons'

  defineOptions({ name: 'ArtIconSelector' })
  const searchText = ref('')
  const activeTab = ref('ant-design')
  const iconifyCurrentPage = ref(1)
  const iconifyPageSize = ref(60)

  const svgList = computed(() => {
    return listIcons('', 'svg')
  })
  const iconifyMap = reactive<any>({})
  const iconifyPrefixs = import.meta.env.VITE_APP_ICONIFY_PREFIX?.split(',') || []
  const iconifyList = computed(() => {
    return iconifyMap[activeTab.value]
  })
  onMounted(() => {
    // 离线模式下，已存缓存了所有图标
    if (import.meta.env.VITE_APP_ICON_OFFLINE === 'true') {
      iconifyPrefixs.forEach((prefix: any) => {
        const icons = listIcons('', prefix)
        iconifyMap[prefix] = icons
      })
    } else {
      // 在线模式下，根据当前激活的tab加载图标
      if (iconifyPrefixs.includes(activeTab.value)) {
        fetchIconsData(activeTab.value).then((res) => {
          iconifyMap[activeTab.value] = res
        })
      }
    }
  })
  watchDebounced(
    () => activeTab.value,
    () => {
      // 在线模式下，根据当前激活的tab加载图标
      if (import.meta.env.VITE_APP_ICON_OFFLINE === 'false') {
        if (iconifyPrefixs.includes(activeTab.value)) {
          fetchIconsData(activeTab.value).then((res) => {
            iconifyMap[activeTab.value] = res
          })
        }
      }
    }
  )

  // 过滤后的图标列表（搜索功能）
  const filteredIconifyList = computed<string[]>(() => {
    if (!searchText.value) {
      return iconifyList.value || []
    }
    return (iconifyList.value || []).filter((icon: any) => icon.includes(searchText.value))
  })

  // 分页后的图标列表
  const paginatedIconifyList = computed<string[]>(() => {
    const start = (iconifyCurrentPage.value - 1) * iconifyPageSize.value
    const end = start + iconifyPageSize.value
    return filteredIconifyList.value.slice(start, end)
  })
  // 组件大小类型
  type ComponentSize = 'large' | 'default' | 'small'

  // Props 接口定义
  interface Props {
    /** 图标类型 */
    iconType?: any
    /** v-model 绑定的图标值 */
    modelValue?: string
    /** 显示文本 */
    text?: string
    /** 组件宽度 */
    width?: string
    /** 组件大小 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
  }

  // Emits 接口定义
  interface Emits {
    'update:modelValue': [value: string]
    getIcon: [value: string]
  }

  // 使用 withDefaults 定义 props
  const props = withDefaults(defineProps<Props>(), {
    iconType: '',
    modelValue: '',
    text: '图标选择器',
    width: '200px',
    size: 'default',
    disabled: false
  })

  // 定义 emits
  const emits = defineEmits<Emits>()

  // 响应式数据
  const selectValue = ref<string>(props.modelValue)
  const visible = ref<boolean>(false)
  const activeName = ref<string>('icons')

  // 图标列表 - 使用计算属性优化性能
  const iconsList = computed<IconfontType[]>(() => extractIconClasses())

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    (newVal: string) => {
      selectValue.value = newVal
    },
    { immediate: true }
  )

  // 当搜索条件变化时，重置到第一页
  watch(searchText, () => {
    iconifyCurrentPage.value = 1
  })

  // 选择图标
  const selectorIcon = (icon: any): void => {
    const iconValue = props.iconType === ''

    selectValue.value = iconValue
    visible.value = false

    // 发射 v-model 更新事件和自定义事件
    emits('update:modelValue', iconValue)
    emits('getIcon', iconValue)
  }
  // 选择图标
  const selectorIconifyIcon = (icon: string): void => {
    selectValue.value = icon
    visible.value = false

    // 发射 v-model 更新事件和自定义事件
    emits('update:modelValue', icon)
    emits('getIcon', icon)
  }

  // 处理点击事件
  const handleClick = (): void => {
    if (!props.disabled) {
      visible.value = true
      // 重置分页和搜索条件
      iconifyCurrentPage.value = 1
      searchText.value = ''
    }
  }

  // 清除图标
  const clearIcon = (): void => {
    selectValue.value = ''

    // 发射 v-model 更新事件和自定义事件
    emits('update:modelValue', '')
    emits('getIcon', '')
  }

  // 计算属性：当前图标类型（用于模板中的判断）
  const iconType = computed<any>(() => props.iconType)
</script>

<style lang="scss" scoped>
  .icon-selector {
    width: 100%;

    .select {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--el-component-custom-height);
      padding: 0 15px;
      cursor: pointer;
      border: 1px solid var(--art-border-dashed-color);
      border-radius: calc(var(--custom-radius) / 3 + 2px) !important;
      transition: border 0.3s;

      @media (width <= 500px) {
        width: 100% !important;
      }

      &.large {
        height: 40px;
      }

      &.small {
        height: 24px;
      }

      &:hover:not(.is-disabled).has-icon {
        .arrow-icon {
          display: none;
        }

        .clear-icon {
          display: block !important;
        }
      }

      &:hover {
        border-color: var(--art-text-gray-400);
      }

      .icon {
        display: flex;
        align-items: center;
        width: 20px;
        color: var(--art-gray-700);

        i {
          display: block;
          margin: 0 auto;
          font-size: 16px;
        }
      }

      .text {
        display: flex;
        display: inline-block;
        align-items: center;
        width: 50%;
        font-size: 14px;
        color: var(--art-gray-600);

        @include ellipsis();

        @media (width <= 500px) {
          display: none;
        }
      }

      .arrow {
        display: flex;
        align-items: center;
        height: calc(100% - 2px);

        i {
          font-size: 13px;
          color: var(--art-gray-600);
        }

        .clear-icon {
          display: none;
        }
      }

      &.is-disabled {
        cursor: not-allowed;
        background-color: var(--el-disabled-bg-color);
        border-color: var(--el-border-color-lighter);

        .icon,
        .text,
        .arrow {
          color: var(--el-text-color-placeholder);
        }

        &:hover {
          border-color: var(--el-border-color-lighter);
        }
      }
    }

    .icons-list {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      border-top: 1px solid var(--art-border-color);
      border-left: 1px solid var(--art-border-color);

      li {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        aspect-ratio: 1 / 1;
        color: var(--art-gray-600);
        text-align: center;
        border-right: 1px solid var(--art-border-color);
        border-bottom: 1px solid var(--art-border-color);

        &:hover {
          cursor: pointer;
          background: var(--art-gray-100);
        }

        i {
          font-size: 22px;
          color: var(--art-gray-800);
        }
      }
    }
  }
</style>
