<script setup lang="ts">
import { ref } from 'vue';

import { ElButton, ElIcon, ElMessage, ElScrollbar, ElTree } from 'element-plus';
import { File, Folder, FolderOpen } from 'lucide-vue-next';

import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'CodePreview' });

interface FileRecord {
  id?: number | string;
  name: string;
  file_dir: string;
  content: string;
}
interface TreeNode {
  name: string;
  path: string;
  key: string;
  children?: TreeNode[];
}

const record = ref<FileRecord | null>(null);
const previewList = ref<FileRecord[]>([]);
const treeData = ref<TreeNode[]>([]);
const codeLoading = ref(false);
const code = ref('');
const language = ref('');
const treeKey = ref('');

const fetchPreviewData = async (id: number | string) => {
  code.value = '';
  treeData.value = [];
  treeKey.value = '';
  codeLoading.value = true;
  try {
    const response = (await GeneratorCodeService.getPreview(
      id,
    )) as FileRecord[];
    previewList.value = response;
    treeData.value = convertListToTree(
      response.map((el) => el.file_dir + el.name),
    ) as TreeNode[];
    const firstFile = previewList.value[0];
    if (firstFile) {
      code.value = firstFile.content;
      detectLanguage(firstFile.name);
    }
  } catch {
    ElMessage.error($t('codegen.generate.preview.fetch_error'));
  } finally {
    codeLoading.value = false;
  }
};

const handleNodeClick = (node: TreeNode) => {
  const selectedFile = previewList.value.find((el) => {
    const fullPath = el.file_dir + el.name;
    return !node.children && fullPath.includes(node.name);
  });
  if (selectedFile) {
    code.value = selectedFile.content;
    detectLanguage(selectedFile.name);
  }
};

const convertListToTree = (arr: string[]): TreeNode[] => {
  const treeNodes: TreeNode[] = [];
  if (Array.isArray(arr)) {
    arr.forEach((path, index) => {
      const pathSegments = path.split('/').filter(Boolean);
      let currentLevel = treeNodes;
      pathSegments.forEach((segment, segmentIndex) => {
        let existingNode = currentLevel.find((n) => n.name === segment);
        if (!existingNode) {
          const isFile = segment.includes('.');
          const newNode: TreeNode = {
            name: segment,
            path: isFile ? path : '',
            key: `node_${index}_${segmentIndex}`,
          };
          if (!isFile) newNode.children = [];
          if (segmentIndex === pathSegments.length - 1)
            treeKey.value = newNode.key;
          currentLevel.push(newNode);
          existingNode = newNode;
        }
        if (existingNode.children) currentLevel = existingNode.children;
      });
    });
  }
  return treeNodes;
};

const detectLanguage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    vue: 'html',
    php: 'php',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    css: 'css',
    scss: 'css',
    html: 'html',
    json: 'json',
  };
  language.value = map[ext || ''] || 'text';
};

const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    ElMessage.success($t('codegen.generate.preview.copy_success'));
  } catch {
    ElMessage.error($t('codegen.generate.preview.copy_error'));
  }
};

const [Dialog, dialogApi] = useDialog({
  title: $t('codegen.generate.preview.dialog_title'),
  dialogType: 'drawer',
  width: '70%',
  draggable: false,
  closeOnClickModal: false,
  destroyOnClose: true,
  footer: false,
  onConfirm: () => {},
});

defineExpose({
  show(data: { record: FileRecord }) {
    record.value = data.record;
    if (record.value?.id) fetchPreviewData(record.value.id);
    dialogApi.open();
  },
});
</script>

<template>
  <Dialog>
    <div class="code-preview-content h-full">
      <div class="flex h-full" v-loading="codeLoading">
        <ElScrollbar class="h-full w-[300px]">
          <ElTree
            v-if="treeData.length > 0 && treeKey !== ''"
            :data="treeData"
            :props="{ label: 'name' }"
            node-key="key"
            :current-node-key="treeKey"
            :expand-on-click-node="false"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="flex items-center">
                <ElIcon v-if="data.children">
                  <Folder v-if="!node.expanded" class="size-4" /><FolderOpen
                    v-else
                    class="size-4"
                  />
                </ElIcon>
                <ElIcon v-else><File class="size-4" /></ElIcon>
                <span class="pl-[5px]">{{ data.name }}</span>
              </div>
            </template>
          </ElTree>
        </ElScrollbar>
        <div
          class="ml-[20px]"
          style="width: calc(100% - 305px)"
          v-if="code !== ''"
        >
          <ElScrollbar class="h-full w-full relative">
            <pre
              class="code-block m-0 p-4 rounded text-sm overflow-auto"
            ><code>{{ code }}</code></pre>
            <ElButton
              class="copy-button"
              type="primary"
              @click="handleCopyCode"
            >
              <template #icon>
                <ElIcon><File class="size-4" /></ElIcon>
              </template>
              {{ $t('codegen.generate.preview.copy_button') }}
            </ElButton>
          </ElScrollbar>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.code-preview-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.copy-button {
  position: absolute;
  top: 5px;
  right: 15px;
  z-index: 999;
}

.code-block {
  color: var(--el-text-color-primary);
  word-break: break-all;
  white-space: pre-wrap;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
}
</style>
