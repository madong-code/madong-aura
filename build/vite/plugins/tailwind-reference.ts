import type { Plugin } from 'vite';

/**
 * Auto-inject `@reference "@vben/tailwind-config/theme";` into Vue SFC
 * `<style>` blocks that use `@apply`.
 *
 * In Tailwind CSS v4, each Vue SFC `<style scoped>` block is processed as
 * an independent CSS module. If a style block uses `@apply` with custom
 * theme utilities (e.g. `bg-primary`, `text-foreground`, `border-border`,
 * `bg-card`, `text-muted-foreground`), it needs access to the `@theme`
 * definition via `@reference`. This plugin auto-injects it so individual
 * components don't need to add it manually.
 *
 * art-admin 说明：
 * - 上游 template/admin 直接使用 npm 包 `@vben/tailwind-config`；
 * - art-admin 将其复制到 `tooling/tailwind-config/` 并通过
 *   `"@vben/tailwind-config": "file:tooling\\tailwind-config"` 注册为本地包，
 *   因此 `@reference "@vben/tailwind-config/theme"` 解析路径与上游一致。
 * - 之前缺少本插件，导致 core/ui/* 里大量 `<style>` 块的 `@apply` 找不到
 *   主题 token（--color-card / --color-border / --color-muted-foreground 等），
 *   进而表现为表单间距过大、按钮/表格颜色异常。
 */
const REFERENCE_LINE = '@reference "@vben/tailwind-config/theme";\n';

export function viteTailwindReferencePlugin(): Plugin {
  return {
    enforce: 'pre',
    name: 'vite:tailwind-reference',
    transform(code, id) {
      // Only process Vue SFC style blocks
      if (!id.includes('.vue')) {
        return null;
      }
      if (!id.includes('type=style')) {
        return null;
      }
      // Skip if already has @reference
      if (code.includes('@reference')) {
        return null;
      }
      // Only inject if the style block uses @apply
      if (!code.includes('@apply')) {
        return null;
      }
      return {
        code: REFERENCE_LINE + code,
        map: null,
      };
    },
  };
}