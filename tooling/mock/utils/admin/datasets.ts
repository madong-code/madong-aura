import { ADMIN_USERS } from './auth';
import { now, daysAgo } from './store';
import { MENU_ROWS } from './menu-data';

/** 固定种子的通用时间 */
const T0 = '2026-01-01 00:00:00';

// ==================== 部门 ====================
export const DEPTS: Record<string, any>[] = [
  {
    id: 1,
    pid: 0,
    level: '1',
    code: 'HQ',
    name: 'MaDong 科技',
    main_leader_id: 1,
    phone: '0755-88888888',
    enabled: 1,
    sort: 1,
    remark: '总部',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    pid: 1,
    level: '2',
    code: 'RD',
    name: '研发部',
    main_leader_id: 1,
    phone: '0755-88888801',
    enabled: 1,
    sort: 1,
    remark: '',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 3,
    pid: 1,
    level: '2',
    code: 'MKT',
    name: '市场部',
    main_leader_id: 2,
    phone: '0755-88888802',
    enabled: 1,
    sort: 2,
    remark: '',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 4,
    pid: 1,
    level: '2',
    code: 'FIN',
    name: '财务部',
    main_leader_id: 3,
    phone: '0755-88888803',
    enabled: 1,
    sort: 3,
    remark: '',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 5,
    pid: 2,
    level: '3',
    code: 'FE',
    name: '前端组',
    main_leader_id: 1,
    phone: '',
    enabled: 1,
    sort: 1,
    remark: '',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 6,
    pid: 2,
    level: '3',
    code: 'BE',
    name: '后端组',
    main_leader_id: 2,
    phone: '',
    enabled: 1,
    sort: 2,
    remark: '',
    created_at: T0,
    updated_at: T0,
  },
];

/** 部门树（children 嵌套） */
export function deptTree(): Record<string, any>[] {
  const build = (pid: number): any[] =>
    DEPTS.filter((d) => d.pid === pid).map((d) => {
      const children = build(d.id);
      return children.length ? { ...d, children } : { ...d };
    });
  return build(0);
}

// ==================== 角色 ====================
export const ROLES: Record<string, any>[] = [
  {
    id: 1,
    pid: 0,
    name: '超级管理员',
    code: 'super_admin',
    is_super_admin: 1,
    role_type: 1,
    data_scope: 1,
    enabled: 1,
    sort: 1,
    remark: '拥有全部权限',
    created_by: 1,
    updated_by: 1,
    created_at: T0,
    updated_at: T0,
    created_date: '2026-01-01',
    updated_date: '2026-01-01',
  },
  {
    id: 2,
    pid: 0,
    name: '系统管理员',
    code: 'system_admin',
    is_super_admin: 0,
    role_type: 2,
    data_scope: 4,
    enabled: 1,
    sort: 2,
    remark: '本部门及以下',
    created_by: 1,
    updated_by: 1,
    created_at: T0,
    updated_at: T0,
    created_date: '2026-01-01',
    updated_date: '2026-01-01',
  },
  {
    id: 3,
    pid: 2,
    name: '内容编辑',
    code: 'content_editor',
    is_super_admin: 0,
    role_type: 2,
    data_scope: 2,
    enabled: 1,
    sort: 3,
    remark: '自定义数据权限',
    created_by: 1,
    updated_by: 1,
    created_at: T0,
    updated_at: T0,
    created_date: '2026-01-01',
    updated_date: '2026-01-01',
  },
];

/** 角色-菜单授权（role_id -> menu ids），超管默认全部 */
export const ROLE_MENU_IDS: Map<number, number[]> = new Map([
  [1, MENU_ROWS.map((m) => m.id)],
  // 系统管理员：目录/菜单（type 1/2）全有，按钮（type 3）不给，用于验证 v-access 按钮权限
  [2, MENU_ROWS.filter((m) => m.type !== 3).map((m) => m.id)],
  [3, []],
]);

/** 角色-自定义数据权限部门（data_scope=2 时回显） */
export function roleScopes(roleId: number): Record<string, any>[] {
  const deptIds = roleId === 3 ? [2, 3] : [];
  return deptIds.map((deptId) => ({
    id: deptId,
    dept_id: deptId,
    dept_name: DEPTS.find((d) => d.id === deptId)?.name ?? '',
    role_id: roleId,
  }));
}

// ==================== 岗位 ====================
export const POSTS: Record<string, any>[] = [
  {
    id: 1,
    dept_id: 1,
    code: 'CEO',
    name: '董事长',
    sort: 1,
    enabled: 1,
    remark: '',
  },
  {
    id: 2,
    dept_id: 2,
    code: 'PM',
    name: '项目经理',
    sort: 2,
    enabled: 1,
    remark: '',
  },
  {
    id: 3,
    dept_id: 2,
    code: 'DEV',
    name: '研发工程师',
    sort: 3,
    enabled: 1,
    remark: '',
  },
  {
    id: 4,
    dept_id: 3,
    code: 'MKT',
    name: '市场专员',
    sort: 4,
    enabled: 1,
    remark: '',
  },
];

// ==================== 字典 ====================
// code 必须与前端 src/enums/dict-enum.ts 的 DictEnum 值一致
let _dictId = 0;
function dict(
  code: string,
  name: string,
  group: string,
  items: [string, string | number, string?][],
) {
  _dictId += 1;
  const dictId = _dictId;
  DICTS.push({
    id: dictId,
    group_code: group,
    name,
    code,
    data_type: 'custom',
    description: '',
    enabled: 1,
    sort: dictId,
    created_at: T0,
    updated_at: T0,
  });
  items.forEach(([label, value, color], i) => {
    DICT_ITEMS.push({
      id: DICT_ITEMS.length + 1,
      dict_id: dictId,
      code,
      label,
      value,
      sort: i + 1,
      enabled: 1,
      color: color ?? '',
      other_class: '',
      is_default: i === 0 ? 1 : 0,
      remark: '',
    });
  });
}

