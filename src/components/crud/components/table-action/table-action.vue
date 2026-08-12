<script setup lang="ts">
import type { PropType } from 'vue';

import type { ActionItem, PopConfirm } from './types';

import { computed, h, reactive, toRaw } from 'vue';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessageBox,
  ElPopconfirm,
  ElSpace,
} from 'element-plus';

import { Icon } from '#/components/icon';
import { useAccess } from '#/core/access';
import { isBoolean, isFunction } from '#/core/shared';
import { $t } from '#/locales';

const props = defineProps({
  record: {
    type: Object as PropType<Record<string, any>>,
    default() {
      return {};
    },
  },
  actions: {
    type: Array as PropType<ActionItem[]>,
    default() {
      return [];
    },
  },
  dropDownActions: {
    type: Array as PropType<ActionItem[]>,
    default() {
      return [];
    },
  },
  divider: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: 'actionItemClick', record: any): void;
}>();

const renderIcon = (icon: any | string) => {
  if (typeof icon === 'string') {
    return h(Icon, { icon });
  }
  return h(icon);
};

const { hasAccessByCodes } = useAccess();

const hasAccess = (permCodes: string | unknown) => {
  if (permCodes) {
    return hasAccessByCodes([permCodes as string]);
  }
  return true;
};

const popconfirmRef = reactive<Record<string, any>>({});

function isIfShow(action: ActionItem): boolean {
  const ifShow = action.ifShow;
  let isIfShow = true;
  if (isBoolean(ifShow)) {
    isIfShow = ifShow;
  }
  if (ifShow && typeof ifShow === 'function') {
    isIfShow = ifShow(action, props.record);
  }
  return isIfShow;
}

const wrapConfirm = (action: ActionItem) => {
  const newAction = { ...action };

  if (action.confirm) {
    newAction.onClick = () => {
      emit('actionItemClick', props.record);
      const title =
        action.confirm?.title || $t('components.crud.action.confirm_title');
      const content =
        action.confirm?.content || $t('components.crud.action.confirm_content');
      const options: any = { ...action.confirm };
      if (!options.type) {
        options.type = 'warning';
      }
      const ok = options.ok;
      const cancel = options.cancel;
      delete options.title;
      delete options.content;
      ElMessageBox.confirm(content, title, options)
        .then(() => {
          if (ok && typeof ok === 'function') {
            ok(props.record);
          }
        })
        .catch(() => {
          if (cancel && typeof cancel === 'function') {
            cancel(props.record);
          }
        });
    };
  }

  if (action.dialogRef) {
    const params =
      (typeof action.dialogParams === 'function'
        ? action.dialogParams(props.record || {})
        : action.dialogParams) || {};
    const dialogRef = action.dialogRef;
    newAction.onClick = () => {
      if (isFunction((dialogRef.value || dialogRef).show)) {
        // 树形模式下新增子节点：将父节点的 id 映射为子节点的 pid
        let data = { ...props.record, ...params.data };
        if (params.tree && params.type === 'add') {
          const tree = params.tree;
          data = {
            [tree.pid]: props.record[tree.id],
          };
          if (params.data) {
            data = { ...data, ...params.data };
          }
        }
        (dialogRef.value || dialogRef).show({
          data,
          ...params,
        });
      }
    };
  }
  return newAction;
};

const getActions = computed(() => {
  return (toRaw(props.actions) || [])
    .filter((action) => {
      return hasAccess(action.auth) && isIfShow(action);
    })
    .toSorted((a, b) => (a.sort || 1000) - (b.sort || 1000))
    .map((action) => {
      let processedAction = wrapConfirm(action);
      if (
        processedAction.dynamicProps &&
        isFunction(processedAction.dynamicProps)
      ) {
        processedAction = {
          ...processedAction,
          ...processedAction.dynamicProps(props.record || {}),
        };
      }
      const { popConfirm } = processedAction;
      const icon = processedAction.icon
        ? renderIcon(processedAction.icon)
        : undefined;
      return {
        ...processedAction,
        ...popConfirm,
        icon,
        onConfirm: popConfirm?.confirm,
        onCancel: popConfirm?.cancel,
        enable: !!popConfirm,
      };
    });
});

