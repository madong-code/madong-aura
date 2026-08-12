export const DictEnum = {
  SYS_LOCKED_STATUS: 'system.LockedStatus',
  SYS_ENABLED_STATUS: 'common.EnabledStatus',
  SYS_YES_NO: 'common.YesNoStatus',
  SYS_SEX: 'system.Sex',

  SYS_DICT_DATA_TYPE: 'system.DictDataType',
  SYS_DICT_GROUP_CODE: 'sys_dict_group_code',
  SYS_CONFIG_TYPE: 'system.ConfigType',
  SYS_CONFIG_GROUP_CODE: 'system.ConfigGroupCode',

  SYS_MENU_TYPE: 'system.MenuType',
  SYS_MENU_OPEN_TYPE: 'system.MenuOpenType',
  SYS_REQUEST_MODE: 'system.RequestMethod',

  SYS_USER_ADMIN_TYPE: 'system.UserAdminType',
  SYS_ROLE_TYPE: 'system.RoleType',
  SYS_DATA_PERMISSION: 'system.DataPermission',

  SYS_MONITOR_CRONTAB_MODE: 'system.TaskScheduleMode',
  SYS_MONITOR_CRONTAB_TYPE: 'system.TaskScheduleType',
  SYS_MONITOR_CRONTAB_CYCLE: 'system.TaskScheduleCycle',
  SYS_MONITOR_CRONTAB_WEEK: 'system.Week',

  SYS_MONITOR_SERVER_CPU: 'monitor_server_cpu',
  SYS_MONITOR_SERVER_MEMORY: 'monitor_server_memory',

  SYS_NOTICE_TYPE: 'system.NoticeType',
  SYS_MESSAGE_TYPE: 'system.MessageType',
  SYS_MESSAGE_STATUS: 'system.MessageStatus',
  SYS_MESSAGE_PRIORITY: 'system.MessagePriority',

  SYS_CLOUD_STORAGE: 'system.CloudStorage',

  SYS_OPERATION_RESULT: 'system.OperationResult',

  SYS_DB_TYPE: 'system.DbType',
  SYS_ISOLATION_MODE: 'platform.IsolationMode',
  MEMBER_POINT_TYPE: 'member.PointType',
  MEMBER_POINT_SOURCE: 'member.PointSource',
  WEB_MENU_CATEGORY: 'web.MenuCategory',
  WEB_MENU_TYPE: 'web.MenuType',
  WEB_MENU_TARGET: 'web.MenuTarget',

  REVIEW_TYPE: 'review.ReviewType',
  REVIEW_STATUS: 'review.ReviewStatus',

  MSG_TEMPLATE_TYPE: 'content.MessageTemplateType',
  MSG_TEMPLATE_PUSH_RULE: 'content.MessageTemplatePushRule',
} as const;

export type DictEnumKey = keyof typeof DictEnum;