export const DICTS: Record<string, any>[] = [];
export const DICT_ITEMS: Record<string, any>[] = [];

dict('common.EnabledStatus', '系统开关', 'sys', [
  ['启用', '1', 'green'],
  ['禁用', '0', 'red'],
]);
dict('common.YesNoStatus', '是否', 'sys', [
  ['是', '1', 'green'],
  ['否', '0', 'red'],
]);
dict('system.LockedStatus', '锁定状态', 'sys', [
  ['正常', '0', 'green'],
  ['已锁定', '1', 'red'],
]);
dict('system.Sex', '用户性别', 'sys', [
  ['男', '0'],
  ['女', '1'],
  ['未知', '2'],
]);
dict('system.MenuType', '菜单类型', 'sys', [
  ['目录', '1', 'blue'],
  ['菜单', '2', 'green'],
  ['按钮', '3', 'orange'],
  ['路由', '4', 'purple'],
]);
dict('system.MenuOpenType', '打开方式', 'sys', [
  ['常规', '0'],
  ['内链', '1', 'blue'],
  ['外链', '2', 'purple'],
]);
dict('system.RequestMethod', '请求方式', 'sys', [
  ['GET', 'GET', 'green'],
  ['POST', 'POST', 'blue'],
  ['PUT', 'PUT', 'orange'],
  ['DELETE', 'DELETE', 'red'],
]);
dict('system.UserAdminType', '管理员类型', 'sys', [
  ['平台管理员', '1', 'blue'],
  ['租户管理员', '2', 'green'],
]);
dict('system.RoleType', '角色类型', 'sys', [
  ['超级管理员', '1', 'red'],
  ['普通角色', '2', 'blue'],
]);
dict('system.DataPermission', '数据权限', 'sys', [
  ['全部数据', '1'],
  ['自定义数据', '2'],
  ['本部门', '3'],
  ['本部门及以下', '4'],
  ['仅本人', '5'],
]);
dict('system.DictDataType', '字典数据类型', 'sys', [
  ['自定义', 'custom', 'blue'],
  ['枚举', 'enum', 'green'],
]);
dict('sys_dict_group_code', '字典分组', 'sys', [
  ['系统', 'sys'],
  ['内容', 'content'],
  ['会员', 'member'],
  ['站点', 'web'],
]);
dict('system.ConfigType', '配置类型', 'sys', [
  ['字符串', 'string'],
  ['数字', 'number'],
  ['布尔', 'boolean'],
  ['数组', 'array'],
  ['JSON', 'json'],
]);
dict('system.ConfigGroupCode', '配置分组', 'sys', [
  ['站点', 'site'],
  ['系统', 'system'],
  ['通用', 'common'],
]);
dict('system.CloudStorage', '云存储', 'sys', [
  ['本地', 'local', 'blue'],
  ['七牛', 'qiniu', 'green'],
  ['阿里云', 'oss', 'orange'],
]);
dict('system.OperationResult', '操作结果', 'sys', [
  ['成功', 'success', 'green'],
  ['失败', 'fail', 'red'],
]);
dict('system.TaskScheduleType', '调度类型', 'sys', [
  ['命令行', '1'],
  ['URL', '2'],
]);
dict('system.TaskScheduleMode', '调度模式', 'sys', [
  ['表达式', '1'],
  ['周期', '2'],
]);
dict('system.TaskScheduleCycle', '调度周期', 'sys', [
  ['分钟', '1'],
  ['小时', '2'],
  ['天', '3'],
  ['周', '4'],
  ['月', '5'],
]);
dict('system.Week', '星期', 'sys', [
  ['周日', '0'],
  ['周一', '1'],
  ['周二', '2'],
  ['周三', '3'],
  ['周四', '4'],
  ['周五', '5'],
  ['周六', '6'],
]);
dict('system.NoticeType', '通知类型', 'content', [
  ['系统', 'system', 'blue'],
  ['审批', 'workflow', 'green'],
  ['营销', 'marketing', 'orange'],
]);
dict('system.MessageType', '消息类型', 'content', [
  ['系统消息', 'system'],
  ['邮件', 'email'],
  ['短信', 'sms'],
  ['Webhook', 'webhook'],
]);
dict('system.MessageStatus', '消息状态', 'content', [
  ['已读', 'read', 'green'],
  ['未读', 'unread', 'blue'],
]);
dict('system.MessagePriority', '消息优先级', 'content', [
  ['普通', 'normal'],
  ['重要', 'important', 'orange'],
  ['紧急', 'urgent', 'red'],
]);
dict('content.MessageTemplateType', '模板类型', 'content', [
  ['系统消息', 'system'],
  ['邮件', 'email'],
  ['短信', 'sms'],
  ['Webhook', 'webhook'],
]);
dict('content.MessageTemplatePushRule', '推送规则', 'content', [
  ['即时推送', '1'],
  ['延时推送', '2'],
]);
dict('review.ReviewType', '审核类型', 'content', [
  ['文章', 'article', 'blue'],
  ['评论', 'comment', 'green'],
]);
dict('review.ReviewStatus', '审核状态', 'content', [
  ['待审核', '0', 'orange'],
  ['已通过', '1', 'green'],
  ['已驳回', '2', 'red'],
]);
dict('member.PointType', '积分类型', 'member', [
  ['增加', '1', 'green'],
  ['减少', '2', 'red'],
]);
dict('member.PointSource', '积分来源', 'member', [
  ['签到', 'sign'],
  ['注册', 'register'],
  ['消费', 'consumption'],
  ['后台调整', 'admin_adjust'],
]);
dict('web.MenuType', '菜单类型', 'web', [
  ['路由', 'route', 'blue'],
  ['链接', 'link', 'green'],
]);
dict('web.MenuCategory', '菜单分类', 'web', [
  ['目录', 'M'],
  ['菜单', 'C'],
]);
dict('web.MenuTarget', '打开方式', 'web', [
  ['当前窗口', '_self'],
  ['新窗口', '_blank'],
]);
dict('system.DbType', '数据库类型', 'sys', [
  ['MySQL', 'mysql'],
  ['PostgreSQL', 'pgsql'],
  ['SQLite', 'sqlite'],
]);
dict('platform.IsolationMode', '隔离模式', 'sys', [
  ['独立', 'standalone'],
  ['多租户', 'tenant'],
]);

