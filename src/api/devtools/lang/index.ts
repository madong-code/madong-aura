import { requestClient } from '#/api/request';

const BASE_URL = '/devtools/lang';

export const LangService = {
  /** 获取支持的语言列表 */
  getSupportedLanguages() {
    return requestClient.get(`${BASE_URL}/supported`);
  },

  /** 获取语言包列表 */
  getLangList(params?: Record<string, any>) {
    return requestClient.get(BASE_URL, { params });
  },

  /** 获取翻译文件列表 */
  getLangFiles(params?: Record<string, any>) {
    return requestClient.get(`${BASE_URL}/files`, { params });
  },

  /** 获取语言包统计信息 */
  getLangStatistics(params?: Record<string, any>) {
    return requestClient.get(`${BASE_URL}/statistics`, { params });
  },

  /** 根据key获取翻译内容 */
  getTranslation(params: { file: string; key: string; language: string }) {
    return requestClient.get(`${BASE_URL}/translate`, { params });
  },
};
