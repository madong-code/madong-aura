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

import { HelpCircle } from 'lucide-vue-next';

import { useSimpleLocale } from '#/core/composables';
import { cn } from '#/core/shared/utils';

interface Props extends DrawerProps {
  drawerApi?: ExtendedDrawerApi;
}

const props = defineProps<Props>();

const { $t } = useSimpleLocale();

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

const drawerClass = computed(() =>
  String(mergedClass.value ?? '')
    .replace(/(?:^|\s)[wh]-\[[^\]]+\]/g, ' ')
    .replace(/\b[wh]-full\b/g, ' ')
    .trim(),
);

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
    </template>

    <div
      v-loading="Boolean(mergedState.loading || mergedState.submitting)"
      :class="['vben-drawer__content', mergedState.contentClass]"
    >
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
