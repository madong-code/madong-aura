<script setup lang="ts">
import type { Component } from 'vue';

import { computed, nextTick, ref, unref, useAttrs, watch } from 'vue';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
import { Icon } from '#/components/icon';

type AnyPromiseFunction<T extends any[] = any[], R = void> = (
  ...arg: T
) => PromiseLike<R>;

export interface OptionsItem {
  [name: string]: any;
  children?: OptionsItem[];
  disabled?: boolean;
  label?: string;
  modelValue?: number | string;
}

export interface Props {
  component: Component;
  numberToString?: boolean;
  api?: ((arg?: any) => Promise<OptionsItem[] | Record<string, any>>) | string;
  requestMethod?: 'get' | 'GET' | 'post' | 'POST';
  params?: Record<string, any>;
  resultField?: string;
  labelField?: string;
  childrenField?: string;
  valueField?: string;
  optionsPropName?: string;
  immediate?: boolean;
  alwaysLoad?: boolean;
  beforeFetch?: AnyPromiseFunction<any, any>;
  afterFetch?: AnyPromiseFunction<any, any>;
  options?: OptionsItem[];
  loadingSlot?: string;
  visibleEvent?: string;
  modelPropName?: string;
  autoSelect?:
    | 'first'
    | 'last'
    | 'one'
    | ((item: OptionsItem[]) => OptionsItem)
    | false;
}

defineOptions({ name: 'ApiComponent', inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  labelField: 'label',
  valueField: 'value',
  childrenField: '',
  optionsPropName: 'options',
  resultField: '',
  visibleEvent: '',
  numberToString: false,
  params: () => ({}),
  immediate: true,
  alwaysLoad: false,
  loadingSlot: '',
  beforeFetch: undefined,
  afterFetch: undefined,
  modelPropName: 'modelValue',
  api: undefined,
  autoSelect: false,
  options: () => [],
  requestMethod: 'get',
});

const emit = defineEmits<{
  optionsChange: [OptionsItem[]];
}>();

const modelValue = defineModel<any>({ default: undefined });

const attrs = useAttrs();
const innerParams = ref({});
const refOptions = ref<OptionsItem[]>([]);
const loading = ref(false);
const isFirstLoaded = ref(false);
const hasPendingRequest = ref(false);

const getOptions = computed(() => {
  const { labelField, valueField, childrenField, numberToString } = props;

  const refOptionsData = unref(refOptions);

  function transformData(data: OptionsItem[]): OptionsItem[] {
    return data.map((item) => {
      const value = getDeep(item, valueField);
      return {
        ...objectOmit(item, [labelField, valueField, childrenField]),
        label: getDeep(item, labelField),
        value: numberToString ? `${value}` : value,
        ...(childrenField && item[childrenField]
          ? { children: transformData(item[childrenField]) }
          : {}),
      };
    });
  }

  const data: OptionsItem[] = transformData(refOptionsData);
  return data.length > 0 ? data : props.options;
});

const bindProps = computed(() => {
  return {
    [props.modelPropName]: unref(modelValue),
    [props.optionsPropName]: unref(getOptions),
    [`onUpdate:${props.modelPropName}`]: (val: string) => {
      modelValue.value = val;
    },
    ...objectOmit(attrs, [`onUpdate:${props.modelPropName}`]),
    ...(props.visibleEvent
      ? {
          [props.visibleEvent]: handleFetchForVisible,
        }
      : {}),
  };
});

