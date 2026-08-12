import type {
  AuthDirective,
  RolesDirective,
  RippleDirective,
  HighlightDirective
} from '#/core/directives'

declare module 'vue' {
  export interface GlobalDirectives {
    vAuth: AuthDirective
    vRoles: RolesDirective
    vRipple: RippleDirective
    vHighlight: HighlightDirective
  }
}
