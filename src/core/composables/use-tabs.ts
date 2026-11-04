/**
 * 工作标签页操作组合式函数
 *
 * 供插件页面（如 codegen 生成器保存后）关闭当前标签页并回落到相邻标签/首页。
 * 底层复用 worktab store 的 removeTab（内部已处理关闭后的导航与 keepAlive 缓存清理）。
 */
import { useWorktabStore } from '@/store/modules/worktab';

export function useTabs() {
  const worktabStore = useWorktabStore();

  /** 关闭当前激活的标签页（内部已自动跳转到相邻标签或首页） */
  function closeCurrentTab(): void {
    const path = worktabStore.current?.path;
    if (path) {
      worktabStore.removeTab(path);
    }
  }

  return { closeCurrentTab };
}
