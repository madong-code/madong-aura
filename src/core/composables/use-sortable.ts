/**
 * Sortable 拖拽组合式函数
 *
 * 供插件（report 模板设计器等）使用：包装 sortablejs 的初始化与生命周期，
 * 统一「传入目标元素 + 配置 → 异步初始化 → 拿到实例（option/destroy）」的契约。
 *
 * 用法：
 *   const { initializeSortable } = useSortable(el, { group: {...}, animation: 150 });
 *   let sortable: Sortable | null = await initializeSortable();
 *   sortable?.option('disabled', true);
 *   sortable?.destroy();
 */
import type { Sortable, SortableOptions } from 'sortablejs';

import { nextTick } from 'vue';

export type { Sortable, SortableOptions };

/** 初始化前的等待 tick 数：等待目标元素所在渲染批次完成 */
async function waitForElement(
  el: HTMLElement | null | undefined,
): Promise<HTMLElement> {
  // 最多等待数帧，避免父组件 onMounted 时子节点尚未挂载
  for (let i = 0; i < 10; i++) {
    if (el) return el;
    await nextTick();
  }
  throw new Error(
    '[useSortable] 目标元素不存在，请在元素挂载后再调用 initializeSortable()',
  );
}

export function useSortable(
  target: HTMLElement | null | undefined,
  options: SortableOptions,
) {
  let instance: Sortable | null = null;

  /**
   * 初始化 sortable 实例（幂等：重复调用返回已有实例）
   * 动态引入 sortablejs 以延迟加载拖拽能力
   */
  async function initializeSortable(): Promise<Sortable> {
    if (instance) return instance;
    const el = await waitForElement(target);
    const { default: SortableCtor } = await import('sortablejs');
    instance = new SortableCtor(el, options);
    return instance;
  }

  /** 销毁实例（调用方 onBeforeUnmount 时使用） */
  function destroy(): void {
    instance?.destroy();
    instance = null;
  }

  return { initializeSortable, destroy };
}
