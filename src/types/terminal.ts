/**
 * 终端模块类型定义
 * 
 * 所有字段使用小写下划线格式
 * 以与后端返回数据保持一致
 */

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',      // 待执行
  RUNNING = 'running',      // 执行中
  SUCCESS = 'success',      // 成功
  ERROR = 'error',          // 失败
  TIMEOUT = 'timeout'       // 超时
}

/**
 * 端点配置类型
 */
export interface EndConfig {
  key: string;              // 端点 key
  name: string;             // 端点名称
  base_path: string;        // 基础路径
  dist_path: string;        // 发布路径
  package_manager: string;  // 包管理器
  build_command?: string;   // 构建命令
  dev_command?: string;     // 开发命令
  enabled: boolean;         // 是否启用
}

/**
 * 命令配置类型
 */
export interface CommandConfig {
  key: string;              // 命令 key
  command: string;          // 实际命令
  description: string;      // 命令描述
  name: string;             // 命令名称（用于显示）
  category: string;         // 命令分类
  ends?: string[];          // 适用端点
  timeout?: number;         // 超时时间
  working_dir?: string;     // 工作目录
  enabled: boolean;         // 是否启用
}

/**
 * 命令分组类型
 */
export interface CommandGroup {
  key: string;              // 分组 key
  name: string;             // 分组名称
  icon: string;             // 图标
  order: number;            // 排序
}

/**
 * 任务项类型
 */
export interface TaskItem {
  uuid: string;             // 任务唯一标识
  command_key: string;      // 命令 key
  command: string;          // 完整命令
  title: string;            // 任务标题
  status: TaskStatus;       // 任务状态
  output: string;           // 命令输出
  end_key: string;          // 端点 key
  start_time: number;       // 开始时间
  end_time?: number;        // 结束时间
  sort: number;             // 排序
  show_output?: boolean;    // 是否显示输出
}

/**
 * SSE 事件类型
 */
export enum SseEventType {
  MESSAGE = 'message',
  COMMAND_LINK = 'command-link',
  COMMAND_SUCCESS = 'command-success',
  COMMAND_ERROR = 'command-error',
  COMMAND_COMPLETED = 'command-completed',
  PING = 'ping'
}

/**
 * SSE 事件数据类型
 */
export interface SseEvent {
  type: SseEventType;
  data: any;
}

/**
 * SSE 消息事件数据
 */
export interface SseMessageData {
  content: string;          // 消息内容
  uuid?: string;            // 任务 UUID
}

/**
 * SSE 成功事件数据
 */
export interface SseSuccessData {
  uuid: string;             // 任务 UUID
  output?: string;          // 输出内容
  exit_code?: number;       // 退出码
}

/**
 * SSE 错误事件数据
 */
export interface SseErrorData {
  uuid: string;             // 任务 UUID
  error: string;            // 错误信息
  exit_code?: number;       // 退出码
}

/**
 * SSE 完成事件数据
 */
export interface SseCompletedData {
  uuid: string;             // 任务 UUID
  status: TaskStatus;       // 最终状态
  exit_code: number;        // 退出码
  duration?: number;        // 执行时长 (毫秒)
}

/**
 * 权限信息类型
 */
export interface PermissionInfo {
  role: string;             // 角色
  allow_commands: string[]; // 允许的命令
  deny_commands: string[];  // 禁止的命令
  allow_ends: string[];     // 允许的端点
  deny_ends: string[];      // 禁止的端点
  max_connections: number;  // 最大连接数
  max_execution_time: number; // 最大执行时间
}

/**
 * 终端配置类型
 */
export interface TerminalConfig {
  package_manager?: string;    // 默认包管理器
  npm_registry?: string;    // NPM 源
  composer_registry?: string; // Composer 源
  automatic_cleanup_task?: boolean; // 自动清理任务
}

/**
 * SSE 连接配置
 */
export interface SseConfig {
  endpoint: string;         // SSE 端点
  uuid?: string;            // 任务 UUID
  reconnect_interval: number; // 重连间隔 (毫秒)
  max_retries: number;      // 最大重试次数
  heartbeat_interval: number; // 心跳间隔 (毫秒)
}

/**
 * 任务执行选项
 */
export interface TaskOptions {
  end_key: string;          // 端点 key
  command_key: string;      // 命令 key
  uuid?: string;            // 任务 UUID (前端生成，可选)
  variables?: Record<string, string>; // 变量替换
}

/**
 * 自定义命令选项
 */
export interface CustomCommandOptions {
  temp_command?: string;     // 临时命令内容
  uuid?: string;            // 任务 UUID (前端生成，可选)
  working_dir?: string;     // 工作目录
  timeout?: number;          // 超时时间(秒)
  environment?: Record<string, string>; // 环境变量
}

/**
 * 自定义命令配置
 */
export interface CustomCommandConfig {
  key: string;              // 命令 key
  name: string;             // 命令名称
  description: string;      // 命令描述
  enabled: boolean;         // 是否启用
  working_dir?: string;     // 工作目录
  timeout?: number;          // 超时时间
}

/**
 * 驼峰转下划线
 * 
 * @param str 驼峰字符串
 * @returns 下划线字符串
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 下划线转驼峰
 * 
 * @param str 下划线字符串
 * @returns 驼峰字符串
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 递归转换对象 key 为驼峰
 * 
 * @param obj 待转换对象
 * @returns 转换后的对象
 */
export function keysToCamel<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamel(item)) as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = keysToCamel(obj[key]);
    }
  }

  return result;
}

/**
 * 递归转换对象 key 为下划线
 * 
 * @param obj 待转换对象
 * @returns 转换后的对象
 */
export function keysToSnake<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnake(item)) as T;
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = keysToSnake(obj[key]);
    }
  }

  return result;
}
