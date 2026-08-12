import type {
  CreateDocumentParams,
  CreateFolderParams,
  FolderTreeNode,
  MoveDocumentParams,
  NotepadDocument,
  NotepadFolder,
} from './types';

import { requestClient } from '#/api/request';

const baseUrl = '/content/notepad';

/**
 * 记事本服务
 */
export const NotepadService = {
  // ==================== 文件夹/目录相关 ====================

  /** 获取所有目录树 */
  async getFolderTree(): Promise<FolderTreeNode[]> {
    return requestClient.get(`${baseUrl}/folder/tree`);
  },

  /** 获取所有文件夹（扁平） */
  async getFolders(): Promise<NotepadFolder[]> {
    return requestClient.get(`${baseUrl}/folder`);
  },

  /** 创建文件夹 */
  async createFolder(params: CreateFolderParams): Promise<NotepadFolder> {
    return requestClient.post(`${baseUrl}/folder`, params);
  },

  /** 更新文件夹名称 */
  async updateFolder(
    id: string,
    params: Partial<Pick<NotepadFolder, 'name'>>,
  ): Promise<void> {
    return requestClient.put(`${baseUrl}/folder/${id}`, params);
  },

  /** 删除文件夹 */
  async deleteFolder(id: string): Promise<void> {
    return requestClient.delete(`${baseUrl}/folder/${id}`);
  },

  // ==================== 文档相关 ====================

  /** 获取文档列表（按文件夹筛选或关键词搜索） */
  async getDocuments(
    folderId?: string,
    keyword?: string,
  ): Promise<NotepadDocument[]> {
    const params: Record<string, string> = {};
    if (folderId) {
      params.folder_id = folderId;
    }
    if (keyword) {
      params.keyword = keyword;
    }
    return requestClient.get(`${baseUrl}/document`, { params });
  },

  /** 搜索文档 */
  async searchDocuments(keyword: string): Promise<NotepadDocument[]> {
    return requestClient.get(`${baseUrl}/document`, {
      params: { keyword },
    });
  },

  /** 获取单个文档详情 */
  async getDocument(id: string): Promise<NotepadDocument | undefined> {
    return requestClient.get(`${baseUrl}/document/${id}`);
  },

  /** 创建文档 */
  async createDocument(params: CreateDocumentParams): Promise<NotepadDocument> {
    return requestClient.post(`${baseUrl}/document`, params);
  },

  /** 更新文档 */
  async updateDocument(
    id: string,
    params: Partial<Omit<NotepadDocument, 'created_at' | 'id'>>,
  ): Promise<void> {
    return requestClient.put(`${baseUrl}/document/${id}`, params);
  },

  /** 删除文档 */
  async deleteDocument(id: string): Promise<void> {
    return requestClient.delete(`${baseUrl}/document/${id}`);
  },

  /** 移动文档到其他文件夹 */
  async moveDocument(params: MoveDocumentParams): Promise<void> {
    return requestClient.put(`${baseUrl}/document/${params.id}/move`, {
      folder_id: params.folder_id,
    });
  },
};
