<script setup lang="tsx">
import type { IconPickerProps } from './types';

import { computed, ref, useAttrs, watch, watchEffect } from 'vue';

import { refDebounced, watchDebounced } from '@vueuse/core';
import {
  ElIcon,
  ElInput,
  ElPagination,
  ElPopover,
  ElTooltip,
} from 'element-plus';

import { listIcons } from '@iconify/vue';

import { usePagination } from '#/core/composables';
import { EmptyIcon, Grip, IconifyIcon as VbenIcon } from '#/core/design/icons';
import { $t } from '#/core/locales';
import { isFunction } from '#/core/shared/utils';

import { fetchIconsData } from './icons';

const props = withDefaults(defineProps<IconPickerProps>(), {
  prefix: 'ant-design',
  pageSize: 36,
  icons: () => [],
  iconSlot: 'default',
  iconClass: 'size-4',
  autoFetchApi: true,
  modelValueProp: 'modelValue',
  inputComponent: undefined,
  type: 'input',
});

const emit = defineEmits<{
  change: [string];
}>();

const attrs = useAttrs();

const modelValue = defineModel({ default: '', type: String });

const visible = ref(false);
const currentSelect = ref('');
const keyword = ref('');
const keywordDebounce = refDebounced(keyword, 300);
const innerIcons = ref<string[]>([]);

watchDebounced(
  () => props.prefix,
  async (prefix) => {
    if (prefix && prefix !== 'svg' && props.autoFetchApi) {
      innerIcons.value = await fetchIconsData(prefix);
    }
  },
  { immediate: true, debounce: 500, maxWait: 1000 },
);

const fallbackIcon = Grip as any;

const currentList = computed<string[]>(() => {
  try {
    if (props.prefix) {
      if (
        props.prefix !== 'svg' &&
        props.autoFetchApi &&
        props.icons.length === 0
      ) {
        return innerIcons.value;
      }
      const icons = listIcons('', props.prefix);
      if (icons.length === 0) {
        console.warn(`No icons found for prefix: ${props.prefix}`);
      }
      return icons;
    }
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
  return [];
});

const showList = computed(() => {
  return (currentList.value ?? []).filter((item) =>
    item.includes(keywordDebounce.value),
  );
});

const { paginationList, total, setCurrentPage, currentPage } = usePagination(
  showList,
  props.pageSize,
);

watchEffect(() => {
  currentSelect.value = modelValue.value;
});

watch(
  () => currentSelect.value,
  (v) => {
    emit('change', v);
  },
);

const handleClick = (icon: string) => {
  currentSelect.value = icon;
  modelValue.value = icon;
  visible.value = false;
};

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

function onKeywordChange(v: string) {
  keyword.value = v;
}

const searchInputProps = computed(() => {
  return {
    placeholder: $t('ui.iconPicker.search'),
    [props.modelValueProp]: keyword.value,
    [`onUpdate:${props.modelValueProp}`]: onKeywordChange,
    class: 'mx-2',
  };
});

function updateCurrentSelect(v: string) {
  currentSelect.value = v;
  if (props.modelValueProp === 'modelValue') {
    modelValue.value = v;
  }
  const eventKey = `onUpdate:${props.modelValueProp}`;
  if (attrs[eventKey] && isFunction(attrs[eventKey])) {
    attrs[eventKey](v);
  }
}
</script>
<template>
  <ElPopover
    v-model:visible="visible"
    placement="bottom-end"
    :width="280"
    trigger="click"
    popper-class="madong-icon-picker-popover"
  >
    <template #reference>
      <template v-if="props.type === 'input'">
        <component
          v-if="props.inputComponent"
          :is="inputComponent"
          :[modelValueProp]="currentSelect"
          :placeholder="$t('ui.iconPicker.placeholder')"
          role="combobox"
          :aria-label="$t('ui.iconPicker.placeholder')"
          :aria-expanded="visible"
          :[`onUpdate:${modelValueProp}`]="updateCurrentSelect"
          v-bind="attrs"
        >
          <template #[iconSlot]>
            <VbenIcon :icon="currentSelect || fallbackIcon" class="size-4" aria-hidden="true" />
          </template>
        </component>
        <div v-else class="relative w-full">
          <ElInput
            v-bind="$attrs"
            v-model="currentSelect"
            :placeholder="$t('ui.iconPicker.placeholder')"
            class="w-full"
            role="combobox"
            :aria-label="$t('ui.iconPicker.placeholder')"
            :aria-expanded="visible"
          >
            <template #append>
              <ElIcon class="text-base"><VbenIcon :icon="currentSelect || fallbackIcon" /></ElIcon>
            </template>
          </ElInput>
        </div>
      </template>
      <ElIcon
        v-else
        class="size-4 c-p"
        v-bind="$attrs"
      >
        <VbenIcon :icon="currentSelect || fallbackIcon" />
      </ElIcon>
    </template>

    <div class="mb-2 flex w-full">
      <component
        v-if="inputComponent"
        :is="inputComponent"
        v-bind="searchInputProps"
      />
      <ElInput
        v-else
        class="mx-2 w-[calc(100%-1rem)]"
        :placeholder="$t('ui.iconPicker.search')"
        v-model="keyword"
      />
    </div>

    <template v-if="paginationList.length > 0">
      <div class="grid max-h-90 w-full grid-cols-6 justify-items-center">
        <ElTooltip
          v-for="(item, index) in paginationList"
          :key="index"
          :content="item"
          placement="top"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded border-0 bg-transparent c-p transition-colors hover:bg-[var(--el-fill-color-light)]"
            :class="{
              'text-[var(--el-color-primary)]': currentSelect === item,
            }"
            @click="handleClick(item)"
          >
            <VbenIcon :icon="item" class="text-lg" />
          </button>
        </ElTooltip>
      </div>
      <div
        v-if="total >= pageSize"
        class="mt-2 flex justify-end border-t border-[var(--default-border)] pt-2"
      >
        <ElPagination
          small
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="36"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </template>

    <template v-else>
      <div class="flex min-h-37.5 w-full flex-col items-center justify-center text-g-500">
        <EmptyIcon class="size-10" />
        <div class="mt-1 text-sm">{{ $t('common.noData') }}</div>
      </div>
    </template>
  </ElPopover>
</template>
