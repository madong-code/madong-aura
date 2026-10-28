<script setup lang="ts">
  import type { FormActionType, FormDialogOptions } from './types'

  import { computed, nextTick, ref, watch } from 'vue'

  import { ElMessage } from 'element-plus'

  import { useVbenForm } from '#/adapter/form'
  import { useVbenDrawer, useVbenModal } from '#/core/ui/common'
  import { $t } from '#/locales'

  import { DetailViewer } from '../viewer'

  const props = defineProps<{
    options: FormDialogOptions
  }>()

  const viewType = ref<FormActionType>('view')
  const currentRow = ref<Record<string, any>>({})

  // 解析 schema：支持函数和数组
  const formSchema = computed(() => {
    const schema =
      typeof props.options.schema === 'function' ? props.options.schema() : props.options.schema
    return schema || []
  })

  // 对齐方式转 CSS 类（默认右对齐）
  function alignToClass(align?: 'left' | 'right'): string {
    if (!align) return 'text-right'
    return align === 'left' ? 'text-left' : 'text-right'
  }

  // DetailViewer 的 commonConfig：从 FormDialogOptions 的 commonConfig 中提取
  const detailCommonConfig = computed(() => {
    const common = props.options.commonConfig
    if (!common) return undefined
    return {
      labelClass: alignToClass(common.detailLabelAlign ?? common.labelAlign),
      labelWidth: common.labelWidth,
      labelAlign: common.detailLabelAlign ?? common.labelAlign ?? 'right',
      controlClass: common.controlClass,
      wrapperClass: common.wrapperClass,
      hideLabel: common.hideLabel,
      hideRequiredMark: common.hideRequiredMark,
      formItemClass: typeof common.formItemClass === 'function' ? undefined : common.formItemClass
    }
  })

  // 表单的 commonConfig：从 FormDialogOptions 的 commonConfig 中提取
  const formCommonConfig = computed(() => {
    const common = props.options.commonConfig
    if (!common) return undefined
    return {
      labelWidth: common.labelWidth,
      labelClass: alignToClass(common.formLabelAlign ?? common.labelAlign),
      hideLabel: common.hideLabel,
      hideRequiredMark: common.hideRequiredMark,
      controlClass: common.controlClass,
      wrapperClass: common.wrapperClass
    }
  })

  // 构建 useVbenForm 的完整参数，兼容所有 VbenFormProps
  const formOptions = computed(() => {
    const {
      // 弹窗特有字段，不传给 useVbenForm
      schema: _schema,
      api: _api,
      dialogType: _dialogType,
      title: _title,
      width: _width,
      rowKey: _rowKey,
      draggable: _draggable,
      fullscreenButton: _fullscreenButton,
      onSuccess: _onSuccess,
      beforeSubmit: _beforeSubmit,
      onOpen: _onOpen,
      confirmText: _confirmText,
      cancelText: _cancelText,
      transformFormValues: _transformFormValues,
      // 弹窗专属字段，不透传给表单（避免落到 <form> 的 DOM 属性上）
      formWidth: _formWidth,
      // useVbenForm 参数
      ...formProps
    } = props.options

    return {
      ...formProps,
      schema: formSchema.value,
      showDefaultActions: formProps.showDefaultActions ?? false,
      // 合并 commonConfig，并确保顶层 wrapperClass 优先
      commonConfig: {
        ...formCommonConfig.value,
        ...formProps.commonConfig,
        // 顶层 wrapperClass 优先级最高
        wrapperClass: props.options.wrapperClass || formProps.commonConfig?.wrapperClass
      }
    }
  })

  const [BasicForm, formApi] = useVbenForm(formOptions.value)

  /**
   * 语言切换时同步表单文案
   *
   * schema 为工厂函数时，formSchema 会因内部 $t 重新求值；
   * 但 formApi.setState 的数组合并策略是「旧值优先」(=prev 覆盖新值)，
   * 无法通过 setState 替换 schema，因此对 state 中的同一数组引用做原地替换。
   * 仅在文案确实变化时执行，避免覆盖运行时 updateSchema 的结果。
   */
  watch(
    formSchema,
    (schema) => {
      const current = formApi.getState()?.schema
      if (!Array.isArray(current) || !Array.isArray(schema)) return
      if (current === schema) return
      const changed =
        current.length !== schema.length ||
        current.some(
          (item: any, index: number) => item?.label !== schema[index]?.label
        )
      if (!changed) return
      current.splice(0, current.length, ...schema)
    },
    { flush: 'post' }
  )

  const baseTitle = computed(() =>
    typeof props.options.title === 'function'
      ? props.options.title()
      : props.options.title || ''
  )

  const dialogTitle = computed(() => {
    const title = baseTitle.value
    if (viewType.value === 'add') return $t('components.dialog.add') + title
    if (viewType.value === 'edit') return $t('components.dialog.edit') + title
    return title + $t('components.dialog.view')
  })

  const dialogWidth = computed(() => props.options.width || 'w-[50%]')
  const dialogClass = computed(() => {
    const cls = [dialogWidth.value]
    if (props.options.class) cls.push(props.options.class)
    return cls.join(' ')
  })
  // 表单内容宽度：默认对半显示，可通过 options.formWidth 调整（如多列表单配 'w-full'）。
  // 注意：该宽度只作用于表单内容层，弹窗滚动容器始终占满弹窗宽度，
  // 因此滚动条恒定贴弹窗最右缘，不随表单宽度/列数布局变化。
  const formWidthClass = computed(() => props.options.formWidth || 'w-1/2')
  const rowKey = computed(() => props.options.rowKey || 'id')
  const isView = computed(() => viewType.value === 'view')

  // DetailViewer 的 layout：从 FormDialogOptions 的 layout 映射
  const detailLayout = computed(() => {
    return (props.options.layout as 'horizontal' | 'inline' | 'vertical') || 'horizontal'
  })

  // DetailViewer 的 wrapperClass：从 formOptions 的 wrapperClass 映射（用于网格布局）
  const detailWrapperClass = computed(() => {
    return props.options.wrapperClass || ''
  })

  // === Modal ===
  const [Modal, modalApi] = useVbenModal({
    draggable: props.options.draggable !== false,
    fullscreenButton: props.options.fullscreenButton !== false,
    zIndex: props.options.zIndex,
    confirmText: props.options.confirmText,
    cancelText: props.options.cancelText,
    async onConfirm() {
      await handleSubmit()
    },
    onOpenChange(isOpen: boolean) {
      if (isOpen) handleOpen()
    }
  })

  // === Drawer ===
  const [Drawer, drawerApi] = useVbenDrawer({
    confirmText: props.options.confirmText,
    cancelText: props.options.cancelText,
    async onConfirm() {
      await handleSubmit()
    },
    onOpenChange(isOpen: boolean) {
      if (isOpen) handleOpen()
    }
  })

  const currentApi = computed(() => (props.options.dialogType === 'drawer' ? drawerApi : modalApi))

  async function handleOpen() {
    const data = currentApi.value.getData<Record<string, any>>()
    if (data) currentRow.value = data

    if (viewType.value === 'view') {
      currentApi.value.setState({ footer: false, closeOnClickModal: true })
    } else {
      currentApi.value.setState({ footer: true, closeOnClickModal: false })
    }

    if (viewType.value === 'edit' || viewType.value === 'view') {
      const api = props.options.api
      // 雪花ID(18位)超过 JS Number.MAX_SAFE_INTEGER，转 number 会丢精度(末位归零)。
      // 任何上游环节(列表、路由、vxe-grid、ApiTreeSelect)一旦把 id 转成 number，
      // 回填表单后再次请求详情就会因 id 不匹配返回 Not Found。
      // 这里在 view 拿回数据 → setValues → 表单渲染 链路入口统一把 id 还原为字符串。
      const protectId = (row: Record<string, any> | null | undefined) => {
        if (!row) return row
        if (row[rowKey.value] !== undefined && row[rowKey.value] !== null) {
          row[rowKey.value] = String(row[rowKey.value])
        }
        return row
      }
      if (api?.view) {
        const rawId = currentRow.value[rowKey.value]
        // 详情加载态：Modal/Drawer 内容区统一 v-loading
        currentApi.value.setState({ loading: true })
        api
          .view(rawId === undefined || rawId === null ? rawId : String(rawId))
          .then((res: any) => {
            currentRow.value = protectId({
              ...currentRow.value,
              ...(protectId(res) ?? {})
            }) as Record<string, any>
            if (viewType.value !== 'view') {
              nextTick(() => {
                formApi.setValues(currentRow.value)
              })
            }
          })
          .catch((error: any) => {
            // 详情请求失败：提示并回退为列表行数据回填，保证弹窗可用
            console.error('[FormDialog] 详情加载失败:', error)
            ElMessage.error($t('components.dialog.detail_error'))
            currentRow.value =
              (protectId(currentRow.value) as Record<string, any>) ?? currentRow.value
            if (viewType.value !== 'view') {
              nextTick(() => {
                formApi.setValues(currentRow.value)
              })
            }
          })
          .finally(() => {
            currentApi.value.setState({ loading: false })
          })
      } else {
        currentRow.value = (protectId(currentRow.value) as Record<string, any>) ?? currentRow.value
        if (viewType.value !== 'view') {
          nextTick(() => {
            formApi.setValues(currentRow.value)
          })
        }
      }
    } else {
      // 等待 resetForm 完全完成（其内部为异步重置）后再 setValues，
      // 否则 resetForm 的异步默认重置会覆盖刚设置的父级 pid，导致新增子节点父级选不中
      await formApi.resetForm()
      const values = { ...currentRow.value }
      // 树形新增子节点：当前行是父节点（带 id），新记录的 pid 应为父节点 id
      if (currentRow.value?.id) {
        values.pid = currentRow.value.id
        // 清除父节点的 id，避免新记录误带父级主键
        delete values.id
      }
      formApi.setValues(values)
    }

    props.options.onOpen?.(viewType.value, currentRow.value)
  }

  async function handleSubmit() {
    if (viewType.value === 'view') {
      currentApi.value.close()
      return
    }

    const { valid } = await formApi.validate()
    if (!valid) return

    currentApi.value.lock()
    try {
      let values = await formApi.getValues()

      // 编辑模式：确保主键为字符串
      // 雪花ID(18位)超出 JS Number.MAX_SAFE_INTEGER，列表/表单环节一旦转成 number 会丢精度(末位归零)，
      // 保存时后端按主键查不到记录。这里统一用回填详情时的原始 id 覆盖，保证主键字符串透传。
      if (viewType.value === 'edit') {
        const key = rowKey.value
        const rawId = currentRow.value[key]
        const id = rawId !== undefined && rawId !== null ? String(rawId) : ''
        values = { ...values, [key]: id }
      }

      // 提交前转换
      if (props.options.transformFormValues) {
        values = props.options.transformFormValues(
          values,
          viewType.value === 'edit' ? 'edit' : 'add'
        )
      }

      // 提交前回调
      if (props.options.beforeSubmit) {
        const result = await props.options.beforeSubmit(values, viewType.value)
        if (result === false) return
        if (result && typeof result === 'object') values = result
      }

      const api = props.options.api
      const submitApi = viewType.value === 'edit' ? api?.edit : api?.add
      if (submitApi) {
        await submitApi(values)
        ElMessage.success(
          viewType.value === 'edit'
            ? $t('components.dialog.success.edit')
            : $t('components.dialog.success.add')
        )
      }

      currentApi.value.close()
      props.options.onSuccess?.(viewType.value, values)
    } finally {
      currentApi.value.unlock()
    }
  }

  function openAdd(data: Record<string, any> = {}) {
    viewType.value = 'add'
    currentRow.value = data
    currentApi.value.setData(data).open()
  }

  function openEdit(row: Record<string, any>) {
    viewType.value = 'edit'
    currentRow.value = row
    currentApi.value.setData(row).open()
  }

  function openView(row: Record<string, any>) {
    viewType.value = 'view'
    currentRow.value = row
    currentApi.value.setData(row).open()
  }

  function close() {
    currentApi.value.close()
  }

  /**
   * 兼容 crud dialog-form 的 show 方法
   */
  function show({ data, type }: { data: any; type: FormActionType }) {
    if (type === 'add') {
      openAdd(data)
    } else if (type === 'edit') {
      openEdit(data)
    } else {
      openView(data)
    }
  }

  defineExpose({
    openAdd,
    openEdit,
    openView,
    close,
    show,
    getFormApi: () => formApi,
    getActionType: () => viewType.value,
    getCurrentRow: () => currentRow.value
  })
