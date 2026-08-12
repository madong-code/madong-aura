<script lang="ts" setup>
import type {
  FolderTreeNode,
  NotepadFolder,
} from '#/api/content/notepad/types';

import { computed, onMounted, ref } from 'vue';

import {
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from 'element-plus';
import {
  ChevronDown,
  FileText,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-vue-next';

import { NotepadService } from '#/api/content/notepad';

const emit = defineEmits<{
  (e: 'select', folderId: string): void;
  (e: 'refresh'): void;
  (e: 'createNote'): void;
}>();

// 当前选中的文件夹ID
const activeFolderId = ref<string>('recent');
// 文件夹树数据
const folderTree = ref<FolderTreeNode[]>([]);
// 所有文件夹（扁平，用于弹窗选择）
const allFolders = ref<NotepadFolder[]>([]);

// ==================== 文件夹弹窗相关 ====================
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogMode = ref<'create' | 'edit'>('create');
const formRef = ref();
const formData = ref({
  pid: '0',
  name: '',
});
const formRules = {
  name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }],
};

onMounted(async () => {
  await loadFolders();
});

async function loadFolders() {
  folderTree.value = await NotepadService.getFolderTree();
  allFolders.value = await NotepadService.getFolders();
}

function handleSelect(id: string) {
  activeFolderId.value = id;
  emit('select', id);
}

/** 打开新建文件夹弹窗（可指定父级） */
function openCreateDialog(pid?: string) {
  dialogMode.value = 'create';
  dialogTitle.value = '新建文件夹';
  formData.value = { pid: pid || '0', name: '' };
  dialogVisible.value = true;
}

/** 打开编辑文件夹弹窗 */
function openEditDialog(folder: NotepadFolder) {
  dialogMode.value = 'edit';
  dialogTitle.value = '编辑文件夹';
  formData.value = { pid: folder.pid, name: folder.name };
  // 暂存编辑的folder id
  (formData.value as any)._editId = folder.id;
  dialogVisible.value = true;
}

/** 提交弹窗表单 */
async function submitForm() {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (dialogMode.value === 'create') {
      await NotepadService.createFolder({
        pid: formData.value.pid,
        name: formData.value.name.trim(),
      });
      ElMessage.success('创建成功');
    } else {
      const editId = (formData.value as any)._editId;
      await NotepadService.updateFolder(editId, {
        name: formData.value.name.trim(),
      });
      ElMessage.success('修改成功');
    }
    dialogVisible.value = false;
    await loadFolders();
    emit('refresh');
  } catch {
    // 校验失败
  }
}

