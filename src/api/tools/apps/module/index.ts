import BaseService from "@/api/core/base";
import type {
    ModuleRow,
    ModuleSearchParams,
    ModuleDetailResponse,
    ModuleInstallParams,
    ModuleUninstallParams,
    ModuleDownloadParams,
    ModuleOperationResponse,
    ModuleStatistics,
    ModuleUpgradeRecord,
    ModuleListResponse,
} from "./types";
import request from "@/utils/http";


const baseUrl = "/plugin";

/**
 * 功能模块API服务
 */
export const AppsService = {
    /**
     * 获取功能模块列表（分页）
     * GET /tools/modules
     */
    getModuleList(params: ModuleSearchParams): Promise<ModuleListResponse> {
        return request.get<ModuleListResponse>({
            url: baseUrl,
            params,
        });
    },

    /**
     * 获取功能模块详情
     * GET /tools/modules/detail/{name}
     */
    getModuleDetail(name: string | number): Promise<ModuleDetailResponse> {
        return request.get<ModuleDetailResponse>({
            url: `${baseUrl}/detail/${name}`,
        });
    },

    /**
     * 安装功能模块
     * POST /tools/modules/install
     */
    install(data: ModuleInstallParams): Promise<ModuleOperationResponse> {
        return request.post<ModuleOperationResponse>({
            url: `${baseUrl}/install`,
            data,
        });
    },

    /**
     * 卸载功能模块
     * POST /tools/modules/uninstall
     */
    uninstall(data: ModuleUninstallParams): Promise<ModuleOperationResponse> {
        return request.post<ModuleOperationResponse>({
            url: `${baseUrl}/uninstall`,
            data,
        });
    },

    /**
     * 下载功能模块
     * POST /tools/modules/{id}/download
     */
    download(data: ModuleDownloadParams): Promise<ModuleOperationResponse> {
        return request.post<ModuleOperationResponse>({
            url: `${baseUrl}/download`,
            data,
        });
    },

    /**
     * 获取功能模块更新记录
     */
    getModuleUpgradeLogs(name: string | number): Promise<ModuleUpgradeRecord> {
        console.log("getModuleUpgradeLogs", name);
        return request.get<ModuleUpgradeRecord>({
            url: `${baseUrl}/${name}/upgrade-logs`,
        });
    },

    /**
     * 删除功能模块
     * POST /tools/modules/delete
     */
    delete(name: String): Promise<ModuleOperationResponse> {
        return request.del<ModuleOperationResponse>({
            url: `${baseUrl}/${name}`,
        });
    },
    /**
     * 检查功能模块环境
     */
    checkEnvironment(params: any): Promise<ModuleOperationResponse> {
        return request.get<any>({
            url: `${baseUrl}/check-environment`,
            params,
        });
    },
};

export default AppsService;
