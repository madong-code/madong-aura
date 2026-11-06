<!--
  VbenDrawer 垫片实现（Element Plus ElDrawer）
  契约对齐 vben：drawerApi、slots(default/footer/prepend-footer/...)、
  placement(right/left/top/bottom)、class="w-[60%]" 宽度、lock 提交锁。
-->
<script setup lang="ts">
import type { DrawerPlacement, DrawerProps } from './drawer';

import type { ExtendedDrawerApi } from './drawer';

import {
  computed,
  getCurrentInstance,
  onDeactivated,
  useAttrs,
} from 'vue';

import { useMediaQuery } from '@vueuse/core';
import { Expand, HelpCircle, Shrink } from 'lucide-vue-next';

import { useSimpleLocale } from '#/core/composables';
import { cn } from '#/core/shared/utils';

interface Props extends DrawerProps {
  drawerApi?: ExtendedDrawerApi;
}

const props = defineProps<Props>();

const { $t } = useSimpleLocale();
/** 与 VbenModal 使用同一断点：移动端抽屉强制全屏且不提供切换入口 */
const isMobile = useMediaQuery('(max-width: 768px)');

const state = props.drawerApi?.useStore?.();

/**
 * vben 契约：模板上【显式传入】的 props（title/footer=false/class...）优先级
 * 高于 api store 初始值。
 * 注意不能遍历 defineProps 的结果：Vue 对 Boolean 类型 props 会把「未传」
 * 强制转成 false，导致 header/modal/footer/closable 等未传时覆盖掉 state
 * 的 true 默认值（表现为标题栏/遮罩/按钮全部消失）。
 * vnode.props 只包含模板上真正写出的属性，是判断「是否显式传入」的唯一
 * 可靠来源。
 */
const instance = getCurrentInstance();
const mergedState = computed<Record<string, any>>(() => {
  const rawProps = instance?.vnode.props ?? {};
  const overrides: Record<string, any> = {};
  for (const key of Object.keys(rawProps)) {
    if (key === 'drawerApi' || key.startsWith('on')) continue;
    overrides[key] = rawProps[key] as unknown;
  }
  return { ...state?.value, ...overrides };
});

/** 移动端强制全屏；桌面端由 drawerApi.setState({ fullscreen }) 控制 */
const shouldFullscreen = computed(
  () => (mergedState.value.fullscreen ?? false) || isMobile.value,
);

/** core 默认关闭；CRUD 表单抽屉显式开启；移动端隐藏全部切换按钮 */
const shouldShowFullscreenButton = computed(
  () => mergedState.value.fullscreenButton === true && !isMobile.value,
);

function handleFullscreen() {
  props.drawerApi?.setState((prev) => ({
    ...prev,
    fullscreen: !prev.fullscreen,
  }));
}

const directionMap: Record<DrawerPlacement, 'btt' | 'ltr' | 'rtl' | 'ttb'> = {
  bottom: 'btt',
  left: 'ltr',
  right: 'rtl',
  top: 'ttb',
};

const direction = computed(
  () =>
    directionMap[(mergedState.value.placement as DrawerPlacement) ?? 'right'],
);

/**
 * vben 用 class="w-[600px]/w-[60%]" 控制抽屉宽度（上下方向用 h-[...]）。
 * 模板 class 经 mergedState 合并后解析；w-full 映射为 100%。
 */
const attrs = useAttrs();

const mergedClass = computed(() =>
  cn(mergedState.value.class, attrs.class),
);

const drawerSize = computed(() => {
  // ElDrawer 无 fullscreen prop，全屏通过 size=100% 实现（上下方向为高度）
  if (shouldFullscreen.value) return '100%';
  const raw = String(mergedClass.value ?? '');
  const vertical = direction.value === 'ttb' || direction.value === 'btt';
  // 仅匹配独立的 w-[..]/h-[..]，排除 max-w-[..]、min-h-[..] 等限制类
  const sizeRe = vertical
    ? /(?:^|\s)h-\[([^\]]+)\]/
    : /(?:^|\s)w-\[([^\]]+)\]/;
  const matched = raw.match(sizeRe)?.[1];
  if (matched) return matched;
  const fullRe = vertical ? /\bh-full\b/ : /\bw-full\b/;
  if (fullRe.test(raw)) return '100%';
  return undefined;
});

const drawerClass = computed(() => {
  let cls = String(mergedClass.value ?? '')
    .replace(/(?:^|\s)[wh]-\[[^\]]+\]/g, ' ')
    .replace(/\b[wh]-full\b/g, ' ');
  // 全屏时必须清掉 max-w-[85vw] 之类的上限，否则 size=100% 仍被截断
  if (shouldFullscreen.value) {
    cls = cls.replace(/\bmax-[wh]-\[[^\]]+\]/g, ' ');
  }
  return cls.trim();
});

function handleUpdateModelValue(value: boolean) {
  if (!value && !state?.value.submitting) {
    props.drawerApi?.close();
  }
}

onDeactivated(() => {
  if (!state?.value.appendToMain) {
    props.drawerApi?.close();
  }
});
</script>

