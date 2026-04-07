/**
 * v-blur 指令
 *
 * 为元素添加点击外部区域自动失焦的功能。
 * 当点击元素外部区域时，会触发元素的 blur 事件。
 *
 * ## 使用示例
 *
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <ElButton v-blur>点击外部失焦</ElButton>
 *
 *   <!-- 配合输入框使用 -->
 *   <ElInput v-blur placeholder="点击外部失焦" />
 * </template>
 * ```
 *
 * @module directives/blur
 * @author Art Design Pro Team
 */

import { App, DirectiveBinding } from 'vue'

export function setupBlurDirective(app: App) {
  app.directive('blur', {
    mounted(el: HTMLElement) {
      const handleClickOutside = (event: MouseEvent) => {
        if (el && !el.contains(event.target as Node)) {
          el.blur()
        }
      }

      el._blurClickOutsideHandler = handleClickOutside
      document.addEventListener('click', handleClickOutside)
    },
    unmounted(el: HTMLElement) {
      if (el._blurClickOutsideHandler) {
        document.removeEventListener('click', el._blurClickOutsideHandler)
        delete el._blurClickOutsideHandler
      }
    }
  })
}

// 扩展 HTMLElement 接口，添加自定义属性
interface HTMLElement {
  _blurClickOutsideHandler?: (event: MouseEvent) => void
}
