<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { getComponent as getViewComponent } from './component-map';

const props = withDefaults(
  defineProps<{
    /** 通用配置 */
    commonConfig?: {
      controlClass?: string;
      formItemClass?: (() => string) | string;
      hideLabel?: boolean;
      hideRequiredMark?: boolean;
      /** label 对齐方式：left 左对齐 / right 右对齐，默认 right */
      labelAlign?: 'left' | 'right';
      labelClass?: string;
      labelWidth?: number;
      wrapperClass?: string;
    };
    /** 布局方式：水平/垂直/行内 */
    layout?: 'horizontal' | 'inline' | 'vertical';
    model?: Record<string, any>;
    schema: (() => VbenFormSchema[]) | VbenFormSchema[];
    wrapperClass?: string;
  }>(),
  {
    model: () => ({}),
    commonConfig: () => ({}),
    layout: 'horizontal',
  },
);

// 合并 commonConfig 到 schema，并过滤 hideInDetail
const mergedSchema = computed(() => {
  const schemaList =
    typeof props.schema === 'function' ? props.schema() : props.schema;
  return schemaList
    .filter((item) => !item.hideInDetail)
    .map((item) => ({
      ...props.commonConfig,
      ...item,
    }));
});

// 判断是否为网格布局（wrapperClass 包含 grid-cols）
const isGrid = computed(() => {
  const cls = props.wrapperClass || '';
  return cls.includes('grid-cols');
});

// 布局 class
const layoutClass = computed(() => {
  const classes: string[] = [];
  if (isGrid.value) {
    classes.push('detail-view--grid');
  }
  if (props.layout === 'vertical') {
    classes.push('detail-view--vertical');
  } else if (props.layout === 'inline') {
    classes.push('detail-view--inline');
  }
  return classes.join(' ');
});

// label 对齐 class
const labelAlignClass = computed(() => {
  const align =
    props.commonConfig?.labelAlign || (isGrid.value ? 'left' : 'right');
  return `detail-view-label--${align}`;
});

// label 宽度样式
const labelStyle = computed(() => {
  if (props.layout === 'vertical') return undefined;
  const labelWidth = props.commonConfig?.labelWidth || 120;
  return { width: `${labelWidth}px`, flexShrink: '0' };
});

// 从 commonConfig 提取的配置
const mergedLabelClass = computed(() => props.commonConfig?.labelClass);
const mergedControlClass = computed(() => props.commonConfig?.controlClass);
const mergedHideLabel = computed(() => props.commonConfig?.hideLabel);
const itemWrapperClass = computed(() => props.commonConfig?.wrapperClass);
const itemFormClass = computed(() => {
  const cls = props.commonConfig?.formItemClass;
  return typeof cls === 'function' ? undefined : cls;
});

const resolveValue = (fieldName: string) => {
  return props.model?.[fieldName];
};

const getViewComponentInstance = (schema: VbenFormSchema) => {
  if (schema.viewComponent) {
    const comp = getViewComponent(schema.viewComponent as string);
    if (comp) return comp;
  }
  const componentName = transformComponentName(schema.component as string);
  return getViewComponent(componentName);
};

/**
 * 组件名映射为详情展示组件（默认加 Read 前缀）
 */
const transformComponentName = (componentName: string): string => {
  return `Read${componentName}`;
};

const getViewComponentProps = (schema: VbenFormSchema) => {
  const viewComponentProps = schema.viewComponentProps || {};
  const componentProps = schema.componentProps || {};

  return {
    ...componentProps,
    ...viewComponentProps,
  };
};

const formatValue = (_schema: VbenFormSchema, value: any) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value;
};

/**
 * 判断字段是否应该显示
 */
