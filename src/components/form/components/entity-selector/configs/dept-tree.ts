/**
 * 部门树工具：部门联动机制的数据基础。
 *
 * - 树数据模块级缓存（TTL 60s），同一页面多次联动不重复请求；
 *   部门数据变更后可调用 invalidateDeptTreeCache() 强制刷新。
 * - pruneTree：按根部门集合裁剪出限定子树（强制限定传入部门）。
 * - collectSubtreeIds：收集限定范围内全部部门 id（含各级子部门），
 *   供职位 / 用户等按 dept_id 过滤与已选值强校验使用。
 */
import { DeptService } from '#/api/system/dept';

export interface DeptTreeNode {
  [key: string]: any;
  id: number | string;
  pid?: number | string;
  name?: string;
  code?: string;
  children?: DeptTreeNode[];
}

const DEPT_TREE_TTL = 60_000;

let deptTreeCache: { at: number; data: DeptTreeNode[] } | null = null;

/** 加载部门树（带 TTL 缓存）；force 为 true 时绕过缓存强制刷新 */
export async function loadDeptTree(force = false): Promise<DeptTreeNode[]> {
  if (!force && deptTreeCache && Date.now() - deptTreeCache.at < DEPT_TREE_TTL) {
    return deptTreeCache.data;
  }
  const res = (await DeptService.getTree()) as any;
  const data = (Array.isArray(res) ? res : (res?.data ?? [])) as DeptTreeNode[];
  deptTreeCache = { at: Date.now(), data };
  return data;
}

/** 使部门树缓存失效（部门数据变更后调用，下次联动取最新树） */
export function invalidateDeptTreeCache() {
  deptTreeCache = null;
}

/** 按 id 查找部门节点（含所有子孙层级） */
export function findDeptNode(
  nodes: DeptTreeNode[],
  id: string,
): DeptTreeNode | null {
  return findNode(nodes, id);
}

function findNode(nodes: DeptTreeNode[], id: string): DeptTreeNode | null {
  for (const node of nodes) {
    if (String(node.id) === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function collectIds(node: DeptTreeNode, into: Set<string>) {
  into.add(String(node.id));
  node.children?.forEach((child) => collectIds(child, into));
}

/**
 * 收集限定范围内全部部门 id（含传入根与各级子部门）。
 * 根 id 在树中不存在时原样保留（避免误删，交由后端过滤兜底）。
 */
export function collectSubtreeIds(
  nodes: DeptTreeNode[],
  rootIds: string[],
): string[] {
  const ids = new Set<string>();
  for (const rootId of rootIds) {
    const node = findNode(nodes, rootId);
    if (node) {
      collectIds(node, ids);
    } else {
      ids.add(rootId);
    }
  }
  return [...ids];
}

/** 按根部门集合裁剪树：仅保留以任一根部门为祖先的节点 */
export function pruneTree(
  nodes: DeptTreeNode[],
  rootIds: string[],
): DeptTreeNode[] {
  const wanted = new Set(rootIds.map(String));
  const walk = (list: DeptTreeNode[]): DeptTreeNode[] => {
    const result: DeptTreeNode[] = [];
    for (const node of list) {
      if (wanted.has(String(node.id))) {
        result.push(node);
      } else if (node.children?.length) {
        const children = walk(node.children);
        if (children.length > 0) {
          result.push({ ...node, children });
        }
      }
    }
    return result;
  };
  return walk(nodes);
}

/** 树展平为可选行：附加 _depth 层级（用于列缩进渲染） */
export function flattenTree(
  nodes: DeptTreeNode[],
  depth = 0,
): Array<DeptTreeNode & { _depth: number }> {
  const rows: Array<DeptTreeNode & { _depth: number }> = [];
  for (const node of nodes) {
    rows.push({ ...node, _depth: depth });
    if (node.children?.length) {
      rows.push(...flattenTree(node.children, depth + 1));
    }
  }
  return rows;
}

/** 缩进渲染部门名称（层级可视化） */
export function indentName(row: any): string {
  const depth = Number(row?._depth ?? 0);
  return `${'　'.repeat(depth)}${row?.name ?? ''}`;
}
