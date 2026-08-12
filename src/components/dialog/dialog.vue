<script setup lang="ts">
import type { DialogEmits, MyDialogInstance, MyDialogProps } from './types';

import { computed, nextTick, onMounted, ref } from 'vue';

import { ElButton, ElDialog, ElDrawer } from 'element-plus';

import { Icon } from '#/components/icon';

const props = withDefaults(defineProps<MyDialogProps>(), {
  loading: false,
  confirmLoading: false,
  showConfirmButton: true,
  showCancelButton: true,
  footer: true,
  dialogType: 'dialog',
  draggable: false,
});

const emit = defineEmits<DialogEmits>();
const dialogVisible = ref(false);
const fullscreen = ref(false);

// 根据 dialogType 决定使用哪个组件
const dialogComponent = computed(() => {
  return props.dialogType === 'drawer' ? ElDrawer : ElDialog;
});

// 根据 dialogType 设置不同的 customClass
const customClass = computed(() => {
  const baseClass = dialogPropsRef.value.customClass ?? 'm-dialog';
  return props.dialogType === 'drawer'
    ? `${baseClass} m-drawer`
    : `${baseClass} m-dialog-box`;
});

const dialogPropsRef = ref<MyDialogProps>(props);
const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value;
};
const handleCancel = () => {
  dialogVisible.value = false;
  if (props.onCancel) {
    props.onCancel();
  } else {
    emit('cancel');
  }
};
const handleSubmit = () => {
  if (props.onConfirm) {
    props.onConfirm();
  } else {
    emit('confirm');
  }
};
const methods: MyDialogInstance = {
  open() {
    dialogVisible.value = true;
  },
  close() {
    dialogVisible.value = false;
  },
  // 设置组件状态（props）
  setState(state: MyDialogProps) {
    return new Promise((resolve) => {
      dialogPropsRef.value = {
        ...dialogPropsRef.value,
        ...state,
      };
      nextTick(() => {
        resolve();
      });
    });
  },
  getState(): Promise<MyDialogProps> {
    return new Promise((resolve) => {
      resolve(dialogPropsRef.value);
    });
  },
};
onMounted(() => {
  emit('register', methods);
});
defineExpose(methods);
</script>

<template>
  <component
    :is="dialogComponent"
    :class="customClass"
    :destroy-on-close="dialogPropsRef.destroyOnClose ?? true"
    :close-on-click-modal="dialogPropsRef.closeOnClickModal ?? false"
    :close-on-press-escape="dialogPropsRef.closeOnPressEscape ?? true"
    v-model="dialogVisible"
    :width="dialogPropsRef.width ?? '60%'"
    :title="dialogPropsRef.title ?? '操作'"
    :fullscreen="fullscreen"
    :show-close="dialogPropsRef.showClose ?? true"
    :direction="dialogPropsRef.direction ?? 'rtl'"
    :size="dialogPropsRef.width ?? '40%'"
    :modal="dialogPropsRef.modal ?? true"
    :append-to-body="true"
    :draggable="dialogPropsRef.draggable ?? true"
    :z-index="dialogPropsRef.zIndex"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="el-dialog__header-inner">
        <span :id="titleId" :class="titleClass">{{
          dialogPropsRef.title ?? '操作'
        }}</span>
        <div class="dialog-header-actions">
          <ElButton
            v-if="dialogPropsRef.dialogType === 'dialog'"
            class="dialog-header-btn"
            @click="toggleFullscreen"
            link
          >
            <template #icon>
              <Icon
                :icon="
                  fullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'
                "
              />
            </template>
          </ElButton>
          <ElButton class="dialog-header-btn" @click="close" link>
            <Icon icon="ri:close-large-line" />
          </ElButton>
        </div>
      </div>
    </template>
    <div class="m-dialog-body" v-loading="dialogPropsRef.loading ?? false">
      <slot></slot>
    </div>
    <template #footer v-if="dialogPropsRef.footer">
      <slot name="footer">
        <slot name="prepend-footer"></slot>
        <div class="footer-right">
          <ElButton
            v-if="dialogPropsRef.showCancelButton"
            @click="handleCancel"
          >
            取消
          </ElButton>
          <slot name="center-footer"></slot>
          <ElButton
            v-if="dialogPropsRef.showConfirmButton"
            type="primary"
            @click="handleSubmit"
            v-loading="dialogPropsRef.confirmLoading ?? false"
          >
            确定
          </ElButton>
        </div>
        <slot name="append-footer"></slot>
      </slot>
    </template>
  </component>
</template>

<style lang="scss" scoped>
.el-dialog__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header-actions {
  display: flex;
  align-items: center;
}

.dialog-header-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: 10px;

  :deep(.el-icon) {
    font-size: 16px;
  }
}

:deep(.el-dialog__header) {
  display: block !important;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}
</style>

<style lang="scss">
// 全局样式，用于区分 dialog 和 drawer 的外观
.m-dialog-box {
  padding: 0;

  .el-dialog__header {
    // background-color: var(--el-color-primary-light-6);
    // border-bottom: 1px solid var(--el-border-color);
    padding: 15px 20px !important;
  }

  .m-dialog-body {
    padding: 0;
    background-color: var(--el-bg-color);
  }

  .el-dialog__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 15px 20px !important;
    // background-color: var(--el-color-primary-light-6);
    border-top: 1px solid var(--el-border-color);
  }

  .el-dialog__body {
    padding: 0 !important;
  }
}

.m-drawer {
  .el-drawer__header {
    // background-color: var(--el-color-primary-light-6);
    // border-bottom: 1px solid var(--el-border-color);
    padding: 15px 20px !important;
    margin-bottom: 0 !important;
  }

  .m-dialog-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    background-color: var(--el-bg-color);
  }

  .el-drawer__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 15px 20px !important;
    // background-color: var(--el-color-primary-light-6);
    border-top: 1px solid var(--el-border-color);
  }

  .el-drawer__body {
    display: flex;
    flex-direction: column;
    padding: 0 !important;
  }
}

// 底部按钮两端对齐的样式（用于select-dept和select-position组件）
.m-dialog-footer-between {
  .el-dialog__footer {
    justify-content: space-between;
  }

  .el-drawer__footer {
    justify-content: space-between;
  }
}
</style>
