import request from "@/api/request";

export namespace AppVersionService {
  /**
   * 发布新版本
   */
  export const publishVersion = (id: string, data: {
    version: string;
    download_url: string;
    release_notes?: string;
    sort_weight?: number;
  }) => {
    return request.post(`/market/apps/${id}/publish-version`, data);
  };
}

export default AppVersionService;
