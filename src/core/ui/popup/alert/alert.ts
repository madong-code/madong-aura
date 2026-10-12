import type { Component, InjectionKey, VNode, VNodeArrayChildren } from 'vue';

import type { Recordable } from '#/core/shared/types/base';

import { inject, provide } from 'vue';

export type IconType = 'error' | 'info' | 'question' | 'success' | 'warning';

export type BeforeCloseScope = {
  isConfirm: boolean;
};

export type AlertProps = {
  /** 关闭前的回调，如果返回false，则终止关闭 */
  beforeClose?: (
    scope: BeforeCloseScope,
  ) => boolean | Promise<boolean | undefined> | undefined;
  /** 边框（垫片保留契约） */
  bordered?: boolean;
  /**
   * 按钮对齐方式
   * @default 'end'
   */
  buttonAlign?: 'center' | 'end' | 'start';
  /** 取消按钮的标题 */
  cancelText?: string;
  /** 是否居中显示 */
  centered?: boolean;
  /** 确认按钮的标题 */
  confirmText?: string;
  /** 弹窗容器的额外样式 */
  containerClass?: string;
  /** 弹窗提示内容 */
  content: Component | string;
  /** 弹窗内容的额外样式 */
  contentClass?: string;
  /** 执行beforeClose回调期间显示loading遮罩（垫片保留契约，Element Plus 自行处理） */
  contentMasking?: boolean;
  /** 弹窗底部内容（与按钮在同一个容器中） */
  footer?: Component | string;
  /** 弹窗的图标（在标题的前面） */
  icon?: Component | IconType;
  /** 弹窗遮罩模糊效果（垫片保留契约） */
  overlayBlur?: number;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 弹窗标题 */
  title?: string;
};

/** Prompt属性 */
export type PromptProps<T = any> = {
  /** 关闭前的回调，如果返回false，则终止关闭 */
  beforeClose?: (scope: {
    isConfirm: boolean;
    value: T | undefined;
  }) => boolean | Promise<boolean | undefined> | undefined;
  /** 用于接受用户输入的组件 */
  component?: Component;
  /** 输入组件的属性 */
  componentProps?: Recordable<any>;
  /** 输入组件的插槽 */
  componentSlots?:
    | (() => any)
    | Recordable<unknown>
    | VNode
    | VNodeArrayChildren;
  /** 默认值 */
  defaultValue?: T;
  /** 输入组件的值属性名 */
  modelPropName?: string;
} & Omit<AlertProps, 'beforeClose'>;

/**
 * Alert上下文
 */
export type AlertContext = {
  /** 执行取消操作 */
  doCancel: () => void;
  /** 执行确认操作 */
  doConfirm: () => void;
};

const ALERT_INJECT_KEY: InjectionKey<AlertContext> = Symbol('VbenAlertContext');

export function provideAlertContext(context: AlertContext) {
  provide(ALERT_INJECT_KEY, context);
}

/**
 * 获取Alert上下文
 */
export function useAlertContext() {
  const context = inject(ALERT_INJECT_KEY);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
}