<template>
  <ElDrawer
    :model-value="mergedState.isOpen"
    :direction="direction"
    :size="drawerSize"
    :modal="mergedState.modal"
    :append-to-body="mergedState.appendToMain"
    :with-header="mergedState.header !== false"
    :show-close="
      (mergedState.closable !== false) && (mergedState.header !== false)
    "
    :close-on-click-modal="
      (mergedState.closeOnClickModal ?? true) && !mergedState.submitting
    "
    :close-on-press-escape="
      (mergedState.closeOnPressEscape ?? true) && !mergedState.submitting
    "
    :destroy-on-close="mergedState.destroyOnClose"
    :z-index="mergedState.zIndex"
    :class="['vben-drawer', drawerClass]"
    @update:model-value="handleUpdateModelValue"
    @opened="props.drawerApi?.onOpened()"
    @closed="props.drawerApi?.onClosed()"
  >
    <template #header>
      <div :class="['vben-drawer__header', mergedState.headerClass]">
        <div class="vben-drawer__header-main">
          <slot name="title">
            <span class="vben-drawer__title">{{ mergedState.title }}</span>
            <ElTooltip
              v-if="mergedState.titleTooltip"
              :content="mergedState.titleTooltip"
              placement="top"
            >
              <HelpCircle class="ml-1 inline-block size-3.5 cursor-help align-text-bottom opacity-60" />
            </ElTooltip>
          </slot>
          <div v-if="mergedState.description" class="vben-drawer__description">
            <slot name="description">{{ mergedState.description }}</slot>
          </div>
        </div>
        <div v-if="shouldShowFullscreenButton" class="vben-drawer__header-actions">
          <button
            type="button"
            class="vben-drawer__icon-btn"
            @click="handleFullscreen"
          >
            <Shrink v-if="shouldFullscreen" class="size-[16px]" />
            <Expand v-else class="size-[16px]" />
          </button>
        </div>
      </div>
    </template>

    <div
      v-loading="Boolean(mergedState.loading || mergedState.submitting)"
      :class="['vben-drawer__content', mergedState.contentClass]"
    >
      <!-- header=false 时 ElDrawer 不渲染 #header，切换按钮需落在内容层 -->
      <button
        v-if="mergedState.header === false && shouldShowFullscreenButton"
        type="button"
        class="vben-drawer__icon-btn vben-drawer__fullscreen-fallback"
        @click="handleFullscreen"
      >
        <Shrink v-if="shouldFullscreen" class="size-[16px]" />
        <Expand v-else class="size-[16px]" />
      </button>
      <slot></slot>
    </div>

    <template #footer>
      <div
        v-if="mergedState.footer"
        :class="['vben-drawer__footer', mergedState.footerClass]"
      >
        <slot name="prepend-footer"></slot>
        <slot name="footer">
          <ElButton
            v-if="mergedState.showCancelButton !== false"
            class="vben-drawer__cancel-btn"
            :disabled="mergedState.submitting"
            @click="props.drawerApi?.onCancel()"
          >
            <slot name="cancelText">
              {{ mergedState.cancelText || $t('cancel') }}
            </slot>
          </ElButton>
          <slot name="center-footer"></slot>
          <ElButton
            v-if="mergedState.showConfirmButton !== false"
            type="primary"
            :loading="mergedState.confirmLoading || mergedState.submitting"
            @click="props.drawerApi?.onConfirm()"
          >
            <slot name="confirmText">
              {{ mergedState.confirmText || $t('confirm') }}
            </slot>
          </ElButton>
        </slot>
        <slot name="append-footer"></slot>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped>
  .vben-drawer__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .vben-drawer__header-main {
    min-width: 0;
  }

  .vben-drawer__header-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    /* 与弹窗右上角两按钮间距对齐：10px 使图标视觉空白约 22px，接近 Modal 的 20.75px */
    margin-right: 10px;
  }

  /* 与 close 按钮统一：无背景、同色；hover 背景与 VbenModal 保持一致 */
  .vben-drawer__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    padding: 0;
    color: var(--el-text-color-primary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition:
      color 0.2s,
      background-color 0.2s;
  }

  .vben-drawer__icon-btn:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  /* 取消按钮与 close 一致：默认无背景、无边框 */
  .vben-drawer__cancel-btn,
  .vben-drawer__cancel-btn:hover,
  .vben-drawer__cancel-btn:focus {
    color: var(--el-text-color-primary);
    background: transparent;
    border-color: transparent;
  }

  .vben-drawer__cancel-btn:hover,
  .vben-drawer__cancel-btn:focus {
    color: var(--el-color-primary);
  }

  .vben-drawer__fullscreen-fallback {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
  }

  .vben-drawer__title {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .vben-drawer__description {
    flex-basis: 100%;
    margin-top: 4px;
    font-size: 13px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .vben-drawer__content {
    /* 撑满 ElDrawer body，保证内部 h-full 高度链可解析（如消息中心表格） */
    position: relative;
    height: 100%;
    min-height: 60px;
  }

  .vben-drawer__footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
</style>

<style>
  /* ElDrawer 内置 close 由组件内部渲染，不携带本文件的 scoped 属性，
     故用非 scoped 规则并以 .vben-drawer 限定作用域，只影响本垫片的抽屉 */
  .vben-drawer .el-drawer__close-btn {
    display: inline-flex;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: var(--el-text-color-primary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    outline: none;
    transition:
      color 0.2s,
      background-color 0.2s;
  }

  .vben-drawer .el-drawer__close-btn:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }
</style>
