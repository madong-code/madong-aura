// 模块分类数据
export const moduleCategories = [
    { key: 'all', label: '全部' },
    { key: 'un_installed', label: '未安装' },
    { key: 'installed', label: '已安装' },
    { key: 'purchased', label: '已购买' },
    { key: 'updatable', label: '可更新' },
]

// 模块列表数据
export const moduleList = [
    {
        id: 1,
        name: '用户管理系统',
        description: '完整的用户管理功能，包括用户列表、角色管理、权限分配等',
        detail_description: '这是一个功能完整的用户管理系统，提供用户信息管理、角色权限分配、登录认证等功能，支持自定义字段和扩展配置。',
        category: 'full-app',
        version: '1.2.0',
        update_time: '2023-12-15',
        update_logs: [
            {
                version: '1.2.0',
                date: '2023-12-15',
                content: '1. 新增用户批量导入功能\n2. 优化角色权限管理界面\n3. 修复已知bug'
            },
            {
                version: '1.1.0',
                date: '2023-11-20',
                content: '1. 新增用户头像上传功能\n2. 增加用户登录日志'
            }
        ],
        purchased: true,
        installed: false,
        is_new: false,
        is_hot: true,
        poster: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=用户管理系统'
    },
    {
        id: 2,
        name: '数据统计面板',
        description: '直观的数据统计和可视化面板，支持多种图表类型',
        detail_description: '数据统计面板提供了丰富的数据可视化功能，支持柱状图、折线图、饼图等多种图表类型，可自定义数据源和展示方式。',
        category: 'backend',
        version: '1.0.0',
        update_time: '2023-12-01',
        update_logs: [
            {
                version: '1.0.0',
                date: '2023-12-01',
                content: '1. 首次发布\n2. 支持多种图表类型\n3. 自定义数据源配置'
            }
        ],
        purchased: false,
        installed: false,
        is_new: true,
        is_hot: false,
        poster: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=数据统计面板'
    },
    {
        id: 3,
        name: '文件存储服务',
        description: '安全可靠的文件存储服务，支持多种存储方式',
        detail_description: '文件存储服务提供了安全可靠的文件上传、下载和管理功能，支持本地存储、云存储等多种存储方式，具备权限控制和文件加密功能。',
        category: 'infrastructure',
        version: '2.1.3',
        update_time: '2023-11-10',
        update_logs: [
            {
                version: '2.1.3',
                date: '2023-11-10',
                content: '1. 优化大文件上传性能\n2. 修复存储路径问题'
            }
        ],
        purchased: true,
        installed: true,
        is_new: false,
        is_hot: true,
        poster: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=文件存储服务'
    },
    {
        id: 4,
        name: '内容管理系统',
        description: '灵活的内容管理系统，支持多种内容类型',
        detail_description: '内容管理系统提供了灵活的内容创建、编辑和发布功能，支持文章、图片、视频等多种内容类型，具备完整的工作流管理。',
        category: 'single-page',
        version: '3.0.0',
        update_time: '2023-10-25',
        update_logs: [
            {
                version: '3.0.0',
                date: '2023-10-25',
                content: '1. 全新UI设计\n2. 支持响应式布局\n3. 增加内容版本控制'
            }
        ],
        purchased: false,
        installed: false,
        is_new: false,
        is_hot: false,
        poster: 'https://via.placeholder.com/300x200/9C27B0/ffffff?text=内容管理系统'
    },
    {
        id: 5,
        name: '邮件发送服务',
        description: '高效稳定的邮件发送服务，支持模板和批量发送',
        detail_description: '邮件发送服务提供了高效稳定的邮件发送功能，支持邮件模板、批量发送、发送统计等功能，兼容多种邮件服务器。',
        category: 'infrastructure',
        version: '1.5.2',
        update_time: '2023-11-30',
        update_logs: [
            {
                version: '1.5.2',
                date: '2023-11-30',
                content: '1. 优化邮件发送队列\n2. 增加发送失败重试机制'
            }
        ],
        purchased: true,
        installed: false,
        is_new: false,
        is_hot: true,
        poster: 'https://via.placeholder.com/300x200/F44336/ffffff?text=邮件发送服务'
    },
    {
        id: 6,
        name: '短信验证服务',
        description: '安全可靠的短信验证服务，支持多种验证码类型',
        detail_description: '短信验证服务提供了安全可靠的短信验证码发送功能，支持注册验证、登录验证、密码重置等多种场景，兼容国内外各大短信服务商。',
        category: 'infrastructure',
        version: '1.2.1',
        update_time: '2023-12-05',
        update_logs: [
            {
                version: '1.2.1',
                date: '2023-12-05',
                content: '1. 增加国际短信支持\n2. 优化验证码生成算法'
            }
        ],
        purchased: false,
        installed: false,
        is_new: true,
        is_hot: false,
        poster: 'https://via.placeholder.com/300x200/00BCD4/ffffff?text=短信验证服务'
    },
    {
        id: 7,
        name: '任务调度系统',
        description: '强大的任务调度系统，支持定时和异步任务',
        detail_description: '任务调度系统提供了强大的任务调度功能，支持定时任务、异步任务、任务依赖等特性，具备任务监控和失败重试机制。',
        category: 'backend',
        version: '2.0.0',
        update_time: '2023-10-15',
        update_logs: [
            {
                version: '2.0.0',
                date: '2023-10-15',
                content: '1. 全新架构设计\n2. 支持分布式部署\n3. 增加任务可视化界面'
            }
        ],
        purchased: true,
        installed: true,
        is_new: false,
        is_hot: false,
        poster: 'https://via.placeholder.com/300x200/8BC34A/ffffff?text=任务调度系统'
    },
    {
        id: 8,
        name: 'API网关服务',
        description: '高性能的API网关服务，支持路由和限流',
        detail_description: 'API网关服务提供了高性能的API路由、限流、认证等功能，支持负载均衡和服务发现，是微服务架构的重要组件。',
        category: 'infrastructure',
        version: '3.2.0',
        update_time: '2023-11-25',
        update_logs: [
            {
                version: '3.2.0',
                date: '2023-11-25',
                content: '1. 支持WebSocket协议\n2. 优化路由匹配算法\n3. 增加API文档自动生成'
            }
        ],
        purchased: false,
        installed: false,
        is_new: false,
        is_hot: true,
        poster: 'https://via.placeholder.com/300x200/795548/ffffff?text=API网关服务'
    }
]

