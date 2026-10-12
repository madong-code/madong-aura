import menuSeed from './menu-seed.json';

/** 原始菜单行（对齐 backend admin_menu 表字段，snake_case） */
export interface MenuRow {
  id: number;
  pid: number;
  app: string;
  title: string;
  code: string | null;
  level: number | null;
  type: number;
  sort: number;
  path: string;
  component: string | null;
  redirect: string | null;
  icon: string | null;
  is_show: number;
  is_link: number;
  link_url: string | null;
  enabled: number;
  open_type: number | string;
  is_cache: number;
  is_tab: number;
  is_sync: number;
  is_affix: number;
  methods: string | null;
  is_frame: number;
  variable: string | null;
  source: string | null;
  show_text_badge: string | null;
  created_at: string;
  updated_at: string;
  children?: MenuRow[];
}

/** vben 前端路由格式（复刻 MenuFormattingListener::formatForVben 输出） */
export interface VbenMenuNode {
  id: number;
  pid: number;
  path: string;
  name: string;
  component: string | null;
  redirect: string;
  icon: string | null;
  order: number;
  activeIcon: null;
  disabled: boolean;
  query: null;
  meta: Record<string, any>;
  badge?: string;
  badge_type?: string;
  badge_variants?: string;
  children?: VbenMenuNode[];
}

/** 从路径生成 PascalCase 路由名（复刻 menuNameFromPath） */
function menuNameFromPath(path: string): string {
  const trimmed = (path ?? '').replace(/^\/+|\/+$/g, '');
  if (!trimmed) return 'Root';
  return trimmed
    .split('/')
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join('');
}

/** 将种子树拍平并分配 id/pid（先根遍历，id 从 1 递增） */
function flatten(): { rows: MenuRow[]; tree: MenuRow[] } {
  const rows: MenuRow[] = [];
  let next = 1;

  const walk = (nodes: any[], pid: number): MenuRow[] => {
    const tree: MenuRow[] = [];
    for (const node of nodes) {
      const id = next++;
      const row: MenuRow = {
        id,
        pid,
        app: node.app ?? 'admin',
        title: node.title,
        code: node.code ?? null,
        level: node.level ?? null,
        type: node.type,
        sort: node.sort ?? 0,
        path: node.path,
        component: node.component ?? null,
        redirect: node.redirect ?? null,
        icon: node.icon ?? null,
        is_show: node.is_show ?? 1,
        is_link: node.is_link ?? 0,
        link_url: node.link_url ?? null,
        enabled: node.enabled ?? 1,
        open_type: node.open_type ?? 0,
        is_cache: node.is_cache ?? 0,
        is_tab: node.is_tab ?? 1,
        is_sync: node.is_sync ?? 1,
        is_affix: node.is_affix ?? 0,
        methods: node.methods ?? null,
        is_frame: node.is_frame ?? 0,
        variable: node.variable ?? null,
        source: node.source ?? null,
        show_text_badge: node.show_text_badge ?? null,
        created_at: '2026-01-01 00:00:00',
        updated_at: '2026-01-01 00:00:00',
      };
      rows.push(row);
      const children = node.children?.length ? walk(node.children, id) : [];
      if (children.length) row.children = children;
      tree.push(row);
    }
    return tree;
  };

  const tree = walk(menuSeed as any[], 0);
  return { rows, tree };
}

const { rows: MENU_ROWS, tree: MENU_TREE } = flatten();

export { MENU_ROWS, MENU_TREE };

/** 原始行树（菜单管理/树选择器用） */
export function buildMenuTree(): MenuRow[] {
  return MENU_TREE;
}

/** 全量权限码（超管语义：所有非空 code 去重 + 前端页面依赖的固定权限码） */
const EXTRA_PERM_CODES = [
  'system:auth:save_role_menu', // 菜单管理"选择权限"（路由定义绑定）
];

export const PERM_CODES: string[] = [
  ...new Set([
    ...MENU_ROWS.map((r) => r.code).filter((c): c is string => Boolean(c)),
    ...EXTRA_PERM_CODES,
  ]),
];

/**
 * 菜单行树 → vben 节点树
 * 过滤 type 3/4（外链/按钮不进路由菜单），递归格式化
 */
function formatMenuTree(rows: MenuRow[]): VbenMenuNode[] {
  return rows
    .filter((n) => n.type !== 3 && n.type !== 4)
    .map((node) => {
      const result = formatMenuNode(node);
      const children = formatMenuTree(node.children ?? []);
      if (children.length) result.children = children;
      return result;
    });
}

/** 单个菜单行 → vben 节点（复刻后端 formatForVben） */
function formatMenuNode(node: MenuRow): VbenMenuNode {
  const result: VbenMenuNode = {
    id: node.id,
    pid: node.pid,
    path: node.path,
    name: node.code || menuNameFromPath(node.path),
    component: node.component,
    redirect: node.redirect ?? '',
    icon: node.icon ?? null,
    order: node.sort ?? 0,
    activeIcon: null,
    disabled: false,
    query: null,
    meta: {
      title: node.title,
      icon: node.icon ?? null,
      order: node.sort ?? 0,
      hideInMenu: !node.is_show,
      hideInTab: !(node.is_tab ?? true),
      affixTab: node.is_affix ?? false,
      authority: node.variable ? node.variable.split(',') : [],
      keepAlive: node.is_cache ?? false,
      link: node.type === 6 ? node.link_url : null,
      iframeSrc: node.is_frame ? node.link_url : null,
      openInNewWindow: node.open_type === '_blank',
    },
  };

  if (node.show_text_badge) {
    result.badge = node.show_text_badge;
    result.badge_type = 'normal';
    result.badge_variants = 'default';
  }

  // 插件菜单 module 注入（source='plugin:xxx' 或 component 以 /plugin/ 开头）
  let module = '';
  if (node.source?.startsWith('plugin:')) {
    module = node.source.slice('plugin:'.length);
  } else if (node.component?.startsWith('/plugin/')) {
    module = node.component.replace(/^\/+|\/+$/g, '').split('/')[1] ?? '';
  }
  if (module) result.meta.module = module;

  return result;
}

/** 复刻 formatForVben：全量菜单输出 vben 路由格式树（超管） */
export function vbenMenus(): VbenMenuNode[] {
  return formatMenuTree(MENU_TREE);
}

/**
 * 按授权菜单 id 集合剪枝（普通用户）：
 * - 命中节点或其任一后代命中授权时保留，保证目录祖先链完整
 * - 按钮型（type 3）不进路由树，但其 code 仍计入权限码
 */
function pruneMenuTree(rows: MenuRow[], ids: Set<number>): MenuRow[] {
  const result: MenuRow[] = [];
  for (const node of rows) {
    const children = node.children ? pruneMenuTree(node.children, ids) : [];
    if (ids.has(node.id) || children.length) {
      result.push({ ...node, children });
    }
  }
  return result;
}

/** 按授权菜单 id 输出 vben 菜单树 */
export function vbenMenusForMenuIds(ids: Set<number>): VbenMenuNode[] {
  return formatMenuTree(pruneMenuTree(MENU_TREE, ids));
}

/** 按授权菜单 id 收集权限码（含按钮型节点 code，去重） */
export function permCodesForMenuIds(ids: Set<number>): string[] {
  return [
    ...new Set(
      MENU_ROWS.filter((r) => ids.has(r.id))
        .map((r) => r.code)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
}
