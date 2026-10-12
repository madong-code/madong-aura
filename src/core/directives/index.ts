import type { App } from 'vue'
import { setupAuthDirective, type AuthDirective } from './auth'
import { setupHighlightDirective, type HighlightDirective } from './highlight'
import { setupRippleDirective, type RippleDirective } from './ripple'
import { setupRolesDirective, type RolesDirective } from './roles'

export function setupGlobDirectives(app: App) {
  setupAuthDirective(app) // 权限指令
  setupRolesDirective(app) // 角色权限指令
  setupHighlightDirective(app) // 高亮指令
  setupRippleDirective(app) // 水波纹指令
}

export type { AuthDirective, HighlightDirective, RippleDirective, RolesDirective }
