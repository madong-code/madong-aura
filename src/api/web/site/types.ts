/** 站点设置（sys_config web_site_setting 的本页 14 键，存储键名；web 前台门户专用行，与 ERP 的 site_setting 分离） */
export interface WebSiteConfig {
  /** web 前台站点开关：0 关闭（前台展示「站点已关闭」） 1 开启 */
  site_open: 0 | 1
  /** web 前台站点URL：留空自动取当前访问域名 */
  site_url: string
  site_name: string
  site_logo: string
  /** 赞助/合作联系邮箱（前台「成为赞助商」页展示） */
  contact_email: string
  /** 版权文案：留空前台按 © {year} {site} · 版权所有 拼装 */
  site_copyright: string
  site_record_no: string
  site_icp_url: string
  site_network_security: string
  site_network_security_url: string
  /** 申请友链入口 */
  show_apply: boolean
  /** 技术支持入口 */
  show_powered: boolean
  tongji_enabled: boolean
  tongji_key: string
}
