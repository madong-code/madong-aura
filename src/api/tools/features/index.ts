import BaseService from '@/api/core/base'
import type {
    FeaturesRow,
    FeaturesSearchParams,
    FeaturesListResponse,
    FeaturesDetailResponse,
    FeaturesInstallParams,
    FeaturesUninstallParams,
    FeaturesDownloadParams,
    FeaturesOperationResponse,
    FeaturesStatistics,
    FeaturesUpgradeRecord
} from './model'
import request from '@/utils/http'

const baseUrl = '/plugin'

/**
 * 功能模块API服务
 */
export const FeaturesService = {
    // ...BaseService<FeaturesRow>({
    //     baseUrl,
    //     forbiddenMethods: ['export','changStatus','remove','delete']
    // }),

    /**
     * 获取功能模块列表（分页）
     * GET /tools/modules
     */
    getFeaturesList(params: FeaturesSearchParams): Promise<FeaturesListResponse> {
        return request.get<FeaturesListResponse>({
            url: baseUrl,
            params
        })
    },

    /**
     * 获取功能模块详情
     * GET /tools/modules/detail/{name}
     */
    getFeaturesDetail(name: string | number): Promise<FeaturesDetailResponse> {
        return request.get<FeaturesDetailResponse>({
            url: `${baseUrl}/detail/${name}`
        })
    },

    /**
     * 安装功能模块
     * POST /tools/modules/install
     */
    installFeatures(data: FeaturesInstallParams): Promise<FeaturesOperationResponse> {
        return request.post<FeaturesOperationResponse>({
            url: `${baseUrl}/install`,
            data
        })
    },

    /**
     * 卸载功能模块
     * POST /tools/modules/uninstall
     */
    uninstallFeatures(data: FeaturesUninstallParams): Promise<FeaturesOperationResponse> {
        return request.post<FeaturesOperationResponse>({
            url: `${baseUrl}/uninstall`,
            data
        })
    },

    /**
     * 下载功能模块
     * POST /tools/modules/{id}/download
     */
    downloadFeatures(data: FeaturesDownloadParams): Promise<FeaturesOperationResponse> {
        return request.post<FeaturesOperationResponse>({
            url: `${baseUrl}/${data.features_id}/download`,
            data
        })
    },

    /**
     * 获取功能模块更新记录
     * GET /tools/modules/{id}/upgrade-logs
     */
    getFeaturesUpgradeLogs(name: string | number): Promise<FeaturesUpgradeRecord> {
        return request.get<FeaturesUpgradeRecord>({
            url: `${baseUrl}/${name}/upgrade-logs`
        })
    },
}

export default FeaturesService