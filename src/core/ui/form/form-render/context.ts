import type { FormRenderProps } from '../types';

import type { InjectionKey } from 'vue';

import { computed, inject, provide } from 'vue';

const FORM_RENDER_PROPS_KEY: InjectionKey<FormRenderProps> = Symbol(
  'FormRenderProps',
);

export const injectRenderFormProps = () => {
  const context = inject(FORM_RENDER_PROPS_KEY, null);
  if (!context) {
    throw new Error('FormRenderProps must be used within <Form />');
  }
  return context;
};

export const provideFormRenderProps = (props: FormRenderProps) => {
  provide(FORM_RENDER_PROPS_KEY, props);
};

export const useFormContext = () => {
  const formRenderProps = injectRenderFormProps();

  const isVertical = computed(() => formRenderProps.layout === 'vertical');

  const componentMap = computed(() => formRenderProps.componentMap);
  const componentBindEventMap = computed(
    () => formRenderProps.componentBindEventMap,
  );
  return {
    componentBindEventMap,
    componentMap,
    isVertical,
  };
};