// ==================== 系统配置 ====================
export const CONFIG_VALUES: Record<string, any> = {
  site_setting: {
    site_open: '1',
    site_url: 'https://madong.tech',
    site_name: 'MaDong-Saas',
    site_logo: '/madong-logo.png',
    site_network_security: '',
    site_description: 'MaDong-Saas 开源管理中台',
    site_record_no: '',
    cdn_url: '',
    cdn_url_params: '',
    site_icp_url: '',
  },
  web_site_setting: {
    site_open: '1',
    site_url: 'https://madong.tech',
    site_name: 'MaDong-Saas',
    site_logo: '/madong-logo.png',
    site_network_security: '',
    site_description: 'MaDong-Saas 开源管理中台',
    site_record_no: '',
    cdn_url: '',
    cdn_url_params: '',
    site_icp_url: '',
  },
  upload: {
    mode: 'local',
    single_limit: 10,
    total_limit: 1024,
    nums: 20,
    exclude: 'exe,bat',
    advanced: { hash_algorithm: 'MD5', virus_scan: false },
  },
  local: {
    root: 'public',
    dirname: 'upload',
    domain: '',
    remark: '',
  },
  qiniu: {
    accessKey: '',
    secretKey: '',
    bucket: '',
    domain: '',
    region: '',
    dirname: '',
    is_private: false,
    remark: '',
  },
  // 阿里云 OSS：字典 value 与配置 code 均为 oss（对齐后端 UploadScene 契约）
  oss: {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    endpoint: '',
    domain: '',
    dirname: '',
    is_private: false,
    remark: '',
  },
  email: {
    SMTPSecure: 'ssl',
    Host: 'smtp.example.com',
    Port: 465,
    Username: 'noreply@example.com',
    Password: '',
    From: 'noreply@example.com',
    FromName: 'MaDong',
    advanced: { debugLevel: 'none', timeout: 10 },
  },
  sms: {
    enable: '0',
    access_key_id: '',
    access_key_secret: '',
    sign_name: '',
    advanced: { region_id: 'cn-hangzhou', retry_times: 3, timeout: 5 },
  },
  baidu_tongji: { enabled: '0', site_id: '' },
};

export const CONFIG_ITEMS: Record<string, any>[] = Object.entries(
  CONFIG_VALUES,
).map(([code, value], i) => ({
  id: i + 1,
  group_code:
    code === 'site_setting' || code === 'web_site_setting'
      ? 'site'
      : code === 'baidu_tongji'
        ? 'common'
        : 'system',
  code,
  name: code,
  value,
  sort: i + 1,
  enabled: 1,
  created_at: T0,
  updated_at: T0,
}));

// ==================== 文件 ====================
export const FILES: Record<string, any>[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: i + 1,
    // 真实后端 with('createds') 关联返回创建人对象（列表/详情 field 为 createds.created_name）
    createds: {
      id: 1,
      created_name: '超级管理员',
    },
    url: '',
    size: String(1024 * (i + 10)),
    size_info: `${(i + 10) * 1}KB`,
    hash: `hash_${i + 1}`,
    filename: `file_${i + 1}.png`,
    original_filename: `上传图片${i + 1}.png`,
    base_path: '/upload',
    path: `/upload/2026/01/file_${i + 1}.png`,
    ext: 'png',
    content_type: 'image/png',
    platform: 'local',
    th_url: '',
    th_filename: `file_${i + 1}_thumb.png`,
    th_size: '1024',
    th_size_info: '1KB',
    th_content_type: 'image/png',
    object_id: '',
    object_type: '',
    attr: '',
    category: i % 2 === 0 ? '图片' : '附件',
    created_by: 1,
    updated_by: 1,
    created_at: daysAgo(i + 1, 10),
    updated_at: daysAgo(i + 1, 10),
    created_date: daysAgo(i + 1, 10).slice(0, 10),
  }),
);

// ==================== 回收站 ====================
export const RECYCLES: Record<string, any>[] = [
  {
    id: 1,
    data: '{"id":99,"user_name":"zhangsan"}',
    table_name: 'admin',
    table_prefix: '',
    enabled: 1,
    ip: '127.0.0.1',
    created_at: daysAgo(3, 14),
    updated_at: daysAgo(3, 14),
  },
  {
    id: 2,
    data: '{"id":88,"name":"临时角色"}',
    table_name: 'role',
    table_prefix: '',
    enabled: 1,
    ip: '127.0.0.1',
    created_at: daysAgo(5, 9),
    updated_at: daysAgo(5, 9),
  },
];

