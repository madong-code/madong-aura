<!--
  VbenModal 垫片实现（Element Plus ElDialog）
  契约对齐 vben：modalApi(useStore/open/close/setState/lock/setData...)、
  slots(default/footer/prepend-footer/append-footer/center-footer/title)、
  onOpened/onClosed 生命周期。
-->
<script setup lang="ts">
import type { ModalProps } from './modal';

import type { ExtendedModalApi } from './modal';

import { computed, getCurrentInstance, onDeactivated } from 'vue';

import { useMediaQuery } from '@vueuse/core';
import { Expand, HelpCircle, Shrink, X } from 'lucide-vue-next';

import { useSimpleLocale } from '#/core/composables';

interface Props extends ModalProps {
  modalApi?: ExtendedModalApi;
}

const props = defineProps<Props>();

const { $t } = useSimpleLocale();
const isMobile = useMediaQuery('(max-width: 768px)');

const state = props.modalApi?.useStore?.();

/**
 * vben 契约：模板上【显式传入】的 props（title/footer=false/class...）优先级
 * 高于 api store 初始值。
 * 不能遍历 defineProps 结果：Vue 对 Boolean props 会把「未传」转成 false，
 * 未传的 header/footer/fullscreenButton/closable 等会覆盖掉 state 的 true
 * 默认值（标题栏、遮罩、按钮集体消失）。vnode.props 只含模板真正写出的
 * 属性，是「是否显式传入」的可靠来源。
 */
const instance = getCurrentInstance();
const mergedState = computed<Record<string, any>>(() => {
  const rawProps = instance?.vnode.props ?? {};
  const overrides: Record<string, any> = {};
  for (const key of Object.keys(rawProps)) {
    if (key === 'modalApi' || key.startsWith('on')) continue;
    overrides[key] = rawProps[key] as unknown;
  }
  return { ...state?.value, ...overrides };
});

const shouldFullscreen = computed(
  () => (mergedState.value.fullscreen ?? false) || isMobile.value,
);

/** vben 用 class="w-[800px]/w-[60%]" 控制宽度，映射到 ElDialog width */
const dialogWidth = computed(() => {
  const raw = String(mergedState.value.class ?? '');
  return raw.match(/(?:^|\s)w-\[([^\]]+)\]/)?.[1];
});

const dialogClass = computed(() =>
  String(mergedState.value.class ?? '')
    .replace(/(?:^|\s)w-\[[^\]]+\]/g, ' ')
    .trim(),
);

/** 宽度类已映射到 ElDialog width，避免内容区再套宽度类被缩成一半 */
const contentClass = computed(() =>
  String(mergedState.value.contentClass ?? '')
    .replace(/(?:^|\s)w-\[[^\]]+\]/g, ' ')
    .replace(/\bw-full\b/g, ' ')
    .trim(),
);

function handleFullscreen() {
  props.modalApi?.setState((prev) => ({ ...prev, fullscreen: !prev.fullscreen }));
}

function handleUpdateModelValue(value: boolean) {
  if (!value && !state?.value.submitting) {
    props.modalApi?.close();
  }
}

onDeactivated(() => {
  if (!state?.value.appendToMain) {
    props.modalApi?.close();
  }
});
</script>

<template>
  <ElDialog
    :model-value="mergedState.isOpen"
    :width="shouldFullscreen ? '100%' : dialogWidth"
    :fullscreen="shouldFullscreen"
    :align-center="mergedState.centered"
    :draggable="mergedState.draggable"
    :modal="mergedState.modal"
    :append-to-body="mergedState.appendToMain"
    :close-on-click-modal="
      (mergedState.closeOnClickModal ?? true) && !mergedState.submitting
    "
    :close-on-press-escape="
      (mergedState.closeOnPressEscape ?? true) && !mergedState.submitting
    "
    :show-close="false"
    :destroy-on-close="mergedState.destroyOnClose"
    :z-index="mergedState.zIndex"
    :class="['vben-modal', dialogClass]"
    class="vben-modal-root"
    @update:model-value="handleUpdateModelValue"
    @opened="props.modalApi?.onOpened()"
    @closed="props.modalApi?.onClosed()"
  >
    <template #header>
      <div
        v-if="mergedState.header !== false"
        :class="['vben-modal__header', mergedState.headerClass]"
      >
        <div class="vben-modal__header-main">
          <slot name="title">
            <span class="vben-modal__title">{{ mergedState.title }}</span>
            <ElTooltip
              v-if="mergedState.titleTooltip"
              :content="mergedState.titleTooltip"
              placement="top"
            >
              <HelpCircle class="ml-1 inline-block size-3.5 cursor-help align-text-bottom opacity-60%" />
            </ElTooltip>
          </slot>
          <div v-if="mergedState.description" class="vben-modal__description">
            <slot name="description">{{ mergedState.description }}</slot>
          </div>
        </div>
        <div class="vben-modal__header-actions">
          <button
            v-if="mergedState.fullscreenButton !== false && !isMobile"
            type="button"
            class="vben-modal__icon-btn"
            :title="mergedState.fullscreen ? $t('common.cancelFullscreen') : $t('common.fullscreen')"
            @click="handleFullscreen"
          >
            <Shrink v-if="mergedState.fullscreen" class="size-[18px]" />
            <Expand v-else class="size-[18px]" />
          </button>
          <button
            v-if="mergedState.closable !== false"
            type="button"
            class="vben-modal__icon-btn"
            :title="$t('common.close')"
            @click="handleUpdateModelValue(false)"
          >
            <X class="size-[18px]" />
          </button>
        </div>
      </div>
    </template>

    <div
      v-loading="Boolean(mergedState.loading || mergedState.submitting)"
      :class="['vben-modal__content', contentClass]"
    >
      <slot></slot>
    </div>

    <template #footer>
      <div
        v-if="mergedState.footer"
        :class="['vben-modal__footer', mergedState.footerClass]"
      >
        <slot name="prepend-footer"></slot>
        <slot name="footer">
          <ElButton
            v-if="mergedState.showCancelButton !== false"
            :disabled="mergedState.submitting"
            @click="props.modalApi?.onCancel()"
          >
            <slot name="cancelText">
              {{ mergedState.cancelText || $t('cancel') }}
            </slot>
          </ElButton>
          <slot name="center-footer"></slot>
          <ElButton
            v-if="mergedState.showConfirmButton !== false"
            type="primary"
            :disabled="mergedState.confirmDisabled"
            :loading="mergedState.confirmLoading || mergedState.submitting"
            @click="props.modalApi?.onConfirm()"
          >
            <slot name="confirmText">
              {{ mergedState.confirmText || $t('confirm') }}
            </slot>
          </ElButton>
        </slot>
        <slot name="append-footer"></slot>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
  .vben-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-right: 0;
  }

  .vben-modal__header-main {
    min-width: 0;
  }

  .vben-modal__header-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    margin-top: -2px;
    margin-right: -2px;
  }

  .vben-modal__title {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .vben-modal__description {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .vben-modal__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition:
      color 0.2s,
      background-color 0.2s;
  }

  .vben-modal__icon-btn:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  .vben-modal__content {
    min-height: 60px;
  }

  .vben-modal__footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