/** 删除文件夹：检查是否有归属记事本 */
async function handleDelete(folder: NotepadFolder) {
  // 检查该文件夹下是否有文档
  const docs = await NotepadService.getDocuments(folder.id);
  if (docs.length > 0) {
    ElMessage.warning(`该文件夹下有 ${docs.length} 篇记事本，不支持删除`);
    return;
  }

  // 检查子文件夹是否有文档
  const childHasDocs = await checkChildHasDoc(folder);
  if (childHasDocs) {
    ElMessage.warning('子文件夹中存在记事本，不支持删除');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定删除文件夹「${folder.name}」吗？`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    );
    await NotepadService.deleteFolder(folder.id);
    if (activeFolderId.value === folder.id) {
      activeFolderId.value = 'recent';
      emit('select', 'recent');
    }
    await loadFolders();
    emit('refresh');
    ElMessage.success('删除成功');
  } catch {
    // 取消删除
  }
}

/** 递归检查子文件夹是否有文档 */
async function checkChildHasDoc(folder: FolderTreeNode): Promise<boolean> {
  const docs = await NotepadService.getDocuments(folder.id);
  if (docs.length > 0) return true;
  if (folder.children) {
    for (const child of folder.children) {
      if (await checkChildHasDoc(child)) return true;
    }
  }
  return false;
}

/** 目录树转选项列表（用于下拉选择） */
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

const folderOptions = computed(() => {
  return [{ label: '根目录', value: '0' }, ...treeToOptions(folderTree.value)];
});

defineExpose({ loadFolders, openCreateDialog });
</script>

<template>
  <div class="notepad-sidebar h-full flex flex-col bg-background">
    <!-- 新建按钮：下拉菜单 -->
    <div class="border-b border-border px-3 py-2.5">
      <ElDropdown
        trigger="click"
        @command="
          (cmd: string) => {
            if (cmd === 'note') emit('createNote');
            else if (cmd === 'folder') openCreateDialog('0');
          }
        "
      >
        <button
          class="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus class="h-4 w-4" />
          新建
          <ChevronDown class="h-3 w-3" />
        </button>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="note">
              <FileText class="mr-2 h-4 w-4" />新建笔记
            </ElDropdownItem>
            <ElDropdownItem command="folder">
              <FolderPlus class="mr-2 h-4 w-4" />新建文件夹
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>

    <!-- 目录列表 -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      <!-- 固定项：最近使用 -->
      <div
        class="group flex cursor-pointer items-center rounded-md px-2 py-2 transition-colors"
        :class="
          activeFolderId === 'recent'
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted/50 text-foreground'
        "
        @click="handleSelect('recent')"
      >
        <FolderOpen class="mr-2 h-4 w-4 shrink-0" />
        <span class="truncate text-sm">最近使用</span>
      </div>

      <!-- 固定项：我的文件夹标题 -->
      <div class="mt-3 mb-1 px-2 text-xs font-medium text-muted-foreground">
        我的文件夹
      </div>

      <!-- 文件夹树 -->
      <template v-for="folder in folderTree" :key="folder.id">
        <!-- 文件夹项 -->
        <div
          class="group relative flex cursor-pointer items-center rounded-md px-2 py-2 transition-colors"
          :class="
            activeFolderId === folder.id
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted/50 text-foreground'
          "
          @click="handleSelect(folder.id)"
        >
          <div class="min-w-0 flex flex-1 items-center">
            <FolderOpen class="mr-2 h-4 w-4 shrink-0 text-warning" />
            <span class="truncate text-sm">{{ folder.name }}</span>
            <span class="ml-1 shrink-0 text-xs text-muted-foreground">
              ({{ folder.doc_count || 0 }})
            </span>
          </div>

          <!-- 三点菜单 -->
          <ElDropdown
            trigger="click"
            @command="
              (cmd: string) => {
                if (cmd === 'add') openCreateDialog(folder.id);
                else if (cmd === 'edit') openEditDialog(folder);
                else if (cmd === 'delete') handleDelete(folder);
              }
            "
          >
            <button
              class="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
              @click.stop
            >
              <MoreHorizontal class="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="add">
                  <Plus class="mr-1 h-3.5 w-3.5" />添加子级分类
                </ElDropdownItem>
                <ElDropdownItem command="edit">
                  <Pencil class="mr-1 h-3.5 w-3.5" />编辑
                </ElDropdownItem>
                <ElDropdownItem command="delete" divided>
                  <Trash2 class="mr-1 h-3.5 w-3.5" />删除
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>

        <!-- 子文件夹递归渲染 -->
        <template v-if="folder.children?.length">
          <div
            v-for="child in folder.children"
            :key="child.id"
            class="group relative ml-6 flex cursor-pointer items-center rounded-md px-2 py-2 transition-colors"
            :class="
              activeFolderId === child.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted/50 text-foreground'
            "
            @click="handleSelect(child.id)"
          >
            <div class="min-w-0 flex flex-1 items-center">
              <FolderOpen class="mr-2 h-4 w-4 shrink-0 text-warning" />
              <span class="truncate text-sm">{{ child.name }}</span>
              <span class="ml-1 shrink-0 text-xs text-muted-foreground">
                ({{ child.doc_count || 0 }})
              </span>
            </div>

            <ElDropdown
              trigger="click"
              @command="
                (cmd: string) => {
                  if (cmd === 'add') openCreateDialog(child.id);
                  else if (cmd === 'edit') openEditDialog(child);
                  else if (cmd === 'delete') handleDelete(child);
                }
              "
            >
              <button
                class="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                @click.stop
              >
                <MoreHorizontal class="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="add">
                    <Plus class="mr-1 h-3.5 w-3.5" />添加子级分类
                  </ElDropdownItem>
                  <ElDropdownItem command="edit">
                    <Pencil class="mr-1 h-3.5 w-3.5" />编辑
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    <Trash2 class="mr-1 h-3.5 w-3.5" />删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </template>
      </template>
    </div>

    <!-- 新建/编辑文件夹弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="420px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
      >
        <ElFormItem label="前置文件夹" prop="pid">
          <ElSelect
            v-model="formData.pid"
            placeholder="请选择前置文件夹"
            class="w-full"
          >
            <ElOption
              v-for="opt in folderOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="文件夹名称" prop="name">
          <ElInput
            v-model="formData.name"
            placeholder="请输入文件夹名称"
            maxlength="30"
            show-word-limit
            autofocus
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <button
          class="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          @click="dialogVisible = false"
        >
          取消
        </button>
        <button
          class="ml-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary-hover"
          @click="submitForm"
        >
          确认提交
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
/* 目录面板：鼠标移入显示滚动条，overlay方式不占空间防抖动 */
.notepad-sidebar :deep(.flex-1.overflow-y-auto) {
  /* overlay 滚动条：不占用内容空间，不会导致布局抖动 */
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* 默认透明（视觉隐藏） */
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
    transition: background-color 0.2s;
  }

  /* 鼠标移入时显示 */
  &:hover::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
  }

  &:hover::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground));
  }
}
</style>
