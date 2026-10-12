/**
 * primitives 最小子集垫片
 *
 * madong-art 仅迁移 dashboard widgets / fallback / 插件兼容实际使用到的 vben
 * primitives：Card 家族、Tabs、Avatar、Checkbox、Button、Popover、Tooltip、
 * Spinner、SpineText、VbenIcon 等。组件实现与 madong-single 保持逐字一致，
 * 底层无头交互基于 reka-ui。
 */
export * from './components';
export * from './ui';
export { createContext, Slot, VisuallyHidden } from 'reka-ui';
