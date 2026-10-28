<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'

  import { useVModel } from '@vueuse/core'
  import { ElButton, ElDialog, ElInput, ElMessage, ElPagination, ElUpload } from 'element-plus'

  import { FilesService } from '#/api/system'
  import { Icon } from '#/components/icon'
  import { $t } from '#/locales'
  import { buildStaticUrl } from '#/utils/url'

  interface Props {
    accept?: string
    /** 直传模式：点击预览块直接打开系统文件选择器上传，不弹素材库对话框（单选/多选均支持） */
    directUpload?: boolean
    disabled?: boolean
    modelValue?: null | string | string[]
    /** 直传模式下允许的文件大小上限（MB） */
    maxSizeMB?: number
    multiple?: boolean
    objectType?: string
    shape?: 'circle' | 'square'
    size?: 'large' | 'medium' | 'small'
  }

  const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
    directUpload: false,
    disabled: false,
    modelValue: null,
    maxSizeMB: 2,
    multiple: false,
    objectType: 'default',
    shape: 'square',
    size: 'medium'
  })

  const emit = defineEmits<{
    change: [value: null | string | string[]]
    confirm: [value: string | string[]]
    'update:modelValue': [value: null | string | string[]]
  }>()

  // ============================================================
  // 预览区
  // ============================================================
  const mValue = useVModel(props, 'modelValue', emit, {
    defaultValue: props.modelValue,
    passive: true
  })

  const displayImages = computed<string[]>(() => {
    if (!mValue.value) return []
    const values = Array.isArray(mValue.value) ? mValue.value : [mValue.value]
    return values.filter(Boolean) as string[]
  })

  const openSelector = () => {
    if (props.disabled || uploading.value) return
    if (props.directUpload) {
      fileInputRef.value?.click()
      return
    }
    dialogVisible.value = true
  }

  const removeImage = (index: number) => {
    if (props.disabled) return
    if (props.multiple && Array.isArray(mValue.value)) {
      const newValue = [...mValue.value]
      newValue.splice(index, 1)
      mValue.value = newValue as string[]
    } else {
      mValue.value = null
    }
    emit('change', mValue.value)
  }

  // ============================================================
  // 选择弹窗（自包含，不依赖 ImagePickerDialog）
  // ============================================================
  const dialogVisible = ref(false)

  const loading = ref(false)
  const searchKeyword = ref('')
  const page = ref(1)
  const pageSize = ref(12)
  const total = ref(0)
  const fileList = ref<any[]>([])
  const selectedInDialog = ref<any[]>([])

  watch(dialogVisible, (val) => {
    if (!val) {
      selectedInDialog.value = []
      return
    }
    // 初始化已选项
    const init: any[] = []
    const current = mValue.value
    if (current) {
      const list = Array.isArray(current) ? current : [current]
      for (const path of list) {
        if (!path) continue
        const found = fileList.value.find((f) => f.base_path === path || f.url === path)
        if (found) init.push(found)
        else
          init.push({
            id: path,
            base_path: path,
            filename: path.split('/').pop()
          })
      }
    }
    selectedInDialog.value = init
    loadFiles()
  })

  async function loadFiles() {
    loading.value = true
    try {
      const params: Record<string, any> = {
        page: page.value,
        limit: pageSize.value,
        LIKE_filename: searchKeyword.value
      }
      if (props.objectType && props.objectType !== 'default') {
        params.EQ_object_type = props.objectType
      }
      const res: any = await FilesService.getFileList(params)
      fileList.value = res?.list || res?.items || []
      total.value = res?.total || 0
    } catch {
      ElMessage.error($t('components.form.image_picker.load_error'))
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    page.value = 1
    loadFiles()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    page.value = 1
    loadFiles()
  }

  const handlePageChange = (current: number) => {
    page.value = current
    loadFiles()
  }

  const getImageUrl = (file: any) => buildStaticUrl(file.base_path || file.url || '')

  const isSelected = (file: any) =>
    selectedInDialog.value.some((item) => item.id === file.id || item.base_path === file.base_path)

  const toggleSelect = (file: any) => {
    if (props.multiple) {
      const idx = selectedInDialog.value.findIndex((item) => item.id === file.id)
      if (idx === -1) {
        selectedInDialog.value.push(file)
      } else {
        selectedInDialog.value.splice(idx, 1)
      }
    } else {
      selectedInDialog.value = [file]
    }
  }

  const handleDialogClose = () => {
    dialogVisible.value = false
  }

  const handleDialogConfirm = () => {
    if (selectedInDialog.value.length === 0) {
      ElMessage.warning($t('components.form.image_picker.empty'))
      return
    }
    const result: string | string[] = props.multiple
      ? selectedInDialog.value.map((f) => f.base_path || f.url)
      : selectedInDialog.value[0]?.base_path || selectedInDialog.value[0]?.url || ''
    mValue.value = result as null | string | string[]
    emit('change', mValue.value)
    emit('confirm', result as string | string[])
    ElMessage.success($t('components.form.image_picker.select_success'))
    dialogVisible.value = false
  }

  const customUpload = async (e: any) => {
    try {
      await FilesService.uploadImage({
        file: e.file,
        sub_dir: props.objectType || 'default'
      })
      ElMessage.success($t('components.form.image_picker.upload_success'))
      loadFiles()
    } catch {
      ElMessage.error($t('components.form.image_picker.upload_error'))
    }
  }

  // ============================================================
  // 直传模式：点击预览块直接选择文件上传，不走素材库对话框
  // ============================================================
  const fileInputRef = ref<HTMLInputElement>()
  const uploading = ref(false)

  // 从 accept 推导允许的扩展名；含通配或未知 MIME 时不做扩展名白名单限制
  const allowedExtensions = computed<string[]>(() => {
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/svg+xml': ['svg']
    }
    const exts = new Set<string>()
    let generic = false
    for (const part of props.accept.split(',')) {
      const token = part.trim().toLowerCase()
      if (!token) continue
      if (token.startsWith('.')) {
        exts.add(token.slice(1))
      } else if (mimeToExt[token]) {
        mimeToExt[token]?.forEach((ext) => exts.add(ext))
      } else {
        generic = true
      }
    }
    return generic ? [] : [...exts]
  })

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const selected = [...(input.files ?? [])]
    // 清空 value，保证连续选择同一文件也能再次触发 change
    input.value = ''
    if (selected.length === 0 || props.disabled) return

    const allowed = allowedExtensions.value
    const validFiles: File[] = []
    for (const file of selected) {
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      if (allowed.length > 0 && !allowed.includes(extension)) {
        ElMessage.error(
          $t('components.form.image_picker.format_error', {
            exts: allowed.join(' / ').toUpperCase()
          })
        )
        continue
      }
      if (file.size > props.maxSizeMB * 1024 * 1024) {
        ElMessage.error(
          $t('components.form.image_picker.size_error', {
            size: props.maxSizeMB
          })
        )
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length === 0) return

    // 单选模式只处理第一个文件
    if (!props.multiple) {
      validFiles.splice(1)
    }

    uploading.value = true
    try {
      const uploaded: string[] = []
      for (const file of validFiles) {
        try {
          const res: any = await FilesService.uploadImage({
            file,
            sub_dir: props.objectType || 'default'
          })
          const path = res?.base_path || res?.url || ''
          if (!path) throw new Error('upload response missing path')
          uploaded.push(path)
        } catch {
          ElMessage.error($t('components.form.image_picker.upload_error'))
        }
      }
      if (uploaded.length === 0) return

      if (props.multiple) {
        const current = Array.isArray(mValue.value) ? mValue.value : []
        const next = [...current, ...uploaded]
        mValue.value = next
        emit('change', next)
        emit('confirm', next)
      } else {
        const [path] = uploaded
        if (!path) return
        mValue.value = path
        emit('change', path)
        emit('confirm', path)
      }
      ElMessage.success($t('components.form.image_picker.upload_success'))
    } finally {
      uploading.value = false
    }
  }
