import type { Component } from 'vue';

import type { AlertProps, IconType, PromptProps } from './alert';

import type { Recordable } from '#/core/shared/types/base';

import { h, isVNode, ref } from 'vue';

import { ElMessageBox } from 'element-plus';

import { useSimpleLocale } from '#/core/composables';
import { isFunction, isString } from '#/core/shared/utils';

const { $t } = useSimpleLocale();

const ICON_TYPE_MAP: Partial<Record<IconType, 'error' | 'info' | 'success' | 'warning'>> = {
  error: 'error',
  info: 'info',
  question: 'warning',
  success: 'success',
  warning: 'warning',
};

function normalizeOptions(
  arg0: AlertProps | string,
  arg1?: Partial<AlertProps> | string,
  arg2?: Partial<AlertProps>,
): AlertProps {
  const options: AlertProps = isString(arg0)
    ? { content: arg0 }
    : { ...arg0 };
  if (arg1) {
    if (isString(arg1)) {
      options.title = arg1;
    } else {
      Object.assign(options, arg1);
    }
  }
  if (arg2 && !isString(arg2)) {
    Object.assign(options, arg2);
  }
  return options;
}

function renderContent(content: Component | string) {
  return isString(content) || isVNode(content)
    ? content
    : h(content as Component);
}

export function vbenAlert(options: AlertProps): Promise<void>;
export function vbenAlert(
  message: string,
  options?: Partial<AlertProps>,
): Promise<void>;
export function vbenAlert(
  message: string,
  title?: string,
  options?: Partial<AlertProps>,
): Promise<void>;

export function vbenAlert(
  arg0: AlertProps | string,
  arg1?: Partial<AlertProps> | string,
  arg2?: Partial<AlertProps>,
): Promise<void> {
  const options = normalizeOptions(arg0, arg1, arg2);

  const {
    beforeClose,
    cancelText,
    confirmText,
    containerClass,
    content,
    icon,
    showCancel,
    title,
  } = options;

  return new Promise((resolve, reject) => {
    ElMessageBox({
      title: title ?? $t.value('prompt'),
      message: renderContent(content),
      type: isString(icon) ? ICON_TYPE_MAP[icon as IconType] : undefined,
      showConfirmButton: true,
      showCancelButton: !!showCancel,
      confirmButtonText: confirmText ?? $t.value('confirm'),
      cancelButtonText: cancelText ?? $t.value('cancel'),
      customClass: containerClass,
      distinguishCancelAndClose: true,
      async beforeClose(action, _instance, done) {
        const isConfirm = action === 'confirm';
        const allow = beforeClose
          ? ((await beforeClose({ isConfirm })) ?? true)
          : true;
        if (allow) {
          done();
        }
      },
    })
      .then(() => resolve())
      .catch(() => reject(new Error('dialog cancelled')));
  });
}

export function vbenConfirm(options: AlertProps): Promise<void>;
export function vbenConfirm(
  message: string,
  options?: Partial<AlertProps>,
): Promise<void>;
export function vbenConfirm(
  message: string,
  title?: string,
  options?: Partial<AlertProps>,
): Promise<void>;

export function vbenConfirm(
  arg0: AlertProps | string,
  arg1?: Partial<AlertProps> | string,
  arg2?: Partial<AlertProps>,
): Promise<void> {
  const defaultProps: Partial<AlertProps> = {
    showCancel: true,
  };
  if (!arg1) {
    return isString(arg0)
      ? vbenAlert(arg0, defaultProps)
      : vbenAlert({ ...defaultProps, ...arg0 });
  } else if (!arg2) {
    return isString(arg1)
      ? vbenAlert(arg0 as string, arg1, defaultProps)
      : vbenAlert(arg0 as string, { ...defaultProps, ...arg1 });
  }
  return vbenAlert(arg0 as string, arg1 as string, {
    ...defaultProps,
    ...arg2,
  });
}

export async function vbenPrompt<T = any>(
  options: PromptProps<T>,
): Promise<T | undefined> {
  const {
    cancelText,
    component,
    componentProps,
    componentSlots,
    confirmText,
    content,
    defaultValue,
    modelPropName: _modelPropName,
    title,
    beforeClose: _beforeClose,
    ...delegated
  } = options;

  const modelPropName = _modelPropName || 'modelValue';
  const valueRef = ref<T | undefined>(defaultValue);

  const baseBeforeClose = async (
    isConfirm: boolean,
    value: T | undefined,
    done: () => void,
  ) => {
    const allow = _beforeClose
      ? ((await _beforeClose({ isConfirm, value })) ?? true)
      : true;
    if (allow) done();
  };

  // 未传自定义组件：使用 ElMessageBox.prompt 原生输入框
  if (!component) {
    try {
      const res = await ElMessageBox.prompt(
        isString(content) ? content : renderContent(content),
        title ?? $t.value('prompt'),
        {
          ...(delegated as Recordable<any>),
          inputValue: defaultValue as any,
          showCancelButton: true,
          distinguishCancelAndClose: true,
          confirmButtonText: confirmText ?? $t.value('confirm'),
          cancelButtonText: cancelText ?? $t.value('cancel'),
          async beforeClose(action, instance, done) {
            await baseBeforeClose(
              action === 'confirm',
              instance.inputValue as T,
              done,
            );
          },
        },
      );
      return res.value as T;
    } catch {
      throw new Error('dialog cancelled');
    }
  }

  // 自定义组件：将组件渲染到 message 区域并手动桥接 v-model
  const messageNode = h('div', { class: 'vben-prompt-custom' }, [
    content ? h('div', renderContent(content)) : null,
    h(
      component,
      {
        ...componentProps,
        [modelPropName]: valueRef.value,
        [`onUpdate:${modelPropName}`]: (val: T) => {
          valueRef.value = val;
        },
      },
      componentSlots as any,
    ),
  ]);

  return new Promise<T | undefined>((resolve, reject) => {
    ElMessageBox({
      ...(delegated as Recordable<any>),
      title: title ?? $t.value('prompt'),
      message: messageNode,
      showCancelButton: true,
      distinguishCancelAndClose: true,
      confirmButtonText: confirmText ?? $t.value('confirm'),
      cancelButtonText: cancelText ?? $t.value('cancel'),
      async beforeClose(action, _instance, done) {
        const isConfirm = action === 'confirm';
        await baseBeforeClose(isConfirm, valueRef.value, () => {
          done();
          if (isConfirm) resolve(valueRef.value);
        });
      },
    }).catch(() => reject(new Error('dialog cancelled')));
  });
}

export function clearAllAlerts() {
  ElMessageBox.close();
}
