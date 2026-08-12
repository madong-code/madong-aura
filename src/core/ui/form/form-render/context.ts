import type { FormRenderProps } from '../types';

import { computed } from 'vue';

import { createContext } from '#/core/ui/primitives';

export const [injectRenderFormProps, provideFormRenderProps] =
  createContext<FormRenderProps>('FormRenderProps');

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
