<script lang="ts" setup>
import type { NotepadDocument } from '#/api/content/notepad/types';

import { nextTick, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import { NotepadService } from '#/api/content/notepad';

const props = defineProps<{
  document: NotepadDocument | null;
}>();

const emit = defineEmits<{
  (e: 'update:document', doc: NotepadDocument): void;
}>();

// 编辑器内容
const editorContent = ref('');
// 标题（内部维护，用于失焦保存）
const docTitle = ref('');
// 是否正在保存
const saving = ref(false);
// 编辑器ref
const editorRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => props.document,
  async (doc) => {
    if (doc) {
      docTitle.value = doc.title;
      editorContent.value = doc.content || '';
      await nextTick();
      editorRef.value?.focus();
    } else {
      docTitle.value = '';
      editorContent.value = '';
    }
  },
  { immediate: true },
);

/** 保存文档（含标题和内容） */
async function handleSave() {
  if (!props.document) return;

  const title = docTitle.value.trim();
  if (!title) {
    ElMessage.warning('请输入标题');
    return;
  }

  saving.value = true;
  try {
    await NotepadService.updateDocument(props.document.id, {
      title,
      content: editorContent.value,
    });
    emit('update:document', {
      ...props.document,
      title,
      content: editorContent.value,
    });
    ElMessage.success('保存成功');
  } finally {
    saving.value = false;
  }
}

/** 仅保存标题（父组件头部输入框失焦时调用） */
async function handleSaveTitle(title: string) {
  if (!props.document || !title) return;
  try {
    await NotepadService.updateDocument(props.document.id, {
      title,
      content: editorContent.value,
    });
    docTitle.value = title;
    emit('update:document', {
      ...props.document,
      title,
      content: editorContent.value,
    });
  } catch {
    // 静默处理
  }
}

// 工具栏命令（模拟富文本操作）
function execCommand(cmd: string) {
  const el = editorRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selectedText = editorContent.value.slice(start, end);

  switch (cmd) {
    case 'bold': {
      insertAtCursor(`**${selectedText || '粗体文本'}**`);
      break;
    }
    case 'code': {
      insertAtCursor(`\`\`${selectedText || '代码'}\`\``);
      break;
    }
    case 'heading': {
      insertAtCursor(`\n## ${selectedText || '标题'}\n`);
      break;
    }
    case 'italic': {
      insertAtCursor(`*${selectedText || '斜体文本'}*`);
      break;
    }
    case 'ol': {
      insertAtCursor(`\n1. ${selectedText || '列表项'}`);
      break;
    }
    case 'quote': {
      insertAtCursor(`\n> ${selectedText || '引用文本'}\n`);
      break;
    }
    case 'ul': {
      insertAtCursor(`\n- ${selectedText || '列表项'}`);
      break;
    }
    case 'underline': {
      insertAtCursor(`<u>${selectedText || '下划线文本'}</u>`);
      break;
    }
    default: {
      break;
    }
  }
}

async function insertAtCursor(text: string) {
  const el = editorRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const before = editorContent.value.slice(0, start);
  const after = editorContent.value.slice(el.selectionEnd);
  editorContent.value = before + text + after;
  await nextTick();
  el.focus();
  el.setSelectionRange(start + text.length, start + text.length);
}

defineExpose({ handleSave, handleSaveTitle });
</script>

<template>
  <div class="notepad-editor flex h-full flex-col bg-background">
    <!-- 无选中状态 -->
    <div
      v-if="!props.document"
      class="flex h-full items-center justify-center text-sm text-muted-foreground"
    >
      请选择或新建一个文档
    </div>

    <template v-else>
      <!-- 工具栏 -->
      <div class="flex items-center border-b border-border px-4 py-2">
        <div class="flex flex-wrap items-center gap-1">
          <button
            title="正文"
            class="rounded px-2 py-1 text-xs hover:bg-muted"
            @click="execCommand('normal')"
          >
            正文
          </button>
          <span class="text-border">|</span>

          <button
            title="加粗"
            class="rounded p-1 hover:bg-muted"
            @click="execCommand('bold')"
          >
            <strong>B</strong>
          </button>
          <button
            title="斜体"
            class="rounded p-1 italic hover:bg-muted"
            @click="execCommand('italic')"
          >
            <em>I</em>
          </button>
          <button
            title="下划线"
            class="rounded p-1 underline hover:bg-muted"
            @click="execCommand('underline')"
          >
            U
          </button>
          <span class="text-border">|</span>

          <button
            title="标题"
            class="rounded p-1 hover:bg-muted"
            @click="execCommand('heading')"
          >
            A<sup>+</sup>
          </button>
          <button
            title="引用"
            class="rounded p-1 hover:bg-muted"
            @click="execCommand('quote')"
          >
            &ldquo;
          </button>
          <button
            title="代码块"
            class="rounded p-1 font-mono hover:bg-muted"
            @click="execCommand('code')"
          >
            &lt;/&gt;
          </button>
          <span class="text-border">|</span>

          <button
            title="无序列表"
            class="rounded p-1 hover:bg-muted"
            @click="execCommand('ul')"
          >
            &#8226; 列表
          </button>
          <button
            title="有序列表"
            class="rounded p-1 hover:bg-muted"
            @click="execCommand('ol')"
          >
            1. 列表
          </button>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <!-- 撤销 / 重做（占位） -->
          <button
            title="撤销"
            class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ↶
          </button>
          <button
            title="重做"
            class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ↷
          </button>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="flex-1 overflow-hidden p-4">
        <textarea
          ref="editorRef"
          v-model="editorContent"
          placeholder="记事本内容..."
          class="h-full w-full resize-none border-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
        ></textarea>
      </div>
    </template>
  </div>
</template>

<style scoped>
.notepad-editor :deep(.flex-1.overflow-hidden) {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.notepad-editor :deep(textarea) {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground));
  }
}
</style>
