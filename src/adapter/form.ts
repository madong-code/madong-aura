import type { ComponentPropsMap, ComponentType } from './component';

import type {
  VbenFormProps as FormProps,
  VbenFormSchema as FormSchema,
} from '#/core/ui/common';

import { $t } from '#/core/locales';
import { setupVbenForm, useVbenForm as useForm, z } from '#/core/ui/common';

async function initSetupVbenForm() {
  setupVbenForm<ComponentType>({
    config: {
      modelPropNameMap: {
        Upload: 'fileList',
        CheckboxGroup: 'model-value',
      },
    },
    defineRules: {
      required: (value, _params, ctx) => {
        if (value === undefined || value === null || value.length === 0) {
          return $t('ui.formRules.required', [ctx.label]);
        }
        return true;
      },
      selectRequired: (value, _params, ctx) => {
        if (value === undefined || value === null) {
          return $t('ui.formRules.selectRequired', [ctx.label]);
        }
        return true;
      },
    },
  });
}

const useVbenForm = useForm<ComponentType, ComponentPropsMap>;

export { initSetupVbenForm, useVbenForm, z };

type BaseFormSchema = FormSchema<ComponentType, ComponentPropsMap>;

/**
 * 扩展 VbenFormSchema，增加 viewComponent 和 viewComponentProps
 * 用于 DetailView 详情展示
 */
export type VbenFormSchema = {
  /** 在详情模式下隐藏该字段 */
  hideInDetail?: boolean;
  /** 详情模式使用的展示组件名称 */
  viewComponent?: string;
  /** 详情模式展示组件的参数 */
  viewComponentProps?: Record<string, any>;
} & BaseFormSchema;

export type VbenFormProps = FormProps<ComponentType, ComponentPropsMap>;
