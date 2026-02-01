<template>
  <Dialog>
    <div class="code-preview-content art-full-height">
      <div class="flex h-[90vh]" v-loading="codeLoading">
        <el-scrollbar class="h-[100%] w-[300px]">
          <el-tree
            v-if="treeData.length && treeKey != ''"
            :data="treeData"
            :props="{ label: 'name', value: 'key' }"
            node-key="key"
            :current-node-key="treeKey"
            :expand-on-click-node="false"
            highlight-current
            default-expand-all
            ref="treeRef"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="flex items-center">
                <el-icon v-if="data.children">
                  <Folder v-if="!node.expanded" />
                  <FolderOpened v-else />
                </el-icon>
                <el-icon v-else>
                  <Document />
                </el-icon>
                <span class="pl-[5px]">{{ data.name }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
        <div class="ml-[20px]" style="width: calc(100% - 305px)" v-if="code !== ''">
          <el-scrollbar class="h-[100%] w-[100%] relative">
            <CodeHighlight :code="code" :language="language" />
            <el-button class="copy-button" type="primary" @click="handleCopyCode(code)">
              <template #icon>
                <ArtSvgIcon icon="ri:file-copy-line" />
              </template>
              {{ $t('tools.code.preview.copy_button') }}
            </el-button>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useDialog } from '@/components/dialog'
  import { CrudMethods, useCrud } from '@/components/crud'
  import { GeneratorCodeService } from '@/app/api/tools/generator'
  import { $t } from '@/locales'
  import { Folder, FolderOpened, Document } from '@element-plus/icons-vue'
  import CodeHighlight from '@/components/code/index.vue'
  import { ElMessage } from 'element-plus'

  // 类型定义
  interface FileRecord {
    id?: number | string
    name: string
    file_dir: string
    content: string
  }

  interface TreeNode {
    name: string
    path: string
    key: string
    children?: TreeNode[]
  }

  // 响应式变量
  const parentCrudApi = ref<CrudMethods>()
  const record = ref<FileRecord | null>(null)
  const previewList = ref<FileRecord[]>([])
  const dialogVisible = ref<boolean>(false)
  const treeData = ref<TreeNode[]>([])
  const codeLoading = ref(false)
  const code = ref('')
  const language = ref('')
  const treeKey = ref('')

  // 获取预览数据
  const fetchPreviewData = async (id: number | string): Promise<void> => {
    code.value = ''
    treeData.value = []
    treeKey.value = ''
    codeLoading.value = true

    try {
      const response = (await GeneratorCodeService.getPreview(id)) as FileRecord[]
      previewList.value = response
      treeData.value = convertListToTree(response.map((el) => el.file_dir + el.name)) as TreeNode[]

      if (previewList.value.length > 0) {
        code.value = previewList.value[0].content
        detectLanguage(previewList.value[0].name)
      }
    } catch (error) {
      console.error('获取预览数据失败:', error)
      ElMessage.error($t('tools.code.preview.fetch_error'))
    } finally {
      codeLoading.value = false
    }
  }

  // 节点点击处理
  const handleNodeClick = (node: TreeNode): void => {
    const selectedFile = previewList.value.find((el) => {
      const fullPath = el.file_dir + el.name
      return !node.children && fullPath.includes(node.name)
    })

    if (selectedFile) {
      code.value = selectedFile.content
      detectLanguage(selectedFile.name)
    }
  }

  const convertListToTree = (arr: string[]): TreeNode[] => {
    const treeNodes: TreeNode[] = []

    if (Array.isArray(arr)) {
      arr.forEach((path, index) => {
        const pathSegments = path.split('/').filter((segment) => segment !== '')
        let currentLevel = treeNodes

        pathSegments.forEach((segment, segmentIndex) => {
          let existingNode = currentLevel.find((node) => node.name === segment)

          if (!existingNode) {
            const isFile = segment.includes('.')
            const newNode: TreeNode = {
              name: segment,
              // 修复：文件节点保存完整路径，文件夹节点保存空字符串
              path: isFile ? path : '',
              key: `node_${index}_${segmentIndex}`
            }

            if (!isFile) {
              newNode.children = []
            }

            if (segmentIndex === pathSegments.length - 1) {
              treeKey.value = newNode.key
            }

            currentLevel.push(newNode)
            existingNode = newNode
          }

          if (existingNode.children) {
            currentLevel = existingNode.children
          }
        })
      })
    }

    return treeNodes
  }

  // 检测文件语言类型
  const detectLanguage = (fileName: string): void => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'vue':
        language.value = 'html'
        break
      case 'php':
        language.value = 'php'
        break
      case 'js':
      case 'jsx':
        language.value = 'javascript'
        break
      case 'ts':
      case 'tsx':
        language.value = 'typescript'
        break
      case 'css':
      case 'scss':
        language.value = 'css'
        break
      case 'html':
        language.value = 'html'
        break
      case 'json':
        language.value = 'json'
        break
      default:
        language.value = 'text'
    }
  }

  // 复制代码到剪贴板
  const { copy } = useClipboard()
  const handleCopyCode = async (codeContent: string): Promise<void> => {
    try {
      await copy(codeContent)
      ElMessage.success($t('tools.code.preview.copy_success'))
    } catch {
      ElMessage.error($t('tools.code.preview.copy_error'))
    }
  }

  // 对话框组件
  const [Dialog, dialogApi] = useDialog({
    title: $t('tools.code.preview.dialog_title'),
    width: '75%',
    dialogType: 'drawer',
    draggable: true,
    closeOnClickModal: true,
    destroyOnClose: true,
    modal: true,
    footer: false,
    onConfirm: async () => {}
  })

  // 暴露给父组件的方法
  defineExpose({
    show(data: { record: FileRecord }) {
      record.value = data.record
      if (record.value?.id) {
        fetchPreviewData(record.value.id)
      }
      dialogApi.open()
    }
  })
</script>

<style lang="scss" scoped>
  .code-preview-content {
    flex-grow: 1;
    min-width: 0;
    height: 100%;
  }

  .art-table-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .copy-button {
    position: absolute;
    right: 15px;
    top: 5px;
    z-index: 999;
  }
</style>
