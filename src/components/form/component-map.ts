import type { Component } from 'vue';

import { markRaw } from 'vue';

const componentMap = new Map<string, Component>();

/**
 * 将 kebab-case 转换为 PascalCase
 * input-number => InputNumber
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

// 自动扫描所有子目录中的 index.vue
const modules = import.meta.glob('./components/**/index.vue', {
  eager: true,
}) as Record<string, { default: Component }>;

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\/components\/([^/]+)\/index\.vue$/);
  if (match?.[1]) {
    const name = toPascalCase(match[1]);
    add(name, markRaw(mod.default));
  }
}

// 自动扫描根目录下的 *.vue 文件
const flatModules = import.meta.glob('./components/*.vue', {
  eager: true,
}) as Record<string, { default: Component }>;

for (const [path, mod] of Object.entries(flatModules)) {
  const match = path.match(/\/components\/([^/]+)\.vue$/);
  if (match?.[1]) {
    const name = toPascalCase(match[1]);
    add(name, markRaw(mod.default));
  }
}

import.meta.env.DEV &&
  console.warn('[component-map] 扫描到的组件:', [...componentMap.keys()]);

/**
 * 添加组件
 */
export function add(name: string, component: Component) {
  componentMap.set(name, component);
}

/**
 * 删除组件
 */
export function del(name: string) {
  componentMap.delete(name);
}

/**
 * 获取组件
 */
export function get(name: string): Component | undefined {
  return componentMap.get(name);
}

/**
 * 查询组件是否存在
 */
export function has(name: string): boolean {
  return componentMap.has(name);
}

/**
 * 获取所有组件
 */
export function getAll(): Map<string, Component> {
  return componentMap;
}

/**
 * 将已扫描的组件注册到全局共享状态
 */
export function registerToGlobalState(components: Record<string, Component>) {
  componentMap.forEach((value, key) => {
    components[key] = value;
  });
}

export { componentMap };
export default componentMap;