</script>

<template>
  <!--
    滚动条与表单布局解耦约束：
    1. 滚动条只由弹窗内部滚动容器（vben Modal/Drawer 的 content 区域）产生，
       该容器必须始终占满弹窗宽度 —— 严禁通过 :content-class 向其传递任何宽度类，
       否则滚动条会随宽度内缩而"错位"到弹窗中部。
    2. 表单内容的宽度（formWidth）与列数（wrapperClass，1列/2列/多列）只影响
       内容自身的视觉布局，不会影响滚动条位置。
  -->
  <Modal v-if="options.dialogType !== 'drawer'" :title="dialogTitle" :class="dialogClass">
    <!-- 查看模式：使用 DetailViewer 详情组件 -->
    <DetailViewer
      v-if="isView"
      class="p-4"
      :class="formWidthClass"
      :model="currentRow"
      :schema="formSchema"
      :layout="detailLayout"
      :wrapper-class="detailWrapperClass"
      :common-config="detailCommonConfig"
    />
    <!-- 新增/编辑模式：使用 Form 表单 -->
    <BasicForm v-else class="p-4" :class="formWidthClass" :show-default-actions="false" />
  </Modal>
  <Drawer v-else :title="dialogTitle" :class="dialogClass">
    <!-- 查看模式：使用 DetailViewer 详情组件 -->
    <DetailViewer
      v-if="isView"
      class="p-4"
      :model="currentRow"
      :schema="formSchema"
      :layout="detailLayout"
      :wrapper-class="detailWrapperClass"
      :common-config="detailCommonConfig"
    />
    <!-- 新增/编辑模式：使用 Form 表单 -->
    <BasicForm v-else class="p-4" :show-default-actions="false" />
  </Drawer>
</template>

<style lang="scss" scoped>
  ::v-deep(.vben-form) {
    max-height: none !important;
    overflow: visible !important;
  }

  ::v-deep(.vben-form > form) {
    max-height: none !important;
    overflow: visible !important;
  }

  ::v-deep(.vben-form > form > div) {
    max-height: none !important;
    overflow: visible !important;
  }

  ::v-deep(.el-form) {
    max-height: none !important;
    overflow: visible !important;
  }

  ::v-deep(.el-form-item) {
    margin-bottom: 16px;
  }

  ::v-deep(.detail-view) {
    max-height: none !important;
    overflow: visible !important;
  }
</style>
