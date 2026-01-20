/**
 * 功能模块接口类型定义
 * 提供tools/features模块的RESTful API接口类型定义
 */

/**
 * 功能模块基本信息接口
 */
export interface FeaturesRow {
    /** 模块ID */
    id: string | number;
    /** 模块名称 */
    name: string;
    /** 模块描述 */
    description: string;
    /** 详细描述 */
    detail_description: string;
    /** 模块分类 */
    category: string;
    /** 当前版本 */
    version: string;
    /** 更新时间 */
    update_time: string;
    /** 是否已购买 */
    purchased: boolean;
    /** 是否已安装 */
    installed: boolean;
    /** 是否为新模块 */
    is_new: boolean;
    /** 是否为热门模块 */
    is_hot: boolean;
    /** 模块海报图片 */
    poster: string;
    /** 作者信息 */
    author?: string;
    /** 模块价格 */
    price?: number;
    /** 评分 */
    rating?: number;
    /** 下载次数 */
    download_count?: number;
    /** 创建时间 */
    created_at?: string;
    /** 更新时间 */
    updated_at?: string;
}

/**
 * 功能模块更新日志接口
 */
export interface FeaturesUpdateLog {
    /** 版本号 */
    version: string;
    /** 发布日期 */
    date: string;
    /** 更新内容 */
    content: string;
    /** 是否为重要更新 */
    is_important?: boolean;
}

/**
 * 功能模块版本信息接口
 */
export interface FeaturesVersion {
    /** 版本号 */
    version_no: string;
    /** 发布时间 */
    release_time: string;
    /** 更新日志 */
    upgrade_log: string;
    /** 是否为重要更新 */
    is_important: boolean;
    /** 版本大小 */
    size?: string;
    /** 兼容性说明 */
    compatibility?: string;
    /** 下载地址 */
    download_url?: string;
}

/**
 * 功能模块更新记录接口
 */
export interface FeaturesUpgradeRecord {
    /** 模块ID */
    features_id: string | number;
    /** 模块名称 */
    features_name: string;
    /** 版本列表 */
    version_list: FeaturesVersion[];
}

/**
 * 功能模块分类接口
 */
export interface FeaturesCategory {
    /** 分类键值 */
    key: string;
    /** 分类标签 */
    label: string;
    /** 分类图标 */
    icon?: string;
    /** 模块数量 */
    count?: number;
}

/**
 * 功能模块搜索参数接口
 */
export interface FeaturesSearchParams {
    /** 搜索关键词 */
    keyword?: string;
    /** 分类筛选 */
    category?: string;
    /** 安装状态筛选 */
    installed?: boolean;
    /** 购买状态筛选 */
    purchased?: boolean;
    /** 是否为新模块 */
    is_new?: boolean;
    /** 是否为热门模块 */
    is_hot?: boolean;
    /** 排序字段 */
    sort_by?: 'name' | 'update_time' | 'rating' | 'download_count';
    /** 排序方向 */
    sort_order?: 'asc' | 'desc';
    /** 当前页码 */
    current?: number;
    /** 每页条数 */
    size?: number;
}

/**
 * 功能模块安装参数接口
 */
export interface FeaturesInstallParams {
    /** 模块ID */
    features_id: string | number;
    /** 安装配置 */
    config?: Record<string, any>;
    /** 是否覆盖安装 */
    overwrite?: boolean;
}

/**
 * 功能模块卸载参数接口
 */
export interface FeaturesUninstallParams {
    /** 模块ID */
    name: string | number;
    /** 是否保留数据 */
    keep_data?: boolean;
}

/**
 * 功能模块下载参数接口
 */
export interface FeaturesDownloadParams {
    /** 模块ID */
    name: string | number;
    /** 版本号 */
    version?: string;
}

/**
 * 功能模块操作响应接口
 */
export interface FeaturesOperationResponse {
    /** 操作是否成功 */
    success: boolean;
    /** 操作消息 */
    message: string;
    /** 操作数据 */
    data?: any;
    /** 操作时间 */
    timestamp: string;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
    /** 数据列表 */
    items: T[];
    /** 当前页码 */
    current: number;
    /** 每页条数 */
    size: number;
    /** 总条数 */
    total: number;
    /** 总页数 */
    pages?: number;
}

/**
 * 功能模块列表响应接口
 */
export type FeaturesListResponse = PaginatedResponse<FeaturesRow>;

/**
 * 功能模块详情响应接口
 */
export interface FeaturesDetailResponse extends FeaturesRow {
    /** 更新日志列表 */
    update_logs: FeaturesUpdateLog[];
    /** 依赖模块 */
    dependencies?: string[];
    /** 系统要求 */
    system_requirements?: string;
    /** 文档链接 */
    documentation_url?: string;
    /** 支持信息 */
    support_info?: string;
}

/**
 * 功能模块统计信息接口
 */
export interface FeaturesStatistics {
    /** 总模块数 */
    total_features: number;
    /** 已安装模块数 */
    installed_features: number;
    /** 可更新模块数 */
    updatable_features: number;
    /** 热门模块数 */
    hot_features: number;
    /** 新模块数 */
    new_features: number;
    /** 按分类统计 */
    category_stats: Array<{
        category: string;
        count: number;
        installed_count: number;
    }>;
}