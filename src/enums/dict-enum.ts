/**
 * 系统字典键常量
 * 注：实际数据通过API动态获取
 */
export const DictEnum = {
  // 基础数据类
  SYS_LOCKED_STATUS: 'system.LockedStatus',
  SYS_ENABLED_STATUS: 'common.EnabledStatus',
  SYS_YES_NO: 'common.YesNoStatus',
  SYS_SEX: 'system.Sex',

  //数据字典
  SYS_DICT_DATA_TYPE: 'system.DictDataType',
  SYS_DICT_GROUP_CODE: 'sys_dict_group_code',

  // 菜单权限类
  SYS_MENU_TYPE: 'system.MenuType',
  SYS_MENU_OPEN_TYPE: 'system.MenuOpenType',
  SYS_REQUEST_MODE: 'system.RequestMethod',

  // 用户角色类
  SYS_USER_ADMIN_TYPE: 'system.UserAdminType',
  SYS_ROLE_TYPE: 'system.RoleType',
  SYS_DATA_PERMISSION: 'system.DataPermission',

  // 定时任务类
  SYS_MONITOR_CRONTAB_MODE: 'system.TaskScheduleMode', //执行模式
  SYS_MONITOR_CRONTAB_TYPE: 'system.TaskScheduleType', //任务类型
  SYS_MONITOR_CRONTAB_CYCLE: 'system.TaskScheduleCycle', //任务规则
  SYS_MONITOR_CRONTAB_WEEK: 'system.Week',

  // 服务器监控类
  SYS_MONITOR_SERVER_CPU: 'monitor_server_cpu',
  SYS_MONITOR_SERVER_MEMORY: 'monitor_server_memory',

  //通知公告
  SYS_NOTICE_TYPE: 'system.NoticeType',
  //我的消息
  SYS_MESSAGE_TYPE: 'system.MessageType',
  SYS_MESSAGE_STATUS: 'system.MessageStatus',
  SYS_MESSAGE_PRIORITY: 'system.MessagePriority',

  //系统设置
  SYS_CLOUD_STORAGE: 'system.CloudStorage',

  //操作结果
  SYS_OPERATION_RESULT: 'system.OperationResult',

  //平台管理
  SYS_DB_TYPE: 'system.DbType',
  SYS_ISOLATION_MODE: 'platform.IsolationMode',
  SYS_TENANT_ADMIN_TYPE: 'system.TenantAdminType',
  //会员管理
  MEMBER_POINT_TYPE: 'member.PointType',
  MEMBER_POINT_SOURCE: 'member.PointSource',
  //Web管理
  WEB_MENU_CATEGORY: 'web.MenuCategory',
  WEB_MENU_TYPE: 'web.MenuType',
  WEB_MENU_TARGET: 'web.MenuTarget',
} as const

export type DictEnumKey = keyof typeof DictEnum
