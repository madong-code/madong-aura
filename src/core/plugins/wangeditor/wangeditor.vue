<script setup lang="ts">
import type {
  IButtonMenu,
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from '@wangeditor/editor';

import type {
  WangEditorEmits,
  WangEditorExpose,
  WangEditorProps,
  WangEditorUploadConfig,
} from './types';

import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue';

import { Boot } from '@wangeditor/editor';
// 关键：具名导入，不是 default 导入！兼容 Vue 3.5+
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';

import { $t } from '#/core/locales';
import { useVbenModal } from '#/core/ui/popup';
import { signContentImages } from '#/utils/url/private-storage';

import Preview from './preview.vue';

import '@wangeditor/editor/dist/css/style.css';

defineOptions({ name: 'WangEditor' });

const props = withDefaults(defineProps<WangEditorProps>(), {
  height: '500px',
  mode: 'default',
  placeholder: () => $t('ui.wangeditor.placeholder'),
  excludeKeys: () => ['fontFamily'],
  editable: true,
  toolbar: true,
  previewable: true,
  minHeight: 320,
});

const emit = defineEmits<WangEditorEmits>();

// ========== 自定义预览菜单（追加到工具栏末尾） ==========
const PREVIEW_MENU_KEY = 'wangeditorPreview';

class PreviewMenu implements IButtonMenu {
  readonly iconSvg =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
  readonly tag = 'button';
  readonly title = $t('ui.tiptap.toolbar.preview');

  exec(editor: IDomEditor) {
    editor.emit(PREVIEW_MENU_KEY);
  }

  getValue(): boolean | string {
    return '';
  }

  isActive(): boolean {
    return false;
  }

  isDisabled(): boolean {
    return false;
  }
}

try {
  Boot.registerMenu({
    key: PREVIEW_MENU_KEY,
    factory() {
      return new PreviewMenu();
    },
  });
} catch {
  // 菜单已注册（热更新或多实例场景），忽略重复注册错误
}

const modelValue = defineModel<string>({ default: '' });

// 编辑器实例引用（用 shallowRef 和 old/madong-vue 保持一致）
const editorRef = shallowRef<IDomEditor>();

// 编辑器根节点：正文型图片需在渲染完成后扫描并换取签名地址
const wrapperRef = ref<HTMLElement | null>(null);

// 私有存储下：内容里的图片（回显的既有内容、新插入的图片）都要换取签名地址才能显示
let contentObserver: MutationObserver | null = null;

const syncContentImages = async () => {
  await nextTick();
  void signContentImages(wrapperRef.value);
};

// 全屏按钮清理定时器
const fullscreenTimers: ReturnType<typeof setTimeout>[] = [];

// 预览菜单事件监听清理函数
let cleanupPreviewListener: (() => void) | null = null;

// 预览弹窗
const [PreviewModal, previewModalApi] = useVbenModal({
  footer: false,
  fullscreenButton: false,
});

const previewContent = computed(() => modelValue.value);

function openPreviewModal() {
  previewModalApi.open();
}

// ========== 上传配置（参考 old/madong-vue） ==========
const DEFAULT_UPLOAD_CONFIG: Required<
  Pick<
    WangEditorUploadConfig,
    'allowedFileTypes' | 'fieldName' | 'maxFileSize' | 'maxNumberOfFiles'
  >
> = {
  fieldName: 'file',
  maxFileSize: 3 * 1024 * 1024,
  maxNumberOfFiles: 10,
  allowedFileTypes: ['image/*'],
};

const mergedUploadConfig = computed(() => ({
  ...DEFAULT_UPLOAD_CONFIG,
  ...props.uploadConfig,
}));

// 上传服务器地址（留空时不上传）
const uploadServer = computed(() => props.uploadConfig?.server || '');

const hasServer = computed(() => !!uploadServer.value);
const hasImageUpload = computed(() => !!props.imageUpload);
const hasCustomUpload = computed(() => !!props.uploadConfig?.customUpload);

// ========== 工具栏配置（参考 old/madong-vue） ==========
const toolbarConfig = computed((): Partial<IToolbarConfig> => {
  const config: Partial<IToolbarConfig> = {};

  // 默认排除的按键（fontFamily 无意义；fullScreen 在 5.1.x 中有渲染重复 bug）
  const defaultExclude = ['fontFamily', 'fullScreen'];
  config.excludeKeys =
    props.excludeKeys && props.excludeKeys.length > 0
      ? [...defaultExclude, ...props.excludeKeys]
      : defaultExclude;

  if (props.toolbarKeys && props.toolbarKeys.length > 0) {
    config.toolbarKeys = props.toolbarKeys;
  }

  // 将预览按钮追加到工具栏末尾（合并用户自定义 insertKeys）
  const userInsertKeys = props.insertKeys || { index: -1, keys: [] };
  const customKeys = userInsertKeys.keys || [];
  config.insertKeys = {
    index: userInsertKeys.index ?? -1,
    keys: props.previewable ? [...customKeys, PREVIEW_MENU_KEY] : customKeys,
  };

  return config;
});

// ========== 编辑器配置（参考 old/madong-vue） ==========
const editorConfig = computed((): Partial<IEditorConfig> => {
  const config: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
  };

  // 仅当有上传配置时才设置 MENU_CONF
  if (hasImageUpload.value || hasCustomUpload.value || hasServer.value) {
    config.MENU_CONF = {
      uploadImage: {
        fieldName: mergedUploadConfig.value.fieldName,
        maxFileSize: mergedUploadConfig.value.maxFileSize,
        maxNumberOfFiles: mergedUploadConfig.value.maxNumberOfFiles,
        allowedFileTypes: mergedUploadConfig.value.allowedFileTypes,
        meta: mergedUploadConfig.value.meta || {},
        ...(hasServer.value ? { server: uploadServer.value } : {}),
        customUpload: getCustomUploadFn(),
      },
    };
  }

  return config;
});

