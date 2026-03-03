export interface PluginDevelopRow {
  /** 作者 */
  author: string;
  /** 版本号 */
  version: string;
  /** 封面 */
  cover: string;
  /** 更新时间 */
  updated_at: number;
  /** 主键 */
  id: number;
  /** 插件标识 */
  key: string;
  /** 插件描述 */
  desc: string;
  /** 插件支持的应用空表示通用插件 */
  support_app: string;
  /** 安装时间 */
  installed_at: number;
  /** 插件名称 */
  title: string;
  /** 插件图标 */
  icon: string;
  /** 状态 */
  status: number;
  /** 插件类型app，plugin */
  type: string;
  /** 创建时间 */
  created_at: number;
  variables: string;

}