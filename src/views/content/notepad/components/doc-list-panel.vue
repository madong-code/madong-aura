<script lang="ts" setup>
import type {
  FolderTreeNode,
  NotepadDocument,
} from '#/api/content/notepad/types';

import { computed, onMounted, ref, watch } from 'vue';

import {
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';
import { FolderOpen, MoreHorizontal, Search, Trash2 } from 'lucide-vue-next';

import { NotepadService } from '#/api/content/notepad';
import { formatDate } from '#/utils';

const props = defineProps<{
  folderId: string;
}>();

const emit = defineEmits<{
  (e: 'select', doc: NotepadDocument | null): void;
  (e: 'refresh'): void;
}>();

// 文档列表
const documents = ref<NotepadDocument[]>([]);
// 搜索关键词
const searchKeyword = ref('');
// 当前选中文档ID
const activeDocId = ref<string>('');
// 加载状态
const loading = ref(false);

// ==================== 移动文档弹窗相关 ====================
const moveDialogVisible = ref(false);
const moveTargetFolderId = ref('');
const moveDoc = ref<NotepadDocument | null>(null);
const folderTree = ref<FolderTreeNode[]>([]);

onMounted(() => {
  loadDocuments();
});

watch(
  () => props.folderId,
  () => {
    searchKeyword.value = '';
    activeDocId.value = '';
    loadDocuments();
  },
);

async function loadDocuments() {
  loading.value = true;
  try {
    documents.value = await (searchKeyword.value.trim()
      ? NotepadService.searchDocuments(searchKeyword.value.trim())
      : NotepadService.getDocuments(props.folderId));
    // 文档加载完成后，自动选中第一篇（时间最新的草稿）
    const first = documents.value[0];
    if (first && !activeDocId.value) {
      handleSelect(first);
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  loadDocuments();
}

function handleSelect(doc: NotepadDocument) {
  activeDocId.value = doc.id;
  emit('select', doc);
}

/** 截断文本，超出显示省略号 */
function truncateText(text: string, maxLen = 40): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}

// ==================== 移动文档 ====================
async function openMoveDialog(doc: NotepadDocument) {
  moveDoc.value = doc;
  // 加载文件夹树用于选择
  folderTree.value = await NotepadService.getFolderTree();
  // 默认选中当前所在文件夹
  moveTargetFolderId.value = doc.folder_id;
  moveDialogVisible.value = true;
}

async function confirmMove() {
  if (!moveDoc.value || !moveTargetFolderId.value) return;
  if (moveTargetFolderId.value === moveDoc.value.folder_id) {
    ElMessage.info('目标文件夹与当前相同');
    return;
  }
  await NotepadService.moveDocument({
    id: moveDoc.value.id,
    folder_id: moveTargetFolderId.value,
  });
  moveDialogVisible.value = false;
  await loadDocuments();
  emit('refresh');
  ElMessage.success('移动成功');
}

/** 目录树转选项列表 */
function treeToOptions(
  tree: FolderTreeNode[],
  level = 0,
): Array<{ label: string; value: string }> {
  const result: Array<{ label: string; value: string }> = [];
  const prefix = '\u3000'.repeat(level);
  for (const node of tree) {
    result.push({ label: `${prefix}${node.name}`, value: node.id });
    if (node.children?.length) {
      result.push(...treeToOptions(node.children, level + 1));
    }
  }
  return result;
}

const folderMoveOptions = computed(() => {
  return [{ label: '根目录', value: '0' }, ...treeToOptions(folderTree.value)];
});

// ==================== 删除文档 ====================
async function handleDelete(doc: NotepadDocument) {
  try {
    await ElMessageBox.confirm(
      `确定删除笔记「${doc.title}」吗？删除后不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    await NotepadService.deleteDocument(doc.id);
    if (activeDocId.value === doc.id) {
      activeDocId.value = '';
      emit('select', null);
    }
    await loadDocuments();
    emit('refresh');
    ElMessage.success('删除成功');
  } catch {
    // 取消
  }
}

defineExpose({ loadDocuments });
</script>

<template>
  <div class="notepad-doc-list flex h-full flex-col bg-background">
    <!-- 搜索框 -->
    <div class="border-b border-border px-3 py-2.5">
      <ElInput
        v-model="searchKeyword"
        placeholder="搜索文档"
        :prefix-icon="Search"
        clearable
        size="default"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
    </div>

    <!-- 文档列表 -->
    <div class="flex-1 overflow-y-auto divide-y divide-border">
      <!-- 空状态 -->
      <div
        v-if="!loading && documents.length === 0"
        class="flex h-full items-center justify-center text-sm text-muted-foreground"
      >
        暂无文档
      </div>

      <!-- 文档项 -->
      <template v-for="doc in documents" :key="doc.id">
        <div
          class="group relative cursor-pointer px-3 py-3 transition-colors hover:bg-muted/50"
          :class="{ 'bg-primary/5': activeDocId === doc.id }"
          @click="handleSelect(doc)"
        >
          <!-- 标题 -->
          <div class="mb-1 flex items-center justify-between">
            <span
              class="truncate text-sm font-medium"
              :class="
                activeDocId === doc.id ? 'text-primary' : 'text-foreground'
              "
            >
              {{ doc.title }}
            </span>
            <!-- 三点菜单 -->
            <ElDropdown
              trigger="click"
              @command="
                (cmd: string) => {
                  if (cmd === 'move') openMoveDialog(doc);
                  else if (cmd === 'delete') handleDelete(doc);
                }
              "
            >
              <button
                class="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                @click.stop
              >
                <MoreHorizontal class="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="move">移动到</ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    <Trash2 class="mr-1 h-3.5 w-3.5" />删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>

          <!-- 内容预览（一行截断） -->
          <div class="mb-1 truncate text-xs text-muted-foreground">
            {{ truncateText(doc.content) }}
          </div>

          <!-- 创建时间 -->
          <div class="text-xs text-muted-foreground">
            创建于 {{ formatDate(doc.created_at) }}
          </div>
        </div>
      </template>
    </div>

    <!-- 移动文档弹窗 -->
    <ElDialog
      v-model="moveDialogVisible"
      title="移动到"
      width="420px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="py-2">
        <p class="mb-3 text-sm text-muted-foreground">
          将「{{ moveDoc?.title }}」移动到：
        </p>
        <ElSelect
          v-model="moveTargetFolderId"
          placeholder="请选择目标目录"
          class="w-full"
        >
          <ElOption
            v-for="opt in folderMoveOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          >
            <span class="flex items-center gap-1">
              <FolderOpen class="h-3.5 w-3.5 text-warning shrink-0" />
              {{ opt.label }}
            </span>
          </ElOption>
        </ElSelect>
      </div>
      <template #footer>
        <button
          class="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          @click="moveDialogVisible = false"
        >
          取消
        </button>
        <button
          class="ml-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary-hover"
          @click="confirmMove"
        >
          确定更改
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
/* 文档列表：隐藏滚动条，支持上下滚动，确保内容完整渲染 */
.notepad-doc-list {
  min-height: 0; /* 关键：允许 flex 子项收缩 */
}

.notepad-doc-list > .flex-1 {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
