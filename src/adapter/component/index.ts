/**
 * 通用组件共同的使用的基础组件，原先放在 adapter/form 内部，限制了使用范围，这里提取出来，方便其他地方使用
 * 可用于 vben-form、vben-modal、vben-drawer 等组件使用,
 */

import type {
  CheckboxGroupProps,
  CheckboxProps,
  DatePickerProps,
  DividerProps,
  ElTimePicker as ElTimePickerType,
  ElTreeSelect as ElTreeSelectType,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  SelectV2Props,
  SpaceProps,
  SwitchProps,
  UploadProps,
} from 'element-plus';

import type { Component } from 'vue';

import type { Recordable } from '#/core/shared/types';
import type {
  ApiComponentSharedProps,
  BaseFormComponentType,
  IconPickerProps,
} from '#/core/ui/common';

import { defineAsyncComponent, defineComponent, h, ref } from 'vue';

import { ElNotification } from 'element-plus';

import { $t } from '#/core/locales';
import { globalShareState } from '#/core/ui/common';

import { getAll as getFormComponents } from '../../components/form/component-map';

type ElTreeSelectSchemaProps = InstanceType<typeof ElTreeSelectType>['$props'];
type ElTimePickerSchemaProps = InstanceType<typeof ElTimePickerType>['$props'];

const ElDatePicker = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/date-picker/index'),
    import('element-plus/es/components/date-picker/style/css'),
  ]).then(([res]) => res.ElDatePicker),
);
const ElInput = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/input/index'),
    import('element-plus/es/components/input/style/css'),
  ]).then(([res]) => res.ElInput),
);
const ElInputNumber = defineAsyncComponent(() =>
  Promise.all([
    import('element-plus/es/components/input-number/index'),
    import('element-plus/es/components/input-number/style/css'),
  ]).then(([res]) => res.ElInputNumber),
);
const withDefaultPlaceholder = <T extends Component>(
  component: T,
  type: 'input' | 'select',
  componentProps: Recordable<any> = {},
) => {
  return defineComponent({
    name: component.name,
    inheritAttrs: false,
    setup: (props: any, { attrs, expose, slots }) => {
      const placeholder =
        props?.placeholder ||
        attrs?.placeholder ||
        $t(`ui.placeholder.${type}`);
      // 透传组件暴露的方法
      const innerRef = ref();
      expose(
        new Proxy(
          {},
          {
            get: (_target, key) => innerRef.value?.[key],
            has: (_target, key) => key in (innerRef.value || {}),
          },
        ),
      );
      return () =>
        h(
          component,
          { ...componentProps, placeholder, ...props, ...attrs, ref: innerRef },
          slots,
        );
    },
  });
};

// 这里需要自行根据业务组件库进行适配，需要用到的组件都需要在这里类型说明
export type ComponentType =
  | 'ApiDict'
  | 'ApiSelect'
  | 'ApiSelectDept'
  | 'ApiSelectPosition'
  | 'ApiSelectRole'
  | 'ApiTreeSelect'
  | 'Avatar'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'Divider'
  | 'Editor'
  | 'IconPicker'
  | 'Input'
  | 'InputNumber'
  | 'KeyValueEditor'
  | 'Password'
  | 'RadioGroup'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | BaseFormComponentType;

/**
 * 与 {@link ComponentType} 中注册的组件名一一对应，便于 Schema 上 `component` + `componentProps` 联动提示
 */
export interface ComponentPropsMap {
  ApiDict: Record<string, any>;
  ApiSelect: ApiComponentSharedProps & SelectV2Props;
  ApiSelectDept: Record<string, any>;
  ApiSelectPosition: Record<string, any>;
  ApiSelectRole: Record<string, any>;
  ApiTreeSelect: ApiComponentSharedProps & ElTreeSelectSchemaProps;
  Avatar: Record<string, any>;
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  DatePicker: DatePickerProps;
  Divider: DividerProps;
  Editor: Record<string, any>;
  IconPicker: IconPickerProps;
  Input: InputProps;
  InputNumber: InputNumberProps;
  Password: Record<string, any>;
  RadioGroup: RadioGroupProps;
  Select: SelectV2Props;
  Space: SpaceProps;
  Switch: SwitchProps;
  Textarea: InputProps;
  TimePicker: ElTimePickerSchemaProps;
  TreeSelect: ElTreeSelectSchemaProps;
  Upload: UploadProps;
}