</script>

<template>
  <div class="image-selector">
    <!-- 直传模式隐藏文件选择器 -->
    <input
      v-if="directUpload"
      ref="fileInputRef"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      type="file"
      @change="handleFileChange"
    />
    <!-- 单选预览 -->
    <template v-if="!multiple">
      <div
        class="preview-wrapper"
        :class="[`is-${shape}`, `is-${size}`, { 'is-uploading': uploading }]"
        @click="openSelector"
      >
        <img
          v-if="displayImages.length > 0"
          :src="buildStaticUrl(displayImages[0] ?? '')"
          class="preview-image"
        />
        <div
          v-else
          class="preview-image default-image flex items-center justify-center text-gray-400"
        >
          <Icon icon="lucide:image-plus" :size="32" />
        </div>

        <div v-if="!disabled" class="image-overlay">
          <Icon
            :class="{ 'animate-spin': uploading }"
            :icon="
              uploading ? 'lucide:loader-circle' : directUpload ? 'lucide:upload' : 'lucide:pencil'
            "
            class="text-2xl text-white"
          />
          <div class="overlay-text">
            {{
              directUpload
                ? $t('components.form.image_picker.upload')
                : $t('components.form.image_picker.select')
            }}
          </div>
        </div>

        <div
          v-if="!disabled && displayImages.length > 0"
          class="remove-btn"
          @click.stop="removeImage(0)"
        >
          <Icon icon="lucide:trash-2" />
        </div>
      </div>
    </template>

    <!-- 多选预览 -->
    <template v-else>
      <div class="image-grid-wrapper">
        <div
          v-for="(image, index) in displayImages"
          :key="index"
          class="preview-wrapper is-square"
          :class="`is-${size}`"
        >
          <img :src="buildStaticUrl(image)" class="preview-image" />
          <div v-if="!disabled" class="remove-btn" @click.stop="removeImage(index)">
            <Icon icon="lucide:trash-2" />
          </div>
        </div>

        <div
          v-if="!disabled"
          class="preview-wrapper is-square add-btn"
          :class="`is-${size}`"
          @click="openSelector"
        >
          <Icon
            :class="{ 'animate-spin': uploading }"
            :icon="uploading ? 'lucide:loader-circle' : 'lucide:plus'"
            class="text-2xl"
          />
          <div class="add-text">
            {{
              directUpload
                ? $t('components.form.image_picker.upload')
                : $t('components.form.image_picker.select')
            }}
          </div>
        </div>
      </div>
    </template>

    <!-- 自包含的选择弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="$t('components.form.image_picker.title')"
      width="60%"
      top="10vh"
      draggable
      class="image-selector-dialog"
      destroy-on-close
      @close="handleDialogClose"
    >
      <div class="dialog-body">
        <div class="dialog-toolbar">
          <div class="search-area">
            <ElInput
              v-model="searchKeyword"
              :placeholder="$t('components.form.image_picker.search_placeholder')"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <Icon icon="lucide:search" class="text-sm" />
              </template>
            </ElInput>
            <ElButton type="primary" @click="handleSearch">
              {{ $t('common.action.search') }}
            </ElButton>
          </div>
          <ElUpload :http-request="customUpload" :show-file-list="false" :accept="accept">
            <ElButton type="primary">
              <template #icon>
                <Icon icon="lucide:upload" />
              </template>
              {{ $t('components.form.image_picker.upload') }}
            </ElButton>
          </ElUpload>
        </div>

        <div v-loading="loading" class="file-grid">
          <div
            v-for="file in fileList"
            :key="file.id"
            class="file-item"
            :class="{ 'is-selected': isSelected(file) }"
            @click="toggleSelect(file)"
          >
            <img :src="getImageUrl(file)" class="file-image" />
            <div class="file-name">{{ file.filename || file.name }}</div>
            <div v-if="isSelected(file)" class="selected-indicator">
              <Icon icon="lucide:check" class="text-lg text-white" />
            </div>
          </div>
          <div v-if="!loading && fileList.length === 0" class="empty-state">
            <Icon icon="lucide:image-off" class="text-4xl" />
            <div>{{ $t('components.form.image_picker.empty') }}</div>
          </div>
        </div>

        <div class="dialog-pagination">
          <ElPagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleDialogClose">
            {{ $t('components.dialog.cancel') }}
          </ElButton>
          <ElButton
            type="primary"
            :disabled="selectedInDialog.length === 0"
            @click="handleDialogConfirm"
          >
            {{ $t('components.dialog.confirm') }} ({{ selectedInDialog.length }})
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
  .image-selector {
    display: inline-block;
  }

  .preview-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border: 2px dashed var(--el-border-color);
    transition: all 0.3s;
  }

  .preview-wrapper:hover:not(.add-btn) {
    border-color: var(--el-color-primary);

    .image-overlay {
      opacity: 1;
    }

    .remove-btn {
      display: flex;
    }
  }

  /* 直传上传中始终展示加载遮罩，避免鼠标移开后无进度反馈 */
  .preview-wrapper.is-uploading .image-overlay {
    opacity: 1;
  }

  .preview-wrapper.is-circle {
    border-radius: 50%;
  }

  .preview-wrapper.is-square {
    border-radius: 8px;
  }

  .preview-wrapper.is-small {
    width: 80px;
    height: 80px;
  }

  .preview-wrapper.is-medium {
    width: 120px;
    height: 120px;
  }

  .preview-wrapper.is-large {
    width: 160px;
    height: 160px;
  }

  .preview-wrapper.add-btn {
    flex-direction: column;
    gap: 4px;
    border-style: dashed;
  }

  .preview-wrapper.add-btn:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-image.default-image {
    opacity: 0.5;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    background: rgb(0 0 0 / 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .overlay-text {
    margin-top: 4px;
    font-size: 12px;
  }

  .remove-btn {
    position: absolute;
    bottom: 8px;
    left: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: pointer;
    transform: translateX(-50%);
    transition: all 0.3s;

    :deep(.el-icon) {
      font-size: 14px;
      color: var(--el-color-danger);
    }
  }

  .add-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .image-grid-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  // ============= 弹窗 =============
  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 420px;
  }

  .dialog-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .search-area {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    min-height: 300px;
    padding: 4px;
  }

  .file-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border: 2px solid transparent;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .file-item:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    transform: translateY(-2px);
  }

  .file-item.is-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgb(var(--el-color-primary-rgb), 0.2);
  }

  .file-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .file-name {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 4px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: white;
    white-space: nowrap;
    background: linear-gradient(to top, rgb(0 0 0 / 70%), transparent);
  }

  .selected-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--el-color-primary);
    border: 2px solid white;
    border-radius: 50%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    grid-column: 1 / -1;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--el-text-color-secondary);
  }

  .dialog-pagination {
    display: flex;
    justify-content: center;
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
