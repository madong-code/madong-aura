/** 记事本目录/文件夹 */
export interface NotepadFolder {
  id: string;
  pid: string;
  name: string;
  icon?: string;
  sort?: number;
  doc_count?: number;
  created_at?: string;
  updated_at?: string;
}

/** 记事本文档 */
export interface NotepadDocument {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  content_html?: string;
  created_at: string;
  updated_at: string;
}

/** 目录树节点（含子目录） */
export interface FolderTreeNode extends NotepadFolder {
  children?: FolderTreeNode[];
}

/** 创建/更新文件夹参数 */
export interface CreateFolderParams {
  pid: string;
  name: string;
}

/** 创建/更新文档参数 */
export interface CreateDocumentParams {
  folder_id: string;
  title: string;
  content: string;
  content_html?: string;
}

/** 移动文档参数 */
export interface MoveDocumentParams {
  id: string;
  folder_id: string;
}
