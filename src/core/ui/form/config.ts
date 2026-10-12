import type { Component } from 'vue';

import type {
  BaseFormComponentType,
  FormCommonConfig,
  VbenFormAdapterOptions,
} from './types';

import { defineComponent, h } from 'vue';

import { ElButton, ElInput, type ButtonProps } from 'element-plus';
import { defineRule } from 'vee-validate';

import { globalShareState } from '#/core/shared/global-state';

import BaseCheckbox from './components/base-checkbox.vue';
import { VbenInputPassword } from './components/base-input-password';
import BaseSelect from './components/base-select.vue';

const DEFAULT_MODEL_PROP_NAME = 'modelValue';

export const DEFAULT_FORM_COMMON_CONFIG: FormCommonConfig = {};

/**
 * 表单操作按钮包装：
 * vben 契约下业务模板会写 type="button"（DOM 语义），但 ElButton 的 type
 * 同时是样式类型（primary/default...），直接 h(ElButton,{type:'primary'})
 * 会被业务传入的 type="button" 覆盖，导致搜索按钮丢失主题色实底样式。
 * 包装层吞掉透传的 type，固定 ElButton 样式类型（native-type 默认 button）。
 * 不显式传 size：与搜索栏输入框同走 ElConfigProvider 的全局 default 尺寸，
 * 保证重置/搜索按钮与输入框等高（对齐 madong-single 视觉）。
 */
function createFormButton(type: ButtonProps['type']) {
  return defineComponent({
    name: type === 'primary' ? 'FormPrimaryButton' : 'FormDefaultButton',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          ElButton,
          { ...attrs, type } as ButtonProps & Record<string, unknown>,
          slots,
        );
    },
  });
}

export const COMPONENT_MAP: Record<BaseFormComponentType, Component> = {
  DefaultButton: createFormButton('default'),
  PrimaryButton: createFormButton('primary'),
  VbenCheckbox: BaseCheckbox,
  VbenInput: ElInput,
  VbenInputPassword,
  VbenPinInput: ElInput,
  VbenSelect: BaseSelect,
};

export const COMPONENT_BIND_EVENT_MAP: Partial<
  Record<BaseFormComponentType, string>
> = {
  VbenCheckbox: 'checked',
};

export function setupVbenForm<
  T extends BaseFormComponentType = BaseFormComponentType,
>(options: VbenFormAdapterOptions<T>) {
  const { config, defineRules } = options;

  const {
    disabledOnChangeListener = true,
    disabledOnInputListener = true,
    emptyStateValue = undefined,
  } = (config || {}) as FormCommonConfig;

  Object.assign(DEFAULT_FORM_COMMON_CONFIG, {
    disabledOnChangeListener,
    disabledOnInputListener,
    emptyStateValue,
  });

  if (defineRules) {
    for (const key of Object.keys(defineRules)) {
      defineRule(key, defineRules[key as never]);
    }
  }

  const baseModelPropName =
    config?.baseModelPropName ?? DEFAULT_MODEL_PROP_NAME;
  const modelPropNameMap = config?.modelPropNameMap as
    | Record<BaseFormComponentType, string>
    | undefined;

  const components = globalShareState.getComponents();

  for (const component of Object.keys(components)) {
    const key = component as BaseFormComponentType;
    COMPONENT_MAP[key] = components[component as never];

    if (baseModelPropName !== DEFAULT_MODEL_PROP_NAME) {
      COMPONENT_BIND_EVENT_MAP[key] = baseModelPropName;
    }

    // 覆盖特殊组件的modelPropName
    if (modelPropNameMap && modelPropNameMap[key]) {
      COMPONENT_BIND_EVENT_MAP[key] = modelPropNameMap[key];
    }
  }
}