function getCustomUploadFn() {
  // 优先使用 imageUpload prop
  if (props.imageUpload) {
    return async (
      file: File,
      insertFn: (url: string, alt?: string, href?: string) => void,
    ) => {
      try {
        const url = await props.imageUpload?.upload(file);
        if (url) {
          insertFn(url, file.name, '');
        }
      } catch (error) {
        console.error($t('ui.wangeditor.uploadError'), error);
        props.imageUpload?.onUploadError?.(error);
      }
    };
  }

  // 其次使用 uploadConfig.customUpload
  if (props.uploadConfig?.customUpload) {
    return props.uploadConfig.customUpload;
  }

  // 默认上传实现
  return async (
    file: File,
    insertFn: (url: string, alt?: string, href?: string) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);

    if (mergedUploadConfig.value.meta) {
      Object.entries(mergedUploadConfig.value.meta).forEach(([key, val]) => {
        formData.append(key, String(val));
      });
    }

    try {
      const response = await fetch(uploadServer.value, {
        method: 'POST',
        headers: { ...props.uploadConfig?.headers },
        body: formData,
      });
      const result = await response.json();

      if (result.errno === 0 || result.code === 0) {
        const url = result.data?.url || result.data?.base_path;
        if (url) {
          insertFn(url, file.name, '');
        }
      }
    } catch (error) {
      console.error($t('ui.wangeditor.uploadError'), error);
    }
  };
}

// ========== 编辑器生命周期（参考 old/madong-vue） ==========
function onCreateEditor(editor: IDomEditor) {
  editorRef.value = editor;
  emit('created', editor);

  // 私有存储：内容（含回显的既有内容）渲染完成后换取图片签名地址；
  // 同时监听 img 的 src 变化，编辑器重渲染把 src 还原成原始路径时自动补签
  editor.on('change', syncContentImages);
  if (wrapperRef.value) {
    contentObserver = new MutationObserver(() => {
      void syncContentImages();
    });
    contentObserver.observe(wrapperRef.value, {
      attributes: true,
      attributeFilter: ['src'],
      childList: true,
      subtree: true,
    });
  }
  void syncContentImages();

  // 绑定预览菜单点击事件
  if (props.previewable) {
    editor.on(PREVIEW_MENU_KEY, openPreviewModal);
    cleanupPreviewListener = () => {
      editor.off(PREVIEW_MENU_KEY, openPreviewModal);
    };
  }

  // 定时轮询清理全屏按钮（弥补 excludeKeys 在某些场景下不生效的问题）
  const purgeFullScreen = () => {
    [
      'fullScreen',
      'fullscreen',
      'full-screen',
      'enterFullScreen',
      'exitFullScreen',
    ].forEach((key) => {
      document
        .querySelectorAll(`.w-e-bar-item[data-menu-key="${key}"]`)
        .forEach((el) => ((el as HTMLElement).style.display = 'none'));
    });
  };

  // 分多个时间点执行：100ms、500ms、1s、2s
  [100, 500, 1000, 2000].forEach((ms) => {
    fullscreenTimers.push(setTimeout(purgeFullScreen, ms));
  });
}

