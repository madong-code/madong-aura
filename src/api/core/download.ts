import BaseService from "./base"; // 导入基础服务类
import request from '@/utils/http'; // 导入HTTP请求工具


const baseUrl = '/export';

const DownloadService = {
  ...BaseService<any>({ baseUrl }),
  /**
 * 导出Excel文件
 * @param params 导出参数（需与后端约定，如`reportType`报表类型、`dateRange`日期范围）
 * @returns 返回包含文件URL的响应对象（前端可通过URL触发文件下载）
 * @example 
 * // 调用示例：导出用户数据Excel
 * downloadApi.excelDownload({ 
 *   reportType: 'user', 
 *   dateRange: ['2024-01-01', '2024-03-31'] 
 * })
 */
  excelDownload(params: any) {
    return request.get({
      url: `${baseUrl}/download`, // 对接后端`/export/download`接口
      params // 传递导出参数
    });
  }

}

export default DownloadService