/**
 * 角色选择器配置（传参模式实测样例）。
 *
 * 独立配置文件 + defineEntityConfig 声明（配置复用机制）：
 * - fetcher / hydrate 使用字符串 API 路径（推荐形态，标准 CRUD 契约），
 *   组件边界 resolveEntityApi 自动归一化；
 * - 用户表单 schema 中整体传入 componentProps.config（传参模式），
 *   与内置 role 注册配置按「注册 < 注入」深合并，无需 registerEntityPickerConfig 预注册。
 */
import { defineEntityConfig } from '#/components/form/components/entity-selector';

export const roleSelectorConfig = defineEntityConfig({
  type: 'role',
  title: '选择角色',
  placeholder: '选择角色',
  rowKey: 'id',
  labelOf: (row) => String(row?.name ?? row?.id ?? ''),
  columns: [
    { field: 'name', title: '角色名称', minWidth: 160, align: 'left' },
    { field: 'code', title: '角色编码', width: 160, align: 'left' },
  ],
  searchFields: [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
  ],
  // 多字段搜索（传参模式演示）：名称/编码独立输入，非空条件 AND 下发
  searchMode: 'multi',
  // 字符串 API 路径（推荐形态）：列表请求自动携带 { page, limit, LIKE_<field> }，
  // 响应 { items, total }
  fetcher: '/system/role',
  // 详情路径模板（推荐形态）：编辑回显 / 只读详情反查 id → 名称，':id' 占位替换
  hydrate: '/system/role/:id',
});
