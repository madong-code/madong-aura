<script setup lang="ts">
  import type { ActionItem, PopConfirm } from './types'

  import { computed, h, type PropType, reactive, toRaw, type VNode } from 'vue'
  import { Icon } from '../icon'
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElPopconfirm,
    ElSpace
  } from 'element-plus'
  import { useAuth } from '@/composables/useAuth'

  const props = defineProps({
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
  const isBoolean = (val: any) => {
    return typeof val === 'boolean'
  }
  const isFunction = <T extends (...args: any[]) => any>(value: unknown): value is T => {
    return typeof value === 'function'
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

  const getActions = computed(() => {
    return (toRaw(props.actions) || [])
      .filter((action) => {
        return hasAccessByCodes(action.auth) && isIfShow(action)
      })
      .map((action) => {
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
      originAttrs.onConfirm = attrs.confirm
      delete originAttrs.confirm
    }
    if (attrs.cancel && isFunction(attrs.cancel)) {
      originAttrs.onCancel = attrs.cancel
      delete originAttrs.cancel
    }
    return originAttrs
  }
  const getButtonProps = (action: ActionItem): any => {
    const res = {
      ...action,
      type: action.type || 'primary'
    }
    return res
  }
  const handleCommand = (index: number) => {
    const action = getDropdownList.value[index]
    if (action.onClick && isFunction(action.onClick)) {
      action.onClick()
    } else {
      const currentPopconfirmRef = popconfirmRef[index.toString()]
      currentPopconfirmRef?.click()
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
        <ElButton v-else v-bind="getButtonProps(action)" @click="action.onClick">
          {{ action.label }}
        </ElButton>
      </template>
    </ElSpace>

    <ElDropdown v-if="getDropdownList.length > 0" trigger="hover" @command="handleCommand">
      <template #default>
        <div>
          <slot name="more">
            <ElButton link size="small" style="margin-left: 6px" type="primary">
              <template #icon>
                <Icon class="icon-more" icon="&#xe6dd;" />
              </template>
            </ElButton>
          </slot>
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