const getDropdownList = computed((): any[] => {
  return (toRaw(props.dropDownActions) || [])
    .filter((action) => {
      return hasAccess(action.auth) && isIfShow(action);
    })
    .toSorted((a, b) => (a.sort || 1000) - (b.sort || 1000))
    .map((action, index) => {
      let processedAction = wrapConfirm(action);
      if (
        processedAction.dynamicProps &&
        isFunction(processedAction.dynamicProps)
      ) {
        processedAction = {
          ...processedAction,
          ...processedAction.dynamicProps(props.record || {}),
        };
      }
      const { label, popConfirm } = processedAction;
      return {
        ...processedAction,
        ...popConfirm,
        onConfirm: popConfirm?.confirm,
        onCancel: popConfirm?.cancel,
        text: label,
        divider:
          index < props.dropDownActions.length - 1 ? props.divider : false,
      };
    });
});

const getPopConfirmProps = (attrs: PopConfirm) => {
  const originAttrs: any = { ...attrs };
  delete originAttrs.icon;
  if (attrs.confirm && isFunction(attrs.confirm)) {
    const confirm = attrs.confirm;
    originAttrs.onConfirm = (e: Event) => {
      confirm(e, props.record);
    };
    delete originAttrs.confirm;
  }
  if (attrs.cancel && isFunction(attrs.cancel)) {
    const cancel = attrs.cancel;
    originAttrs.onCancel = () => {
      cancel(props.record);
    };
    delete originAttrs.cancel;
  }
  return originAttrs;
};

const getButtonProps = (action: any): any => {
  const onClick = action.onClick;
  const res: any = { ...action };
  if (onClick) {
    res.onClick = (e: Event) => {
      emit('actionItemClick', props.record);
      onClick(e, props.record);
    };
  }
  res.type = action.type || 'primary';
  return res;
};

const handleCommand = (index: number) => {
  const action = getDropdownList.value[index];
  if (action.onClick && isFunction(action.onClick)) {
    emit('actionItemClick', props.record);
    action.onClick(action, props.record);
  } else {
    const currentPopconfirmRef = popconfirmRef[index.toString()];
    emit('actionItemClick', props.record);
    currentPopconfirmRef?.click(action, props.record);
  }
};

const handleRef = (e: any, index: number) => {
  popconfirmRef[index.toString()] = e;
};
</script>

<template>
  <div class="m-table-action">
    <ElSpace :size="2">
      <template v-for="(action, index) in getActions" :key="index">
        <ElPopconfirm
          v-if="action.popConfirm"
          v-bind="getPopConfirmProps(action.popConfirm)"
        >
          <template #reference>
            <ElButton v-bind="getButtonProps(action)">
              {{ action.label }}
            </ElButton>
          </template>
        </ElPopconfirm>
        <ElButton v-else v-bind="getButtonProps(action)">
          {{ action.label }}
        </ElButton>
      </template>
    </ElSpace>

    <ElDropdown
      v-if="getDropdownList.length > 0"
      trigger="hover"
      @command="handleCommand"
    >
      <slot name="more">
        <ElButton link type="primary">
          {{ $t('components.crud.action.more') }}
          <template #icon>
            <Icon icon="ant-design:bars-outlined" />
          </template>
        </ElButton>
      </slot>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            :disabled="action.disabled"
            v-for="(action, index) in getDropdownList"
            :key="index"
            :command="index"
          >
            <Icon v-if="action.icon" :icon="action.icon" />
            <span style="margin-left: 8px">{{ action.label }}</span>
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
    <!-- 隐藏的 Popconfirm，用于下拉菜单项的确认提示 -->
    <template v-for="(action, index) in getDropdownList" :key="`pop-${index}`">
      <ElPopconfirm
        v-if="action.popConfirm"
        v-bind="getPopConfirmProps(action.popConfirm)"
      >
        <template #reference>
          <span :ref="(e) => handleRef(e, index)" style="display: none"></span>
        </template>
      </ElPopconfirm>
    </template>
  </div>
</template>

<style scoped>
.m-table-action {
  display: inline-flex;
  gap: 2px;
  align-items: center;
}
</style>
