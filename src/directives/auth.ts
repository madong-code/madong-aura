import { router } from '@/router'
import { App, Directive, DirectiveBinding, watch } from 'vue'
import { useUserStore } from '@/store/modules/user'

interface AuthBinding extends DirectiveBinding {
  value: string
}

function checkAuthPermission(el: HTMLElement, binding: AuthBinding): void {
  // 获取当前路由的权限列表
  const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []

  // 检查是否有对应的权限标识
  const hasPermission = authList.some((item) => item.authMark === binding.value)

  const userStore = useUserStore()
  const permsCodes: string[] = userStore.info.buttons || []

  // 如果权限码为空，设置监听器等待数据加载
  if ((!hasPermission && permsCodes.length === 0) || permsCodes.length === 0) {
    let isHandled = false // 标记是否已处理

    // 设置超时机制，避免无限等待
    const timeoutId = setTimeout(() => {
      if (!isHandled) {
        isHandled = true
        // 超时后默认移除元素（或者根据业务需求保留元素）
        removeElement(el)
        if (stopWatcher) stopWatcher() // 清理监听器
      }
    }, 10000) // 10秒超时

    // 监听权限码变化
    const stopWatcher = watch(
      () => userStore.getPermCodes,
      (newPermsCodes) => {
        if (!isHandled && newPermsCodes && newPermsCodes.length > 0) {
          isHandled = true
          clearTimeout(timeoutId) // 清除超时
          checkPermission(el, binding, newPermsCodes)
          stopWatcher() // 停止监听
        }
      }
    )

    // 添加组件卸载时的清理逻辑
    el.__auth__cleanup = () => {
      if (!isHandled) {
        isHandled = true
        clearTimeout(timeoutId)
        if (stopWatcher) stopWatcher()
      }
    }

    return
  }

  checkPermission(el, binding, permsCodes)
}

function checkPermission(el: HTMLElement, binding: AuthBinding, permsCodes: string[]): void {
  console.log('permsCodes', permsCodes)
  let hasPermission = false
  if (permsCodes.includes('admin') || permsCodes.includes('*')) {
    hasPermission = true
  } else {
    hasPermission = permsCodes.includes(binding.value)
  }

  // 如果没有权限，移除元素
  if (!hasPermission) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: Directive = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission,
  unmounted: (el: HTMLElement) => {
    // 组件卸载时清理资源
    if (el.__auth__cleanup) {
      el.__auth__cleanup()
      delete el.__auth__cleanup
    }
  }
}

// 扩展HTMLElement接口
declare global {
  interface HTMLElement {
    __auth__cleanup?: () => void
  }
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
