/**
 * TableAction 类型定义
 */

import type { Component, VNode } from 'vue';

export interface PopConfirm {
  title?: string;
  content?: string;
  confirm?: (e?: any, record?: any) => void;
  /** 旧版确认回调 */
  ok?: (record?: any) => void;
  cancel?: (record?: any) => void;
  icon?: Component | string;
  confirmText?: string;
  cancelText?: string;
  okType?: 'danger' | 'default' | 'primary' | null;
  disabled?: boolean;
}

export interface ActionItem {
  /** 按钮唯一标识，用于覆盖默认按钮 */
  key?: string;
  /** 按钮文本 */
  label?: (() => string) | string;
  /** 按钮类型 */
  type?:
    | 'danger'
    | 'default'
    | 'info'
    | 'primary'
    | 'success'
    | 'warning'
    | null;
  /** 按钮图标 */
  icon?: Component | string | VNode;
  /** 按钮尺寸 */
  size?: 'default' | 'large' | 'small';
  /** 按钮颜色 */
  color?: string;
  /** 危险按钮 */
  danger?: boolean;
  /** 是否为链接按钮 */
  link?: boolean;
  /** 是否主要按钮 */
  main?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  ifShow?: ((action: ActionItem, record: any) => boolean) | boolean;
  /** 权限编码 */
  auth?: string | string[];
  /** 排序 */
  sort?: number;
  /** 点击事件 */
  onClick?: (e: any | Event, record?: any) => void;
  /** PopConfirm 配置 */
  confirm?: PopConfirm;
  /** Popover 配置 */
  popConfirm?: PopConfirm;
  /** Dialog 引用 */
  dialogRef?: any;
  /** Dialog 参数 */
  dialogParams?: ((record: any) => Record<string, any>) | Record<string, any>;
  /** 动态属性 */
  dynamicProps?: (record: any) => Partial<ActionItem>;
  /** 原始属性 */
  [key: string]: any;
}
