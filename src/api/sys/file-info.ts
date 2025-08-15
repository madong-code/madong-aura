import request from '@/utils/http'

export class FileInfoService {
  /**
   * 文件上传
   * @param data
   */
  static uploadFile(data: any) {
    return request.upload('/sys/fileInfo/upload', data)
  }
  /**
   * 通过文件id集合获取文件信息
   * @param data
   */
  static getFileInfoByIds(params: any) {
    return request.post({
      url: '/sys/fileInfo/getFileInfoByIds',
      params
    })
  }
  /**
   * 初始化切片
   * /sys/fileInfo/initiateMultipartUpload
   */

  static initiateMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/initiateMultipartUpload',
      params
    })
  }

  /**
   * 上传切片
   * /sys/fileInfo/uploadPart
   */
  static uploadPart(data: any) {
    return request.upload('/sys/fileInfo/uploadPart', data)
  }
  /**
   * 已完成分片上传-告知合并
   * /sys/fileInfo/completeMultipartUpload
   */
  static completeMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/completeMultipartUpload',
      params
    })
  }
  /**
   * 取消分片上传
   * /sys/fileInfo/abortMultipartUpload
   */
  static abortMultipartUpload(params: any) {
    return request.post({
      url: '/sys/fileInfo/abortMultipartUpload',
      params
    })
  }
}
