import BaseService from '@/api/core/base';
import request from '@/utils/http';
import type { FilesRow } from './files-model';

const baseUrl = '/system/files';

export const FilesService = {
  ...BaseService<FilesRow>({ baseUrl }),

  uploadFile(data: any) {
    return request.upload(`${baseUrl}/upload-image`, data);
  },

  downloadById(id: string | number) {
    return request.get({
      url: `${baseUrl}/download-by-id/${id}`,
      responseType: 'blob',
      isResponse: true,
    } as any);
  },


  /**
 * 通过文件id集合获取文件信息
 * @param data
 */
  getFileInfoByIds(params: any) {
    return request.post({
      url: '/sys/fileInfo/getFileInfoByIds',
      params
    })
  },
  /**
   * 初始化切片
   * /sys/fileInfo/initiateMultipartUpload
   */

  initiateMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/initiateMultipartUpload',
      params
    })
  },

  /**
   * 上传切片
   * /sys/fileInfo/uploadPart
   */
  uploadPart(data: any) {
    return request.upload('/sys/fileInfo/uploadPart', data)
  },
  /**
   * 已完成分片上传-告知合并
   * /sys/fileInfo/completeMultipartUpload
   */
  completeMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/completeMultipartUpload',
      params
    })
  },
  /**
   * 取消分片上传
   * /sys/fileInfo/abortMultipartUpload
   */
  abortMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/abortMultipartUpload',
      params
    })
  }
};

export default FilesService;
