import type { FilesRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/files';

export const FilesService = {
  ...BaseService<FilesRow>({ baseUrl }),

  /** 图片上传（落到 sub_dir 子目录） */
  uploadImage(data: { file: File; sub_dir: string }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('sub_dir', data.sub_dir);
    return requestClient.post(`${baseUrl}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 附件上传（非图片文件） */
  uploadAttachment(data: { file: File; sub_dir: string }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('sub_dir', data.sub_dir);
    return requestClient.post(`${baseUrl}/upload-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 远程图片 URL 拉取并保存到系统存储 */
  fetchAndSaveImage(data: { sub_dir?: string; url: string }) {
    return requestClient.post(`${baseUrl}/fetch-and-save-image`, data);
  },

  /**
   * 删除附件（需当前登录管理员密码）
   *
   * 后端校验密码通过后删除记录，并同步清理对应的云 / 本地物理资源。
   */
  removeWithPassword(ids: (number | string)[], password: string) {
    return requestClient.delete(baseUrl, { data: { ids, password } });
  },

  uploadImageBase64(data: any) {
    return requestClient.post(`${baseUrl}/upload-image-base64`, data);
  },

  /**
   * 按资源 key 批量换取可访问地址
   *
   * 公开空间返回访问域名拼接结果；私有空间（非公开读）返回带签名的临时直链。
   *
   * @param keys 资源地址集合（相对路径或本空间域名下的绝对地址）
   */
  accessUrls(keys: string[]) {
    return requestClient.post(`${baseUrl}/access-urls`, { keys }) as Promise<
      { key: string; url: string }[]
    >;
  },

  downloadById(id: number | string) {
    return requestClient.get(`${baseUrl}/download-by-id/${id}`, {
      responseType: 'blob',
    } as any);
  },

  getFileInfoByIds(params: any) {
    return requestClient.post('/sys/fileInfo/getFileInfoByIds', params);
  },

  initiateMultipartUpload(params: any) {
    return requestClient.post('/sys/fileInfo/initiateMultipartUpload', params);
  },

  uploadPart(data: any) {
    return requestClient.post('/sys/fileInfo/uploadPart', data);
  },

  completeMultipartUpload(params: any) {
    return requestClient.post('/sys/fileInfo/completeMultipartUpload', params);
  },

  abortMultipartUpload(params: any) {
    return requestClient.post('/sys/fileInfo/abortMultipartUpload', params);
  },

  getFileList(params: any) {
    return requestClient.get(baseUrl, { params });
  },

  getCategories() {
    return requestClient.get(`${baseUrl}/categories`);
  },
};