// ==================== 会员 ====================
export const MEMBER_LEVELS: Record<string, any>[] = [
  {
    id: 1,
    name: '普通会员',
    icon: '',
    min_points: 0,
    discount: 100,
    description: '默认等级',
    member_count: 6,
    sort: 1,
    status: 1,
    create_time: T0,
  },
  {
    id: 2,
    name: '白银会员',
    icon: '',
    min_points: 1000,
    discount: 95,
    description: '',
    member_count: 2,
    sort: 2,
    status: 1,
    create_time: T0,
  },
  {
    id: 3,
    name: '黄金会员',
    icon: '',
    min_points: 5000,
    discount: 90,
    description: '',
    member_count: 1,
    sort: 3,
    status: 1,
    create_time: T0,
  },
  {
    id: 4,
    name: '钻石会员',
    icon: '',
    min_points: 20000,
    discount: 85,
    description: '',
    member_count: 0,
    sort: 4,
    status: 0,
    create_time: T0,
  },
];

export const MEMBER_TAGS: Record<string, any>[] = [
  {
    id: 1,
    name: '高活跃',
    color: 'green',
    description: '近7日活跃',
    member_count: 3,
    sort: 1,
    status: 1,
    create_time: T0,
  },
  {
    id: 2,
    name: '高消费',
    color: 'red',
    description: '',
    member_count: 2,
    sort: 2,
    status: 1,
    create_time: T0,
  },
  {
    id: 3,
    name: '新用户',
    color: 'blue',
    description: '注册7日内',
    member_count: 2,
    sort: 3,
    status: 1,
    create_time: T0,
  },
];

export const MEMBER_USERS: Record<string, any>[] = Array.from(
  { length: 9 },
  (_, i) => ({
    id: i + 1,
    username: `member_0${i + 1}`,
    nickname: `会员${i + 1}`,
    phone: `1380000000${i}`,
    email: `member${i + 1}@example.com`,
    avatar: '',
    level_id: (i % 3) + 1,
    // 真实后端 with 关联返回嵌套 level 对象（列表列 field 为 level.name）
    level: {
      id: (i % 3) + 1,
      name: MEMBER_LEVELS[i % 3].name,
    },
    balance: 100 * (i + 1),
    points: 50 * (i + 10),
    // 启用状态字段契约为 enabled（CellDictTag SYS_ENABLED_STATUS 与表单同名字段）
    enabled: i === 8 ? 0 : 1,
    tag_ids: i % 2 === 0 ? [1] : [3],
    created_at: daysAgo(i + 1, 12),
    updated_at: daysAgo(i + 1, 12),
  }),
);

export const MEMBER_POINTS: Record<string, any>[] = Array.from(
  { length: 15 },
  (_, i) => {
    const member = MEMBER_USERS[i % 9];
    const points = ((i % 4) + 1) * 10;
    return {
      id: i + 1,
      member_id: member.id,
      username: member.username,
      nickname: member.nickname,
      // 真实后端 with('member') 关联返回嵌套会员对象（列表列 field 为 member.username）
      member: {
        id: member.id,
        username: member.username,
        nickname: member.nickname,
      },
      type: i % 2 === 0 ? 1 : 2,
      points,
      points_before: member.points - points,
      points_after: member.points,
      // 变动后余额（列表列 field 为 balance）
      balance: member.points,
      source: i % 2 === 0 ? 'sign' : 'admin_adjust',
      remark: '',
      operator: i % 2 === 0 ? '' : 'admin',
      create_time: daysAgo(i, 9),
      created_at: daysAgo(i, 9),
    };
  },
);

export const MEMBER_SIGNS: Record<string, any>[] = Array.from(
  { length: 6 },
  (_, i) => ({
    id: i + 1,
    points: 5,
    created_at: daysAgo(i, 8),
    member_id: (i % 9) + 1,
    device_ip: '127.0.0.1',
    sign_date: daysAgo(i, 8).slice(0, 10),
    device_ua: 'Mozilla/5.0',
    continuous_days: i + 1,
    updated_at: daysAgo(i, 8),
  }),
);

// ==================== 系统类型（sys-admin-type） ====================
export const SYS_ADMIN_TYPES: Record<string, any>[] = [
  {
    id: 1,
    code: 'admin',
    name: '平台管理员',
    sort: 1,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    code: 'tenant',
    name: '租户管理员',
    sort: 2,
    created_at: T0,
    updated_at: T0,
  },
];

// ==================== 消息中心 ====================
export const MESSAGE_CATEGORIES: Record<string, any>[] = [
  {
    id: 1,
    pid: 0,
    key: 'system',
    name: '系统消息',
    icon: 'ant-design:setting-outlined',
    description: '',
    sort: 1,
    level: 1,
    is_show: true,
    is_system: true,
    is_enabled: true,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    pid: 0,
    key: 'workflow',
    name: '审批消息',
    icon: 'ant-design:audit-outlined',
    description: '',
    sort: 2,
    level: 1,
    is_show: true,
    is_system: true,
    is_enabled: true,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 3,
    pid: 0,
    key: 'marketing',
    name: '营销消息',
    icon: 'ant-design:gift-outlined',
    description: '',
    sort: 3,
    level: 1,
    is_show: true,
    is_system: false,
    is_enabled: true,
    created_at: T0,
    updated_at: T0,
  },
];