// 模块更新记录数据
export const moduleUpgradeLogs = [
    {
        module_id: 1,
        module_name: '用户管理系统',
        version_list: [
            {
                version_no: '1.2.0',
                release_time: '2023-12-15 14:30:00',
                upgrade_log: '1. 新增用户批量导入功能\n2. 优化角色权限管理界面\n3. 修复已知bug',
                is_important: true
            },
            {
                version_no: '1.1.0',
                release_time: '2023-11-20 10:15:00',
                upgrade_log: '1. 新增用户头像上传功能\n2. 增加用户登录日志',
                is_important: false
            }
        ]
    },
    {
        module_id: 2,
        module_name: '数据统计面板',
        version_list: [
            {
                version_no: '1.0.0',
                release_time: '2023-12-01 09:00:00',
                upgrade_log: '1. 首次发布\n2. 支持多种图表类型\n3. 自定义数据源配置',
                is_important: true
            }
        ]
    },
    {
        module_id: 3,
        module_name: '文件存储服务',
        version_list: [
            {
                version_no: '2.1.3',
                release_time: '2023-11-10 16:45:00',
                upgrade_log: '1. 优化大文件上传性能\n2. 修复存储路径问题',
                is_important: true
            }
        ]
    },
    {
        module_id: 4,
        module_name: '内容管理系统',
        version_list: [
            {
                version_no: '3.0.0',
                release_time: '2023-10-25 11:20:00',
                upgrade_log: '1. 全新UI设计\n2. 支持响应式布局\n3. 增加内容版本控制',
                is_important: true
            }
        ]
    },
    {
        module_id: 5,
        module_name: '邮件发送服务',
        version_list: [
            {
                version_no: '1.5.2',
                release_time: '2023-11-30 13:10:00',
                upgrade_log: '1. 优化邮件发送队列\n2. 增加发送失败重试机制',
                is_important: true
            }
        ]
    },
    {
        module_id: 6,
        module_name: '短信验证服务',
        version_list: [
            {
                version_no: '1.2.1',
                release_time: '2023-12-05 15:25:00',
                upgrade_log: '1. 增加国际短信支持\n2. 优化验证码生成算法',
                is_important: true
            }
        ]
    },
    {
        module_id: 7,
        module_name: '任务调度系统',
        version_list: [
            {
                version_no: '2.0.0',
                release_time: '2023-10-15 08:50:00',
                upgrade_log: '1. 全新架构设计\n2. 支持分布式部署\n3. 增加任务可视化界面',
                is_important: true
            }
        ]
    },
    {
        module_id: 8,
        module_name: 'API网关服务',
        version_list: [
            {
                version_no: '3.2.0',
                release_time: '2023-11-25 14:05:00',
                upgrade_log: '1. 支持WebSocket协议\n2. 优化路由匹配算法\n3. 增加API文档自动生成',
                is_important: true
            }
        ]
    }
]

// 工具函数
export const getModuleUpgradeLogs = (moduleId: number) => {
    return moduleUpgradeLogs.find(log => log.module_id === moduleId) || null
}

export const getLatestVersion = (moduleId: number) => {
    const moduleLog = getModuleUpgradeLogs(moduleId)
    return moduleLog && moduleLog.version_list.length > 0 ? moduleLog.version_list[0] : null
}