onBeforeUnmount(() => {
  // 清理全屏按钮轮询定时器
  fullscreenTimers.forEach((timer) => clearTimeout(timer));
  fullscreenTimers.length = 0;

  // 清理正文图片签名监听
  contentObserver?.disconnect();
  contentObserver = null;

  // 清理预览菜单事件监听
  if (cleanupPreviewListener) {
    cleanupPreviewListener();
    cleanupPreviewListener = null;
  }

  const editor = editorRef.value;
  if (editor) {
    editor.off('change', syncContentImages);
    editor.destroy();
  }
});

// ========== 暴露方法（参考 old/madong-vue） ==========
defineExpose<WangEditorExpose>({
  getEditor: () => editorRef.value || null,
  setHtml: (html: string) => editorRef.value?.setHtml(html),
  getHtml: () => editorRef.value?.getHtml() || '',
  clear: () => editorRef.value?.clear(),
  focus: () => editorRef.value?.focus(),
  destroy: () => {
    editorRef.value?.destroy();
  },
});
</script>

<template>
  <div class="editor-wrapper" ref="wrapperRef">
    <!-- 工具栏 -->
    <Toolbar
      v-if="toolbar && editorRef"
      class="editor-toolbar"
      :editor="editorRef"
      :mode="mode"
      :default-config="toolbarConfig"
    />

    <!-- 编辑器 -->
    <Editor
      :style="{ height: editable ? height : 'auto', overflowY: 'hidden' }"
      v-model="modelValue"
      :mode="mode"
      :default-config="editorConfig"
      :editable="editable"
      @on-created="onCreateEditor"
    />

    <!-- 预览弹窗 -->
    <PreviewModal
      v-if="previewable"
      :title="$t('ui.tiptap.toolbar.preview')"
      class="w-4/5"
    >
      <Preview :content="previewContent" :min-height="minHeight" />
    </PreviewModal>
  </div>
</template>

<style scoped>
/* ========== 参考 old/madong-vue style.scss ========== */

/* 编辑器容器 */
.editor-wrapper {
  width: 100%;
  overflow: hidden;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) / 3 + 2px) !important;
}

/* 工具栏 */
.editor-wrapper :deep(.editor-toolbar) {
  border-bottom: 1px solid hsl(var(--border));
}

.editor-wrapper :deep(.w-e-toolbar) {
  background-color: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

/* 编辑器文本容器 */
.editor-wrapper :deep(.w-e-text-container) {
  background-color: hsl(var(--card));
}

.editor-wrapper :deep(.w-e-text-container [data-slate-editor]) {
  color: hsl(var(--foreground));
}

/* 工具栏按钮 */
.editor-wrapper :deep(.w-e-bar-item) {
  color: hsl(var(--foreground));
}

.editor-wrapper :deep(.w-e-bar-item:hover) {
  background-color: hsl(var(--accent));
}

.editor-wrapper :deep(.w-e-bar-item-active) {
  color: hsl(var(--primary));
  background-color: hsl(var(--accent));
}

/* wangEditor CSS 变量 */
.editor-wrapper :deep(*) {
  --w-e-toolbar-active-bg-color: hsl(var(--accent));
  --w-e-toolbar-color: hsl(var(--foreground));
  --w-e-textarea-selected-border-color: hsl(var(--border));
  --w-e-textarea-slight-bg-color: hsl(var(--accent));
}
</style>

<!-- 非scoped：全屏时容器脱离组件作用域 -->
<style>
/* ====== 全屏容器：固定撑满整个视口 ====== */
.wangeditor-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 100 !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
  background-color: #fff !important;
}

/* ====== editor-wrapper 弹性撑满（flex:1 占据 toolbar 和全屏按钮之间的空间） ====== */
.wangeditor-fullscreen .editor-wrapper {
  display: flex !important;
  flex: 1 !important;
  flex-direction: column !important;
  min-height: 0 !important;
  overflow: hidden !important;
  border-radius: 0 !important;
}

/* 工具栏固定高度 */
.wangeditor-fullscreen .editor-wrapper .editor-toolbar,
.wangeditor-fullscreen .editor-wrapper .w-e-bar {
  flex-shrink: 0 !important;
}

/* 编辑器外层容器弹性撑满（覆盖行内 style="height: 500px"） */
.wangeditor-fullscreen .editor-wrapper > [editable] {
  flex: 1 !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

/* 编辑器内层容器 100% 高度 */
.wangeditor-fullscreen .editor-wrapper .w-e-text-container,
.wangeditor-fullscreen .editor-wrapper .w-e-scroll {
  height: 100% !important;
}
</style>