export const MESSAGE_DEFINITIONS: Record<string, any>[] = [
  {
    id: 1,
    category_id: 1,
    category_name: '系统消息',
    key: 'system.login',
    name: '登录提醒',
    description: '新设备登录提醒',
    default_on: 1,
    nav_type: '',
    nav_value: '',
    sort: 1,
    is_system: 1,
    is_enabled: 1,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    category_id: 1,
    category_name: '系统消息',
    key: 'system.reset_password',
    name: '密码重置',
    description: '',
    default_on: 1,
    nav_type: '',
    nav_value: '',
    sort: 2,
    is_system: 1,
    is_enabled: 1,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 3,
    category_id: 2,
    category_name: '审批消息',
    key: 'review.submitted',
    name: '审批提交',
    description: '',
    default_on: 1,
    nav_type: '',
    nav_value: '',
    sort: 3,
    is_system: 0,
    is_enabled: 1,
    created_at: T0,
    updated_at: T0,
  },
];

export const NOTIFIES: Record<string, any>[] = Array.from(
  { length: 14 },
  (_, i) => {
    const read = i % 3 !== 0;
    const category = MESSAGE_CATEGORIES[i % 3];
    return {
      id: i + 1,
      definition_id: (i % 3) + 1,
      category_id: category.id,
      category_name: category.name,
      definition_name: MESSAGE_DEFINITIONS[i % 3].name,
      module_name: 'system',
      title: [
        '系统维护通知',
        '您的审批已通过',
        '会员活动开启',
        '安全登录提醒',
        '积分到账通知',
      ][i % 5],
      content: `这是第 ${i + 1} 条通知消息的内容。`,
      status: read ? 'read' : 'unread',
      priority: 'normal',
      channel: 'system',
      related_id: '',
      related_type: '',
      action_url: '',
      action_params: '',
      sender_id: 1,
      // 真实后端 with('sender') 关联返回发送人对象（列表/详情 field 为 sender.real_name）
      sender: {
        id: 1,
        user_name: 'admin',
        real_name: '超级管理员',
      },
      receiver_id: 1,
      read_at: read ? daysAgo(i, 8) : null,
      expired_at: null,
      date: daysAgo(i, 9),
      isRead: read,
      created_at: daysAgo(i, 9),
      created_by: 1,
    };
  },
);

export const MESSAGE_TEMPLATES: Record<string, any>[] = [
  {
    id: 1,
    type: 'system',
    template_id: 'tpl_login',
    title: '登录提醒模板',
    content_template: '您的账号于 {{time}} 在 {{ip}} 登录',
    button_template: '',
    url: '',
    uni_url: '',
    webhook_url: '',
    image: '',
    status: 1,
    push_rule: 1,
    minute: 0,
    definition_name: '登录提醒',
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    type: 'email',
    template_id: 'tpl_reset',
    title: '密码重置模板',
    content_template: '点击链接重置密码：{{url}}',
    button_template: '',
    url: '',
    uni_url: '',
    webhook_url: '',
    image: '',
    status: 1,
    push_rule: 1,
    minute: 0,
    definition_name: '密码重置',
    created_at: T0,
    updated_at: T0,
  },
];

export const SUBSCRIBES: Record<string, any>[] = MESSAGE_DEFINITIONS.map(
  (d, i) => ({
    definition_id: d.id,
    module_key: 'system',
    module_name: '系统',
    description: d.description,
    content_template: '',
    category_id: d.category_id,
    category_key: MESSAGE_CATEGORIES[i % 3].key,
    category_name: d.category_name,
    is_subscribed: d.default_on === 1,
  }),
);

// ==================== 记事本 ====================
export const NOTEPAD_FOLDERS: Record<string, any>[] = [
  {
    id: 1,
    pid: 0,
    name: '工作笔记',
    icon: '',
    sort: 1,
    doc_count: 2,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 2,
    pid: 0,
    name: '技术收藏',
    icon: '',
    sort: 2,
    doc_count: 1,
    created_at: T0,
    updated_at: T0,
  },
  {
    id: 3,
    pid: 1,
    name: '周报',
    icon: '',
    sort: 1,
    doc_count: 0,
    created_at: T0,
    updated_at: T0,
  },
];

export const NOTEPAD_DOCUMENTS: Record<string, any>[] = [
  {
    id: 1,
    folder_id: 1,
    title: 'Mock 服务设计说明',
    content: '# Mock 服务\n\n用于无后端联调。',
    content_html: '',
    created_at: T0,
    updated_at: daysAgo(1, 10),
  },
  {
    id: 2,
    folder_id: 1,
    title: '待办事项',
    content: '- [x] 完成菜单种子\n- [ ] 全量端点',
    content_html: '',
    created_at: T0,
    updated_at: daysAgo(2, 10),
  },
  {
    id: 3,
    folder_id: 2,
    title: 'Vite 插件清单',
    content: 'unocss, vue-i18n...',
    content_html: '',
    created_at: T0,
    updated_at: daysAgo(3, 10),
  },
];

// ==================== 审核 ====================
export const REVIEW_TYPES: Record<string, any>[] = [
  { type: 'article', model: 'Article', label: '文章', fields: {} },
  { type: 'comment', model: 'Comment', label: '评论', fields: {} },
];

export const REVIEWS: Record<string, any>[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: i + 1,
    reviewable_type: i % 2 === 0 ? 'article' : 'comment',
    reviewable_id: i + 1,
    status: [0, 1, 2][i % 3],
    status_text: ['待审核', '已通过', '已驳回'][i % 3],
    reason: '',
    reviewer_id: i % 3 === 1 ? 1 : null,
    reviewed_at: null,
    cancel_reason: '',
    flow_type: 'single',
    flow_instance_id: null,
    extra_data: {},
    applicant: `member_0${(i % 9) + 1}`,
    type_text: i % 2 === 0 ? '文章' : '评论',
    display_name: `内容#${i + 1}`,
    title: `待审核内容标题 ${i + 1}`,
    content: '这是待审核的内容正文……',
    reviewer_name: i % 3 === 1 ? '超级管理员' : '',
    created_at: daysAgo(i, 11),
    created_by: 1,
    updated_at: daysAgo(i, 11),
    updated_by: 1,
  }),
);

