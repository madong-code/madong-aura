import type { IDomEditor, IToolbarConfig } from '@wangeditor/editor';

export interface ImageUploadOptions {
  /** 允许的文件类型，默认 'image/*' */
  accept?: string;
  /** 最大文件大小(字节)，默认 5MB */
  maxSize?: number;
  /** 上传失败回调，未提供时使用 console.error 输出 */
  onUploadError?: (error: unknown) => void;
  /** 上传函数，返回图片 URL */
  upload: (file: File) => Promise<string>;
}

export interface WangEditorUploadConfig {
  /** 上传接口地址，默认使用 VITE_API_URL + /api/common/upload/wangeditor */
  server?: string;
  /** 上传字段名，默认 'file' */
  fieldName?: string;
  /** 最大文件大小（字节），默认 3MB */
  maxFileSize?: number;
  /** 最大上传文件数，默认 10 */
  maxNumberOfFiles?: number;
  /** 允许的文件类型，默认 ['image/*'] */
  allowedFileTypes?: string[];
  /** 额外的表单字段，会随文件一起提交到后端 */
  meta?: Record<string, number | string>;
  /** 自定义上传函数，优先级高于 server */
  customUpload?: (
    file: File,
    insertFn: (url: string, alt?: string, href?: string) => void,
  ) => Promise<void>;
  /** 上传 headers，用于添加 Authorization 等 */
  headers?: Record<string, string>;
}

export interface WangEditorProps {
  /** 编辑器高度，默认 '500px' */
  height?: string;
  /** 编辑器模式，'default' | 'simple' */
  mode?: 'default' | 'simple';
  /** 占位符文本 */
  placeholder?: string;
  /** 自定义工具栏配置（完全替换） */
  toolbarKeys?: string[];
  /** 插入新工具到指定位置 */
  insertKeys?: IToolbarConfig['insertKeys'];
  /** 排除的工具栏项 */
  excludeKeys?: string[];
  /** 图片上传配置（推荐：使用 imageUpload 传递上传函数） */
  uploadConfig?: WangEditorUploadConfig;
  /** 图片上传函数（推荐方式，更灵活） */
  imageUpload?: ImageUploadOptions;
  /** 是否可编辑，默认 true */
  editable?: boolean;
  /** 是否显示工具栏，默认 true */
  toolbar?: boolean;
  /** 是否显示预览按钮，默认 true */
  previewable?: boolean;
  /** 最小高度（预览用） */
  minHeight?: number | string;
}

export interface WangEditorEmits {
  (e: 'change' | 'update:modelValue', value: string): void;
  (e: 'created', editor: IDomEditor): void;
}

export interface WangEditorExpose {
  /** 获取编辑器实例 */
  getEditor: () => IDomEditor | null;
  /** 设置编辑器内容 */
  setHtml: (html: string) => void;
  /** 获取编辑器内容 */
  getHtml: () => string;
  /** 清空编辑器 */
  clear: () => void;
  /** 聚焦编辑器 */
  focus: () => void;
  /** 销毁编辑器 */
  destroy: () => void;
}
