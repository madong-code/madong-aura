/**
 * 正文型内容图片签名（私有云存储）
 *
 * 富文本 HTML / Markdown 渲染结果里的图片地址无法在模板层交给 buildStaticUrl 处理，
 * 只能在渲染完成后扫描容器内的 img，统一换取签名地址后回写 src。
 * 容器重渲染（列表翻页、抽屉重开）把 src 还原成原始 key 时，由 MutationObserver 自动补签。
 *
 * 公开空间下不做任何处理（内部直接返回）。
 */

import type { Ref, WatchSource } from 'vue';

import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';

import { signContentImages } from './private-storage';

/** 需要补签的图片属性变化：仅监听 src，避免正文输入频繁触发 */
const OBSERVE_OPTIONS: MutationObserverInit = {
  attributes: true,
  attributeFilter: ['src'],
  childList: true,
  subtree: true,
};

/**
 * 为内容容器挂载「图片签名」能力
 *
 * @param rootRef 内容容器引用；容器可能因 v-if / destroy-on-close 延迟出现，内部会监听其变化
 * @param source 可选的数据源，变化后重新扫描（例如详情数据、弹窗开关）
 * @returns sync 手动触发一次扫描
 */
export function useContentImagesSigner(
  rootRef: Ref<Element | null | undefined>,
  source?: WatchSource,
) {
  let observer: MutationObserver | null = null;

  /** 渲染完成后扫描容器内图片，换取签名地址回写 */
  const sync = async () => {
    await nextTick();
    void signContentImages(rootRef.value);
  };

  /** 容器可用时开始监听（容器不存在则等待其出现） */
  const attach = () => {
    observer?.disconnect();
    observer = null;

    const root = rootRef.value;
    if (!root) return;

    void sync();
    observer = new MutationObserver(() => {
      void sync();
    });
    observer.observe(root, OBSERVE_OPTIONS);
  };

  watch(rootRef, attach, { flush: 'post' });
  if (source) {
    watch(source, () => void sync(), { flush: 'post' });
  }

  onMounted(attach);
  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { sync };
}