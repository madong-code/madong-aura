<script lang="ts" setup>
import type { DrawerProps, ExtendedDrawerApi } from './drawer';

import {
  computed,
  onDeactivated,
  provide,
  ref,
  unref,
  useId,
  watch,
} from 'vue';

import {
  useIsMobile,
  usePriorityValues,
  useSimpleLocale,
} from '#/core/composables';
import { X } from '#/core/design/icons/base';
import { ELEMENT_ID_MAIN_CONTENT } from '#/core/shared/constants';
import { globalShareState } from '#/core/shared/global-state';
import { cn } from '#/core/shared/utils';
import {
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  VbenButton,
  VbenHelpTooltip,
  VbenIconButton,
  VbenLoading,
  VisuallyHidden,
} from '#/core/ui/primitives';

interface Props extends DrawerProps {
  drawerApi?: ExtendedDrawerApi;
}

const props = withDefaults(defineProps<Props>(), {
  appendToMain: false,
  closeIconPlacement: 'right',
  destroyOnClose: false,
  drawerApi: undefined,
  submitting: false,
  zIndex: 1000,
});

const components = globalShareState.getComponents();

const id = useId();
provide('DISMISSABLE_DRAWER_ID', id);

// @ts-expect-error unused
const wrapperRef = ref<HTMLElement>();
const { $t } = useSimpleLocale();
const { isMobile } = useIsMobile();

const state = props.drawerApi?.useStore?.();

const {
  appendToMain,
  cancelText,
  class: drawerClass,
  closable,
  closeIconPlacement,
  closeOnClickModal,
  closeOnPressEscape,
  confirmLoading,
  confirmText,
  contentClass,
  description,
  destroyOnClose,
  footer: showFooter,
  footerClass,
  header: showHeader,
  headerClass,
  loading: showLoading,
  modal,
  openAutoFocus,
  overlayBlur,
  placement,
  showCancelButton,
  showConfirmButton,
  submitting,
  title,
  titleTooltip,
  zIndex,
} = usePriorityValues(props, state);

// watch(
//   () => showLoading.value,
//   (v) => {
//     if (v && wrapperRef.value) {
//       wrapperRef.value.scrollTo({
//         // behavior: 'smooth',
//         top: 0,
//       });
//     }
//   },
// );

/**
 * 在开启keepAlive情况下 直接通过浏览器按钮/手势等返回 不会关闭弹窗
 */
onDeactivated(() => {
  // 如果弹窗没有被挂载到内容区域，则关闭弹窗
  if (!appendToMain.value) {
    props.drawerApi?.close();
  }
});

function interactOutside(e: Event) {
  if (!closeOnClickModal.value || submitting.value) {
    e.preventDefault();
  }
}
function escapeKeyDown(e: KeyboardEvent) {
  if (!closeOnPressEscape.value || submitting.value) {
    e.preventDefault();
  }
}
// pointer-down-outside
function pointerDownOutside(e: Event) {
  const target = e.target as HTMLElement;
  const dismissableDrawer = target?.dataset.dismissableDrawer;
  if (
    submitting.value ||
    !closeOnClickModal.value ||
    dismissableDrawer !== id
  ) {
    e.preventDefault();
  }
}

function handerOpenAutoFocus(e: Event) {
  if (!openAutoFocus.value) {
    e?.preventDefault();
  }
}