async function initComponentAdapter() {
  // 从 component-map 获取所有表单组件
  const formComponents = getFormComponents();
  const formComponentsObj: Partial<Record<ComponentType, Component>> = {};
  formComponents.forEach((comp, name) => {
    formComponentsObj[name as ComponentType] = comp;
  });

  const components: Partial<Record<ComponentType, Component>> = {
    // 如果你的组件体积比较大，可以使用异步加载
    // Button: () =>
    // import('xxx').then((res) => res.Button),
    // 自定义业务组件（来自 component-map 自动扫描）
    ...formComponentsObj,
    // ApiSelect: withDefaultPlaceholder(
    //   {
    //     ...ApiComponent,
    //     name: 'ApiSelect',
    //   },
    //   'select',
    //   {
    //     component: ElSelectV2,
    //     loadingSlot: 'loading',
    //     visibleEvent: 'onVisibleChange',
    //   },
    // ),
    // ApiTreeSelect: withDefaultPlaceholder(
    //   {
    //     ...ApiComponent,
    //     name: 'ApiTreeSelect',
    //   },
    //   'select',
    //   {
    //     component: ElTreeSelect,
    //     props: { label: 'label', children: 'children' },
    //     nodeKey: 'value',
    //     loadingSlot: 'loading',
    //     optionsPropName: 'data',
    //     visibleEvent: 'onVisibleChange',
    //   },
    // ),
    // Checkbox: ElCheckbox,
    // CheckboxGroup: (props, { attrs, slots }) => {
    //   let defaultSlot;
    //   if (Reflect.has(slots, 'default')) {
    //     defaultSlot = slots.default;
    //   } else {
    //     const { options, isButton } = attrs;
    //     if (Array.isArray(options)) {
    //       defaultSlot = () =>
    //         options.map((option) =>
    //           h(isButton ? ElCheckboxButton : ElCheckbox, option),
    //         );
    //     }
    //   }
    //   return h(
    //     ElCheckboxGroup,
    //     { ...props, ...attrs },
    //     { ...slots, default: defaultSlot },
    //   );
    // },
    // // 自定义默认按钮
    // DefaultButton: (props, { attrs, slots }) => {
    //   return h(ElButton, { ...props, attrs, type: 'info' }, slots);
    // },
    // // 自定义主要按钮
    // PrimaryButton: (props, { attrs, slots }) => {
    //   return h(ElButton, { ...props, attrs, type: 'primary' }, slots);
    // },
    // Divider: ElDivider,
    // IconPicker: withDefaultPlaceholder(IconPicker, 'select', {
    //   iconSlot: 'append',
    //   modelValueProp: 'model-value',
    //   inputComponent: ElInput,
    // }),
    Input: withDefaultPlaceholder(ElInput, 'input'),
    InputNumber: withDefaultPlaceholder(ElInputNumber, 'input'),
    Textarea: withDefaultPlaceholder(ElInput, 'input', { type: 'textarea' }),
    // RadioGroup: (props, { attrs, slots }) => {
    //   let defaultSlot;
    //   if (Reflect.has(slots, 'default')) {
    //     defaultSlot = slots.default;
    //   } else {
    //     const { options } = attrs;
    //     if (Array.isArray(options)) {
    //       defaultSlot = () =>
    //         options.map((option) =>
    //           h(attrs.isButton ? ElRadioButton : ElRadio, option),
    //         );
    //     }
    //   }
    //   return h(
    //     ElRadioGroup,
    //     { ...props, ...attrs },
    //     { ...slots, default: defaultSlot },
    //   );
    // },
    // Select: (props, { attrs, slots }) => {
    //   return h(ElSelectV2, { ...props, attrs }, slots);
    // },
    // Space: ElSpace,
    // Switch: ElSwitch,
    // TimePicker: (props, { attrs, slots }) => {
    //   const { name, id, isRange } = props;
    //   const extraProps: Recordable<any> = {};
    //   if (isRange) {
    //     if (name && !Array.isArray(name)) {
    //       extraProps.name = [name, `${name}_end`];
    //     }
    //     if (id && !Array.isArray(id)) {
    //       extraProps.id = [id, `${id}_end`];
    //     }
    //   }
    //   return h(
    //     ElTimePicker,
    //     {
    //       ...props,
    //       ...attrs,
    //       ...extraProps,
    //     },
    //     slots,
    //   );
    // },
    DatePicker: (props, { attrs, slots }) => {
      const { name, id, type } = props;
      const extraProps: Recordable<any> = {};
      if (type && type.includes('range')) {
        if (name && !Array.isArray(name)) {
          extraProps.name = [name, `${name}_end`];
        }
        if (id && !Array.isArray(id)) {
          extraProps.id = [id, `${id}_end`];
        }
      }
      return h(
        ElDatePicker,
        {
          ...props,
          ...attrs,
          ...extraProps,
        },
        slots,
      );
    },
    // TreeSelect: withDefaultPlaceholder(ElTreeSelect, 'select'),
    // Upload: ElUpload,
  };

  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components);

  // 定义全局共享状态中的消息提示
  globalShareState.defineMessage({
    // 复制成功消息提示
    copyPreferencesSuccess: (title, content) => {
      ElNotification({
        title,
        message: content,
        position: 'bottom-right',
        duration: 0,
        type: 'success',
      });
    },
  });
}

export { initComponentAdapter };