async function fetchApi() {
  const { api, beforeFetch, afterFetch, resultField } = props;
  let funApi = api;
  if (api && typeof api === 'string') {
    funApi = (params: any) => {
      const method = props.requestMethod.toLowerCase();
      const request = (requestClient as any)[method];
      if (typeof request !== 'function') {
        throw new TypeError(
          `Unsupported request method: ${props.requestMethod}`,
        );
      }
      return request.call(requestClient, api, { params });
    };
  }
  if (!funApi || typeof funApi !== 'function') {
    return;
  }

  if (loading.value) {
    hasPendingRequest.value = true;
    return;
  }

  refOptions.value = [];
  try {
    loading.value = true;
    let finalParams = unref(mergedParams);
    if (beforeFetch && typeof beforeFetch === 'function') {
      finalParams = (await beforeFetch(cloneDeep(finalParams))) || finalParams;
    }
    let res = await funApi(finalParams);
    if (afterFetch && typeof afterFetch === 'function') {
      res = (await afterFetch(res)) || res;
    }
    isFirstLoaded.value = true;
    if (Array.isArray(res)) {
      refOptions.value = res;
      emitChange();
      return;
    }
    if (resultField) {
      refOptions.value = getDeep(res, resultField) || [];
    }
    emitChange();
  } catch (error) {
    console.warn(error);
    isFirstLoaded.value = false;
  } finally {
    loading.value = false;
    if (hasPendingRequest.value) {
      hasPendingRequest.value = false;
      await nextTick();
      fetchApi();
    }
  }
}

async function handleFetchForVisible(visible: boolean) {
  if (visible) {
    if (props.alwaysLoad) {
      await fetchApi();
    } else if (!props.immediate && !unref(isFirstLoaded)) {
      await fetchApi();
    }
  }
}

const mergedParams = computed(() => {
  return {
    ...props.params,
    ...unref(innerParams),
  };
});

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || a === undefined || b === null || b === undefined)
    return a === b;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (const [index, item] of a.entries()) {
      if (!isEqual(item, b[index])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!isEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

function cloneDeep(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => cloneDeep(item));
  const copy: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = cloneDeep(obj[key]);
    }
  }
  return copy;
}

function getDeep(obj: any, path: string) {
  let value = obj;
  for (const key of path.split('.')) {
    value = value === null || value === undefined ? undefined : value[key];
  }
  return value;
}

watch(
  mergedParams,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) return;
    fetchApi();
  },
  { deep: true, immediate: props.immediate },
);

async function emitChange() {
  if (
    modelValue.value === undefined &&
    props.autoSelect &&
    unref(getOptions).length > 0
  ) {
    let firstOption: OptionsItem | undefined;
    if (typeof props.autoSelect === 'function') {
      firstOption = props.autoSelect(unref(getOptions));
    } else {
      switch (props.autoSelect) {
        case 'first': {
          firstOption = unref(getOptions)[0];
          break;
        }
        case 'last': {
          firstOption = unref(getOptions)[unref(getOptions).length - 1];
          break;
        }
        case 'one': {
          if (unref(getOptions).length === 1) {
            firstOption = unref(getOptions)[0];
          }
          break;
        }
      }
    }
    if (firstOption) modelValue.value = firstOption.value;
  }
  emit('optionsChange', unref(getOptions));

  // 异步 options 加载完成后，若当前已有选中值（如编辑回填），
  // 部分 element-plus 组件（ElTreeSelect）不会用新数据重新解析 label，
  // 这里通过“先置空再还原”强制触发一次匹配，确保回填正确回显。
  if (
    modelValue.value !== undefined &&
    modelValue.value !== null &&
    modelValue.value !== ''
  ) {
    const cached = modelValue.value;
    modelValue.value = undefined;
    await nextTick();
    modelValue.value = cached;
  }
}

const componentRef = ref();
defineExpose({
  getOptions: () => unref(getOptions),
  getValue: () => unref(modelValue),
  getComponentRef: <T = any>() => componentRef.value as T,
  updateParam(newParams: Record<string, any>) {
    innerParams.value = newParams;
  },
});
</script>

<template>
  <component
    :is="component"
    v-bind="bindProps"
    :placeholder="attrs.placeholder"
    ref="componentRef"
  >
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template v-if="loadingSlot && loading" #[loadingSlot]>
      <Icon class="animate-spin" icon="lucide:loader" />
    </template>
  </component>
</template>