export const REVIEW_LOGS: Record<string, any>[] = [
  {
    id: 1,
    review_id: 2,
    action: 'approve',
    action_text: '通过',
    operator_id: 1,
    reason: '',
    created_at: daysAgo(1, 10),
  },
  {
    id: 2,
    review_id: 3,
    action: 'reject',
    action_text: '驳回',
    operator_id: 1,
    reason: '内容违规',
    created_at: daysAgo(2, 10),
  },
];

// ==================== Web 站点 ====================
export const WEB_LINKS: Record<string, any>[] = [
  {
    id: 1,
    name: 'MaDong 官网',
    url: 'https://madong.tech',
    logo: '',
    sort: 1,
    status: 1,
  },
  {
    id: 2,
    name: 'Vben Admin',
    url: 'https://doc.vben.pro',
    logo: '',
    sort: 2,
    status: 1,
  },
  {
    id: 3,
    name: 'Element Plus',
    url: 'https://element-plus.org',
    logo: '',
    sort: 3,
    status: 0,
  },
];

export const WEB_MENUS: Record<string, any>[] = [
  {
    id: 1,
    name: 'home',
    type: 'route',
    path: '/',
    title: '首页',
    url: '',
    icon: '',
    meta: {
      id: 1,
      type: 'route',
      menu_type: 'C',
      target: '_self',
      hidden: false,
      disabled: false,
    },
    sort: 1,
  },
  {
    id: 2,
    name: 'about',
    type: 'route',
    path: '/about',
    title: '关于我们',
    url: '',
    icon: '',
    meta: {
      id: 2,
      type: 'route',
      menu_type: 'C',
      target: '_self',
      hidden: false,
      disabled: false,
    },
    sort: 2,
  },
];

// ==================== 运维 ====================
export const CRONTABS: Record<string, any>[] = [
  {
    id: 1,
    biz_id: 'cron_db_backup',
    title: '数据库备份',
    type: 2,
    task_cycle: 4,
    cycle_rule: '{"type":"day","hour":2}',
    rule: '0 2 * * *',
    target: 'php think backup:run',
    running_times: 42,
    last_running_time: daysAgo(1, 2),
    enabled: 1,
  },
  {
    id: 2,
    biz_id: 'cron_cache_clean',
    title: '缓存清理',
    type: 2,
    task_cycle: 1,
    cycle_rule: '{"type":"minute","minute":"*/30"}',
    rule: '*/30 * * * *',
    target: 'php think cache:clear',
    running_times: 300,
    last_running_time: daysAgo(0, 6),
    enabled: 1,
  },
  {
    id: 3,
    biz_id: 'cron_report',
    title: '日报生成',
    type: 1,
    task_cycle: 4,
    cycle_rule: '{"type":"day","hour":8}',
    rule: '0 8 * * *',
    target: 'php think report:daily',
    running_times: 0,
    last_running_time: 0,
    enabled: 0,
  },
];

export const LOGIN_LOGS: Record<string, any>[] = Array.from(
  { length: 10 },
  (_, i) => {
    const isAdmin = i % 4 === 0;
    const userName = isAdmin ? 'admin' : `user_0${(i % 3) + 1}`;
    return {
      id: i + 1,
      user_name: userName,
      // 真实后端 with('account') 关联返回登录账号对象（列表 field 为 account.user_name/real_name）
      account: {
        id: isAdmin ? 1 : (i % 3) + 1,
        user_name: userName,
        real_name: isAdmin ? '超级管理员' : `管理员0${(i % 3) + 1}`,
      },
      ip: '127.0.0.1',
      ip_location: '内网',
      os: 'Windows 10',
      browser: 'Chrome 120',
      status: i === 3 ? 0 : 1,
      message: i === 3 ? '密码错误' : '登录成功',
      login_time: daysAgo(i, 9),
      created_at: daysAgo(i, 9),
      remark: null,
    };
  },
);

export const OPERATE_LOGS: Record<string, any>[] = Array.from(
  { length: 10 },
  (_, i) => ({
    id: i + 1,
    name: ['登录', '更新配置', '创建角色', '删除文件', '更新菜单'][i % 5],
    app: 'adminapi',
    ip: '127.0.0.1',
    ip_location: '内网',
    browser: 'Chrome 120',
    os: 'Windows 10',
    url: '/adminapi/system/config/site_setting',
    class_name: 'app\\adminapi\\controller\\system\\ConfigController',
    action: ['login', 'update', 'create', 'delete', 'update'][i % 5],
    method: ['POST', 'PUT', 'POST', 'DELETE', 'PUT'][i % 5],
    param: '{}',
    result: '{"code":0,"msg":"ok"}',
    user_name: 'admin',
    created_date: daysAgo(i, 10).slice(0, 10),
  }),
);

export const RATE_LIMITERS: Record<string, any>[] = [
  {
    id: 1,
    name: '全局默认限流',
    match_type: 'all',
    ip: '',
    priority: 1,
    methods: 'ALL',
    path: '',
    limit_type: 'qps',
    limit_value: 100,
    period: 1,
    enabled: 1,
    message: '请求过于频繁',
    created_date: '2026-01-01',
  },
  {
    id: 2,
    name: '登录接口限流',
    match_type: 'path',
    ip: '',
    priority: 2,
    methods: 'POST',
    path: '/auth/login',
    limit_type: 'window',
    limit_value: 5,
    period: 60,
    enabled: 1,
    message: '尝试过于频繁，请稍后再试',
    created_date: '2026-01-01',
  },
];

