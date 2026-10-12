import type {
  AuthDirective,
  RolesDirective,
  RippleDirective,
  HighlightDirective
} from './index'

declare module 'vue' {
  export interface GlobalDirectives {
    vAuth: AuthDirective
    vRoles: RolesDirective
    vRipple: RippleDirective
    vHighlight: HighlightDirective
  }
}
