<script setup lang="ts">
  import type { ActionItem, PopConfirm } from './types'

  import { computed, h, type PropType, reactive, toRaw, type VNode } from 'vue'
  import { Icon } from '../icon'
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElMessageBox,
    ElPopconfirm,
    ElSpace
  } from 'element-plus'
  import { useAuth } from '@/composables/useAuth'
  import { isBoolean, isFunction } from 'lodash-es'

  const props = defineProps({
    record: {
      // 行数据
      type: Object,
      default() {
        return {}
      }
    },
    actions: {
      type: Array as PropType<ActionItem[]>,
      default() {
        return []
      }
    },
    dropDownActions: {
      type: Array as PropType<ActionItem[]>,
      default() {
        return []
      }
    },
    divider: {
      type: Boolean,
      default: true
    }
  })
  const renderIcon = (icon: string | VNode) => {
    if (typeof icon === 'string') {
      return h(Icon, { icon })
    }
    return h(icon)
  }
  const { hasAuth } = useAuth()
  const hasAccessByCodes = (permCodes: string | unknown) => {
    if (permCodes) {
      return hasAuth(permCodes as string)
    }
    return true
  }

  const popconfirmRef = reactive<any>({})
  function isIfShow(action: ActionItem): boolean {
    const ifShow = action.ifShow

    let isIfShow = true

    if (isBoolean(ifShow)) {
      isIfShow = ifShow
    }
    if (ifShow && typeof ifShow === 'function') {
      isIfShow = ifShow(action)
    }
    return isIfShow
  }

  const wrapConfirm = (action: ActionItem) => {
    if (action.confirm) {
      // 重写点击事件
      action.onClick = () => {
        const title = action.confirm.title || '提示'
        const content = action.confirm.content || '确定要执行此操作吗？'
        const options = action.confirm
        if (!options.type) {
          options.type = 'warning'
        }
        const ok = options.ok
        const cancel = options.cancel
        delete options.title
        delete options.content
        ElMessageBox.confirm(content, title, options)
          .then(() => {
            if (ok && typeof ok === 'function') {
              ok(props.record)
            }
          })
          .catch(() => {
            if (cancel && typeof cancel === 'function') {
              cancel(props.record)
            }
          })
      }
    }
    // 如果存在dialogRef，则直接调用show方法
    if (action.dialogRef) {
      const params =
        typeof action.dialogParams === 'function'
          ? action.dialogParams(props.record)
          : action.dialogParams
      const dialogRef = action.dialogRef
      action.onClick = () => {
        if (isFunction((dialogRef.value || dialogRef).show)) {
          ;(dialogRef.value || dialogRef).show({
            data: props.record,
            ...params
          })
        }
      }
    }
    return action
  }
  const getActions = computed(() => {
    return (toRaw(props.actions) || [])
      .filter((action) => {
        return hasAccessByCodes(action.auth) && isIfShow(action)
      })
      .map((action) => {
        action = wrapConfirm(action)
        const { popConfirm } = action
        const icon = action.icon ? renderIcon(action.icon) : undefined
        return {
          // getPopupContainer: document.body,
          ...action,
          ...popConfirm,
          icon,
          onConfirm: popConfirm?.confirm,
          onCancel: popConfirm?.cancel,
          enable: !!popConfirm
        }
      })
  })
  const getDropdownList = computed((): any[] => {
    return (toRaw(props.dropDownActions) || [])
      .filter((action) => {
        return hasAccessByCodes(action.auth) && isIfShow(action)
      })
      .map((action, index) => {
        action = wrapConfirm(action)
        const { label, popConfirm } = action
        return {
          ...action,
          ...popConfirm,
          onConfirm: popConfirm?.confirm,
          onCancel: popConfirm?.cancel,
          text: label,
          divider: index < props.dropDownActions.length - 1 ? props.divider : false
        }
      })
  })
  const getPopConfirmProps = (attrs: PopConfirm) => {
    const originAttrs: any = attrs
    delete originAttrs.icon
    if (attrs.confirm && isFunction(attrs.confirm)) {
      const confirm = attrs.confirm
      originAttrs.onConfirm = (e: Event) => {
        confirm(e, props.record)
      }
      delete originAttrs.confirm
    }
    if (attrs.cancel && isFunction(attrs.cancel)) {
      const cancel = attrs.cancel
      originAttrs.onCancel = () => {
        cancel(props.record)
      }
      delete originAttrs.cancel
    }
    return originAttrs
  }
  const getButtonProps = (action: ActionItem): any => {
    const onClick = action.onClick
    if (onClick) {
      action.onClick = (e: Event) => {
        onClick(e, props.record)
      }
    }
    const res = {
      ...action,
      type: action.type || 'primary'
    }
    return res
  }
  const handleCommand = (index: number) => {
    const action = getDropdownList.value[index]
    if (action.onClick && isFunction(action.onClick)) {
      action.onClick(action, props.record)
    } else {
      const currentPopconfirmRef = popconfirmRef[index.toString()]
      currentPopconfirmRef?.click(action, props.record)
    }
  }
  const handleRef = (e: any, index: number) => {
    popconfirmRef[index.toString()] = e
  }
</script>

<template>
  <div class="m-table-action">
    <ElSpace :size="2">
      <template v-for="(action, index) in getActions" :key="index">
        <ElPopconfirm v-if="action.popConfirm" v-bind="getPopConfirmProps(action.popConfirm)">
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

    <ElDropdown v-if="getDropdownList.length > 0" trigger="hover" @command="handleCommand">
      <template #default>
        <div>
          <span style="margin-left: 6px">
            <slot name="more">
              <ElButton link size="small" type="primary">
                <template #icon>
                  <Icon class="icon-more" icon="&#xe6dd;" />
                </template>
              </ElButton>
            </slot>
          </span>
          <template v-for="(action, index) in getDropdownList" :key="index">
            <ElPopconfirm v-if="action.popConfirm" v-bind="getPopConfirmProps(action.popConfirm)">
              <template #reference>
                <span :ref="(e) => handleRef(e, index)"></span>
              </template>
            </ElPopconfirm>
          </template>
        </div>
      </template>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem v-for="(action, index) in getDropdownList" :key="index" :command="index">
            <Icon v-if="action.icon" :icon="action.icon" />
            {{ action.label }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>