export const BLACKLISTS: Record<string, any>[] = [
  {
    id: 1,
    ip: '10.0.0.1',
    name: '恶意扫描源',
    enabled: 1,
    priority: 1,
    methods: 'ALL',
    path: '',
    message: '禁止访问',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    created_date: '2026-01-01',
    remark: '',
  },
];

export const SERVER_INFO = {
  cpu: {
    cpu_name: 'AMD Ryzen 9 7945HX',
    physical_cores: '16',
    logical_cores: '32',
    cache_size_mb: 64,
    cpu_usage_percentage: 23.5,
    free_cpu_percentage: 76.5,
  },
  memory: {
    total_memory: 34359738368,
    available_memory: 21_474_836_480,
    used_memory: 12_884_901_888,
    php_memory_usage: 52_428_800,
    memory_usage_rate: '37.5%',
  },
  disk: [
    {
      filesystem: 'C:\\',
      size: '476G',
      available: '180G',
      used: '296G',
      use_percentage: '62%',
      mounted_on: 'C:',
    },
  ],
  php: {
    php_version: '8.3.8',
    os: 'WINNT',
    project_path: 'D:/MyProject/test/MDAdmin/backend',
    memory_limit: '256M',
    max_execution_time: '60',
    error_reporting: 'E_ALL',
    display_errors: 'on',
    upload_max_filesize: '20M',
    post_max_size: '25M',
    extension_dir: '/ext',
    loaded_extensions: 'curl,mbstring,pdo_mysql,redis,zip',
  },
};

export const REDIS_INFO: Record<string, any> = {
  redis_version: '7.2.4',
  redis_mode: 'standalone',
  os: 'Linux 5.15.0-x',
  arch_bits: 64,
  process_id: 1,
  tcp_port: 6379,
  uptime_in_seconds: 864000,
  uptime_in_days: 10,
  connected_clients: 12,
  blocked_clients: 0,
  used_memory: 10_485_760,
  used_memory_human: '10.00M',
  used_memory_rss: 12_582_912,
  used_memory_peak: 11_534_336,
  used_memory_peak_human: '11.00M',
  mem_fragmentation_ratio: 1.2,
  total_connections_received: 1024,
  total_commands_processed: 204_800,
  instantaneous_ops_per_sec: 42,
  keyspace_hits: 18_204,
  keyspace_misses: 1_024,
  expired_keys: 128,
  evicted_keys: 0,
  rdb_changes_since_last_save: 12,
  aof_enabled: 0,
  role: 'master',
};

// ==================== 开发工具 ====================
export const LANG_SUPPORTED = ['en-US', 'zh-CN'];

export const LANG_FILES: Record<string, any>[] = [
  { name: 'zh-CN', path: 'src/locales/lang/zh-CN', entries: 4 },
  { name: 'en-US', path: 'src/locales/lang/en-US', entries: 4 },
];

export const LANG_ITEMS: Record<string, any>[] = [
  {
    language: 'zh-CN',
    file: 'common',
    key: 'ok',
    value: '确定',
    created_at: T0,
    updated_at: T0,
  },
  {
    language: 'zh-CN',
    file: 'common',
    key: 'cancel',
    value: '取消',
    created_at: T0,
    updated_at: T0,
  },
  {
    language: 'en-US',
    file: 'common',
    key: 'ok',
    value: 'OK',
    created_at: T0,
    updated_at: T0,
  },
  {
    language: 'en-US',
    file: 'common',
    key: 'cancel',
    value: 'Cancel',
    created_at: T0,
    updated_at: T0,
  },
];

export const TERMINAL_CONFIG = {
  npm_package_manager: 'pnpm',
  npm_registry: 'https://registry.npmmirror.com',
  composer_registry: 'https://mirrors.aliyun.com/composer',
  automatic_cleanup_task: '30s',
};

export const TERMINAL_COMMANDS = [
  {
    id: 'codegen',
    name: '代码生成',
    icon: 'ant-design:code-outlined',
    commands: [
      { key: 'codegen.api', name: '生成 API', description: '生成接口层代码' },
      {
        key: 'codegen.crud',
        name: '生成 CRUD',
        description: '生成增删改查代码',
      },
    ],
  },
  {
    id: 'install',
    name: '环境安装',
    icon: 'ant-design:download-outlined',
    commands: [
      {
        key: 'install.server',
        name: '安装依赖',
        description: 'composer install',
      },
      {
        key: 'install.node',
        name: '安装前端依赖',
        description: 'pnpm install',
      },
    ],
  },
  {
    id: 'db',
    name: '数据库',
    icon: 'ant-design:code-square-outlined',
    commands: [
      {
        key: 'db.migrate',
        name: '执行迁移',
        description: 'php think migrate:run',
      },
      { key: 'db.seed', name: '填充数据', description: 'php think seed:run' },
    ],
  },
  {
    id: 'test',
    name: '测试',
    icon: 'ant-design:tag-outlined',
    commands: [{ key: 'test', name: '运行测试', description: '运行单元测试' }],
  },
];