function handleFocusOutside(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

const getAppendTo = computed(() => {
  return appendToMain.value
    ? `#${ELEMENT_ID_MAIN_CONTENT}>div:not(.absolute)>div`
    : undefined;
});

/**
 * destroyOnClose功能完善
 */
// 是否打开过
const hasOpened = ref(false);
const isClosed = ref(true);
// 兜底定时器：当关闭动画事件(@closed/animationend)未触发时，
// 确保 force-mount 残留的内容最终被 hidden 隐藏。
// 背景：art-admin 缺少 tailwindcss-animate，drawer 内容的 data-[state=closed]:animate-out
// 等 CSS 动画未生成，导致 SheetContent 的 onAnimationEnd 永远不触发 @closed，
// isClosed 保持 false、hidden class 不加，抽屉内容残留显示（遮罩已 v-if 移除）。
let closeFallbackTimer: ReturnType<typeof setTimeout> | null = null;
const CLOSE_FALLBACK_MS = 400;
watch(
  () => state?.value?.isOpen,
  (value) => {
    if (closeFallbackTimer) {
      clearTimeout(closeFallbackTimer);
      closeFallbackTimer = null;
    }
    if (value) {
      // 打开：立即显示内容（清除 hidden）
      isClosed.value = false;
      if (!unref(hasOpened)) {
        hasOpened.value = true;
      }
    } else {
      // 关闭：启动兜底定时器。
      // 若 @closed 事件在动画结束时正常触发，handleClosed 会 clearTimeout 并设置 isClosed。
      // 若动画未播放/事件未触发（缺少 tailwindcss-animate 时），定时器兜底设 isClosed=true。
      closeFallbackTimer = setTimeout(() => {
        closeFallbackTimer = null;
        if (!state?.value?.isOpen) {
          isClosed.value = true;
          props.drawerApi?.onClosed();
        }
      }, CLOSE_FALLBACK_MS);
    }
  },
);
function handleClosed() {
  if (closeFallbackTimer) {
    clearTimeout(closeFallbackTimer);
    closeFallbackTimer = null;
  }
  isClosed.value = true;
  props.drawerApi?.onClosed();
}
const getForceMount = computed(() => {
  return !unref(destroyOnClose) && unref(hasOpened);
});
</script>
<template>
  <Sheet
    :modal="false"
    :open="state?.isOpen"
    @update:open="() => drawerApi?.close()"
  >
    <SheetContent
      :append-to="getAppendTo"
      :class="
        cn('flex w-130 flex-col', drawerClass, {
          'w-full!': isMobile || placement === 'bottom' || placement === 'top',
          'max-h-screen': placement === 'bottom' || placement === 'top',
          hidden: isClosed,
        })
      "
      :modal="modal"
      :open="state?.isOpen"
      :side="placement"
      :z-index="zIndex"
      :force-mount="getForceMount"
      :overlay-blur="overlayBlur"
      @close-auto-focus="handleFocusOutside"
      @closed="handleClosed"
      @escape-key-down="escapeKeyDown"
      @focus-outside="handleFocusOutside"
      @interact-outside="interactOutside"
      @open-auto-focus="handerOpenAutoFocus"
      @opened="() => drawerApi?.onOpened()"
      @pointer-down-outside="pointerDownOutside"
    >
      <SheetHeader
        v-if="showHeader"
        :class="
          cn(
            'flex! flex-row items-center justify-between border-b border-border px-6 py-5',
            headerClass,
            {
              'px-4 py-3': closable,
              'pl-2': closable && closeIconPlacement === 'left',
            },
          )
        "
      >
        <div class="flex items-center">
          <SheetClose
            v-if="closable && closeIconPlacement === 'left'"
            as-child
            :disabled="submitting"
            class="ml-0.5 cursor-pointer rounded-full opacity-80 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary"
          >
            <slot name="close-icon">
              <VbenIconButton>
                <X class="size-4" />
              </VbenIconButton>
            </slot>
          </SheetClose>
          <Separator
            v-if="closable && closeIconPlacement === 'left'"
            class="mr-2 ml-1 h-8"
            decorative
            orientation="vertical"
          />
          <SheetTitle v-if="title" class="text-left">
            <slot name="title">
              {{ title }}

              <VbenHelpTooltip v-if="titleTooltip" trigger-class="pb-1">
                {{ titleTooltip }}
              </VbenHelpTooltip>
            </slot>
          </SheetTitle>
          <SheetDescription v-if="description" class="mt-1 text-xs">
            <slot name="description">
              {{ description }}
            </slot>
          </SheetDescription>
        </div>

        <VisuallyHidden v-if="!title || !description">
          <SheetTitle v-if="!title" />
          <SheetDescription v-if="!description" />
        </VisuallyHidden>

        <div class="flex-center">
          <slot name="extra"></slot>
          <SheetClose
            v-if="closable && closeIconPlacement === 'right'"
            as-child
            :disabled="submitting"
            class="ml-0.5 cursor-pointer rounded-full opacity-80 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary"
          >
            <slot name="close-icon">
              <VbenIconButton>
                <X class="size-4" />
              </VbenIconButton>
            </slot>
          </SheetClose>
        </div>
      </SheetHeader>
      <template v-else>
        <VisuallyHidden>
          <SheetTitle />
          <SheetDescription />
        </VisuallyHidden>
      </template>
      <div
        ref="wrapperRef"
        :class="
          cn('relative flex-1 overflow-y-auto p-3', contentClass, {
            'pointer-events-none': showLoading || submitting,
          })
        "
      >
        <slot></slot>
      </div>
      <VbenLoading v-if="showLoading || submitting" spinning />
      <SheetFooter
        v-if="showFooter"
        :class="
          cn(
            'w-full flex-row items-center justify-end border-t border-border p-2 px-3',
            footerClass,
          )
        "
      >
        <slot name="prepend-footer"></slot>
        <slot name="footer">
          <component
            :is="components.DefaultButton || VbenButton"
            v-if="showCancelButton"
            variant="ghost"
            :disabled="submitting"
            @click="() => drawerApi?.onCancel()"
          >
            <slot name="cancelText">
              {{ cancelText || $t('cancel') }}
            </slot>
          </component>
          <slot name="center-footer"></slot>
          <component
            :is="components.PrimaryButton || VbenButton"
            v-if="showConfirmButton"
            :loading="confirmLoading || submitting"
            @click="() => drawerApi?.onConfirm()"
          >
            <slot name="confirmText">
              {{ confirmText || $t('confirm') }}
            </slot>
          </component>
        </slot>
        <slot name="append-footer"></slot>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
