<script setup lang="ts">
import type { NotepadDocument } from '#/api/content/notepad/types';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';
import { Save, X } from 'lucide-vue-next';

import { NotepadService } from '#/api/content/notepad';

import DirectoryPanel from './components/directory-panel.vue';
import DocListPanel from './components/doc-list-panel.vue';
import EditorPanel from './components/editor-panel.vue';

// 事件定义
const emit = defineEmits<{ (e: 'close'): void }>();

// 当前选中的文件夹
const currentFolderId = ref<string>('recent');
// 当前选中的文档
const currentDocument = ref<NotepadDocument | null>(null);
// 目录面板ref
const directoryRef = ref<InstanceType<typeof DirectoryPanel>>();
// 文档列表面板ref
const docListRef = ref<InstanceType<typeof DocListPanel>>();
// 编辑器面板ref
const editorRef = ref<InstanceType<typeof EditorPanel>>();

/** 文件夹选择变化 */
function handleFolderSelect(folderId: string) {
  currentFolderId.value = folderId;
}

/** 文档选择：获取完整内容 */
async function handleDocSelect(doc: NotepadDocument | null) {
  if (doc?.id) {
    try {
      const fullDoc = await NotepadService.getDocument(doc.id);
      currentDocument.value = fullDoc || doc;
    } catch {
      currentDocument.value = doc;
    }
  } else {
    currentDocument.value = null;
  }
}

/** 文档更新（保存后回调） */
function handleDocUpdate(doc: NotepadDocument) {
  currentDocument.value = { ...doc };
}

/** 刷新列表 */
function handleRefresh() {
  directoryRef.value?.loadFolders?.();
  docListRef.value?.loadDocuments?.();
}

/** 新建笔记：直接创建默认标题笔记并切换到编辑器 */
async function handleCreateNote() {
  // 确定目标文件夹：当前选中文件夹（排除"最近使用"），否则取第一个文件夹
  let targetFolderId = currentFolderId.value;
  if (!targetFolderId || targetFolderId === 'recent') {
    const folders = await NotepadService.getFolders();
    const firstFolder = folders[0];
    if (!firstFolder) {
      ElMessage.warning('请先创建一个文件夹');
      return;
    }
    targetFolderId = firstFolder.id;
    // 自动切换到该文件夹
    currentFolderId.value = targetFolderId;
  }

  const newDoc = await NotepadService.createDocument({
    folder_id: targetFolderId,
    title: '无标题文档',
    content: '',
  });

  currentDocument.value = newDoc;
  // 刷新文档列表
  docListRef.value?.loadDocuments?.();
  // 刷新目录计数
  directoryRef.value?.loadFolders?.();
  ElMessage.success('新建笔记成功');
}

/** 关闭整个抽屉 */
function handleClose() {
  currentDocument.value = null;
  emit('close');
}

/** 保存文档 */
function handleSave() {
  editorRef?.value?.handleSave?.();
}
</script>

<template>
  <div class="notepad-page flex h-screen overflow-hidden bg-background-deep">
    <!-- 左侧：目录面板 -->
    <div
      class="notepad-left-1 h-full w-[200px] shrink-0 overflow-hidden border-r border-border"
    >
      <DirectoryPanel
        ref="directoryRef"
        @select="handleFolderSelect"
        @refresh="handleRefresh"
        @create-note="handleCreateNote"
      />
    </div>

    <!-- 中间：文档列表面板 -->
    <div
      class="notepad-left-2 h-full w-[280px] shrink-0 overflow-hidden border-r border-border"
    >
      <DocListPanel
        ref="docListRef"
        :folder-id="currentFolderId"
        @select="handleDocSelect"
        @refresh="handleRefresh"
      />
    </div>

    <!-- 右侧：内容编辑区（始终显示，无选中时为空白编辑器） -->
    <div class="notepad-right flex h-full flex-1 flex-col overflow-hidden">
      <!-- 头部操作栏：标题(可点击编辑) + 保存 + 关闭 -->
      <div
        class="flex items-center justify-between border-b border-border px-4 py-2.5"
      >
        <!-- 标题：点击可输入，失焦自动保存 -->
        <input
          :value="currentDocument?.title || ''"
          class="min-w-0 flex-1 border-none bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/50"
          placeholder="点击输入标题..."
          @blur="
            (e) => {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && currentDocument && val !== currentDocument.title) {
                editorRef?.handleSaveTitle?.(val);
              }
            }
          "
          @keyup.enter="(e) => (e.target as HTMLInputElement).blur()"
        />
        <div class="ml-3 flex shrink-0 items-center gap-2">
          <!-- 保存按钮 -->
          <button
            class="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="保存 (Ctrl+S)"
            @click="handleSave"
          >
            <Save class="h-4 w-4" />
            保存
          </button>
          <!-- 关闭按钮（关闭整个抽屉） -->
          <button
            class="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="关闭"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="flex-1 overflow-hidden">
        <EditorPanel
          ref="editorRef"
          :document="currentDocument"
          @update:document="handleDocUpdate"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.notepad-page {
  /* 最外层不显示滚动条 */
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}
</style>