// ==================== 会话（个人中心） ====================
export const SESSIONS: Record<string, any>[] = [
  {
    id: 'sess_current',
    jti: 'sess_current',
    client_type: 'admin',
    login_time: daysAgo(0, 9),
    ip: '127.0.0.1',
    ip_location: '内网',
    os: 'Windows 10',
    browser: 'Chrome 120',
    status: 1,
    user_name: 'admin',
    real_name: '超级管理员',
    avatar: '',
    message: '',
    key: 'sess_current',
    created_at: daysAgo(0, 9),
    expires_at: daysAgo(-7, 9),
    updated_at: null,
    deleted_at: null,
    remark: null,
    created_date: daysAgo(0, 9).slice(0, 10),
    updated_date: daysAgo(0, 9).slice(0, 10),
  },
  {
    id: 'sess_other',
    jti: 'sess_other',
    client_type: 'admin',
    login_time: daysAgo(2, 15),
    ip: '192.168.1.8',
    ip_location: '局域网',
    os: 'macOS',
    browser: 'Safari 17',
    status: 1,
    user_name: 'admin',
    real_name: '超级管理员',
    avatar: '',
    message: '',
    key: 'sess_other',
    created_at: daysAgo(2, 15),
    expires_at: daysAgo(-5, 15),
    updated_at: null,
    deleted_at: null,
    remark: null,
    created_date: daysAgo(2, 15).slice(0, 10),
    updated_date: daysAgo(2, 15).slice(0, 10),
  },
];

// ==================== 路由规则（devtools rule） ====================
function buildRules(): Record<string, any>[] {
  const fromMenus = MENU_ROWS.filter((m) => m.type === 4 && m.path);
  if (fromMenus.length > 0) {
    return fromMenus.slice(0, 40).map((m, i) => ({
      id: i + 1,
      name: m.code || `route_${i}`,
      method: (m.methods || 'GET').toUpperCase(),
      path: m.path,
      title: m.title,
      type: m.type,
      code: m.code,
    }));
  }
  // 菜单种子无按钮节点时，生成一组默认权限规则
  const demo: [string, string, string, string][] = [
    ['GET', '/system/admin', '管理员列表', 'system'],
    ['POST', '/system/admin', '新建管理员', 'system'],
    ['PUT', '/system/admin/:id', '编辑管理员', 'system'],
    ['DELETE', '/system/admin/:id', '删除管理员', 'system'],
    ['GET', '/system/role', '角色列表', 'system'],
    ['POST', '/system/role', '新建角色', 'system'],
    ['PUT', '/system/role/:id', '编辑角色', 'system'],
    ['DELETE', '/system/role', '删除角色', 'system'],
    ['GET', '/system/dept', '部门列表', 'system'],
    ['GET', '/system/post', '岗位列表', 'system'],
    ['POST', '/system/post', '新建岗位', 'system'],
    ['PUT', '/system/post/:id', '编辑岗位', 'system'],
    ['GET', '/system/dict', '字典列表', 'system'],
    ['PUT', '/system/dict/:id', '编辑字典', 'system'],
    ['GET', '/system/config', '配置列表', 'system'],
    ['PUT', '/system/config/:code', '保存配置', 'system'],
    ['GET', '/member/user', '会员列表', 'member'],
    ['PUT', '/member/user/:id', '编辑会员', 'member'],
    ['PUT', '/member/user/enable', '启用会员', 'member'],
    ['PUT', '/member/user/disable', '禁用会员', 'member'],
    ['GET', '/content/message/notify', '通知列表', 'content'],
    ['PUT', '/content/message/notify/:id/read', '标记已读', 'content'],
    ['GET', '/content/notepad', '记事本列表', 'content'],
    ['POST', '/content/notepad', '新建文档', 'content'],
    ['PUT', '/content/notepad/:id', '编辑文档', 'content'],
    ['DELETE', '/content/notepad/:id', '删除文档', 'content'],
    ['GET', '/ops/crontab', '定时任务列表', 'ops'],
    ['POST', '/ops/crontab', '新建定时任务', 'ops'],
    ['GET', '/devtools/terminal', '在线终端', 'devtools'],
    ['POST', '/devtools/terminal', '终端命令执行', 'devtools'],
    ['GET', '/devtools/terminal/config', '终端配置', 'devtools'],
    ['GET', '/codegen/generator/code', '生成代码列表', 'devtools'],
    ['POST', '/codegen/generator/code', '导入数据表', 'devtools'],
    ['GET', '/codegen/generator/table/table-list', '数据表列表', 'devtools'],
    ['GET', '/plugin', '模块市场列表', 'devtools'],
    ['GET', '/plugin/develop', '插件开发列表', 'devtools'],
  ];
  const cateIds: Record<string, number> = {
    system: 1,
    content: 2,
    member: 3,
    ops: 4,
    devtools: 5,
  };
  return demo.map(([method, path, title, cate], i) => ({
    id: i + 1,
    cate_id: cateIds[cate],
    name: `${cate}_${path.replaceAll(/[^a-zA-Z0-9]+/g, '_').toLowerCase()}`,
    method,
    path,
    title,
    type: 4,
    code: `${cate}:${path
      .replace(/^\//, '')
      .replace(/\/:id$/, '')
      .replaceAll(/[^a-zA-Z0-9/]+/g, ':')}`,
  }));
}

export const RULES: Record<string, any>[] = buildRules();

export const RULE_CATES = [
  { id: 1, name: '系统模块', code: 'system', sort: 1 },
  { id: 2, name: '内容模块', code: 'content', sort: 2 },
  { id: 3, name: '会员模块', code: 'member', sort: 3 },
  { id: 4, name: '运维模块', code: 'ops', sort: 4 },
  { id: 5, name: '开发工具', code: 'devtools', sort: 5 },
];

export { ADMIN_USERS };