const shouldShow = (schema: VbenFormSchema) => {
  if (schema.dependencies?.show !== undefined) {
    if (typeof schema.dependencies.show === 'boolean') {
      return schema.dependencies.show;
    }
    if (typeof schema.dependencies.show === 'function') {
      return schema.dependencies.show(props.model, {} as any, {} as any);
    }
  }
  if (schema.dependencies?.if !== undefined) {
    if (typeof schema.dependencies.if === 'boolean') {
      return schema.dependencies.if;
    }
    if (typeof schema.dependencies.if === 'function') {
      return schema.dependencies.if(props.model, {} as any, {} as any);
    }
  }
  return true;
};

defineExpose({
  model: props.model,
  schema: mergedSchema,
});
</script>

<template>
  <div class="detail-view" :class="[layoutClass, wrapperClass]">
    <template v-for="(schema, index) in mergedSchema" :key="index">
      <template v-if="!schema.hide && shouldShow(schema)">
        <div
          class="detail-view-item"
          :class="[
            isGrid ? 'detail-view-item--grid' : '',
            schema.wrapperClass || itemWrapperClass,
            schema.formItemClass || itemFormClass,
          ]"
        >
          <label
            v-if="schema.label && !(schema.hideLabel || mergedHideLabel)"
            class="detail-view-label"
            :class="[labelAlignClass, schema.labelClass || mergedLabelClass]"
            :style="labelStyle"
          >
            {{
              typeof schema.label === 'function' ? schema.label() : schema.label
            }}
          </label>
          <div
            class="detail-view-value"
            :class="schema.controlClass || mergedControlClass"
          >
            <component
              v-if="
                schema.viewComponent ||
                getViewComponent(
                  transformComponentName(schema.component as string),
                )
              "
              :is="getViewComponentInstance(schema)"
              :value="resolveValue(schema.fieldName)"
              :field-name="schema.fieldName"
              :schema="schema"
              :data="model"
              v-bind="getViewComponentProps(schema)"
            />
            <span
              v-else-if="
                resolveValue(schema.fieldName) !== undefined &&
                resolveValue(schema.fieldName) !== null
              "
            >
              {{ formatValue(schema, resolveValue(schema.fieldName)) }}
            </span>
            <span v-else class="empty-value">--</span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-view {
  width: 100%;
  max-height: none;
  overflow: visible;
}

/* 网格布局：配合 Tailwind grid-cols-* 使用 */
.detail-view--grid {
  display: grid;
  gap: 16px;
}

/* 垂直布局 */
.detail-view--vertical {
  .detail-view-item {
    flex-direction: column;
    gap: 4px;
  }

  .detail-view-label {
    width: auto !important;
    padding-right: 0;
    text-align: left !important;
  }
}

/* 行内布局 */
.detail-view--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;

  .detail-view-item {
    min-width: 200px;
    margin-bottom: 0;
  }
}

/* 每个 item */
.detail-view-item {
  display: flex;
  align-items: center;
  max-width: 100%;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 网格布局模式 item */
.detail-view-item--grid {
  margin-bottom: 0;
}

/* label 对齐方式 */
.detail-view-label--left {
  text-align: left;
}

.detail-view-label--right {
  text-align: right;
}

/* label 基础样式 */
.detail-view-label {
  flex-shrink: 0;
  padding-right: 12px;
  font-weight: 500;
  line-height: 24px;
  color: var(--el-text-color-secondary, #64748b);
}

/* 网格模式下 label 间距调整 */
.detail-view-item--grid .detail-view-label {
  flex-shrink: 0;
  padding-right: 8px;
}

.detail-view-value {
  flex: 1;
  min-width: 0;
  padding: 0 6px !important;
  line-height: 24px;
  color: var(--el-text-color-primary, #1e293b);
  word-break: break-all;
  overflow-wrap: break-word;
  background-color: var(--el-fill-color-light, #f5f6f8);
  border-radius: 2px !important;
}

.empty-value {
  padding: 0 6px !important;
  color: var(--el-text-color-placeholder, #94a3b8);
  background-color: var(--el-fill-color-light, #f5f6f8);
  border-radius: 2px !important;
}
</style>
