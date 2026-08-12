import type { Component } from 'vue';

import { h, markRaw } from 'vue';

const componentMap = new Map<string, Component>();
const componentObj = import.meta.glob('./components/**/index.vue', {
  eager: true,
});

function toPascalCase(str: string): string {
  // 支持 flat.vue 和 dir/index.vue 两种模式
  const parts = str.split('/');
  const fileName = parts.pop()?.replace('.vue', '') || '';
  // index.vue → 使用目录名
  const name = fileName === 'index' ? parts.pop() || '' : fileName;
  // 添加 Read 前缀
  const pascalName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
  return `Read${pascalName}`;
}

Object.keys(componentObj).forEach((key) => {
  const componentName = toPascalCase(key);
  if (!componentName) return;
  const comm: any = componentObj[key];
  if (comm) {
    addComponent(componentName, markRaw(comm.default as Component));
  }
});

export function getComponent(name: string) {
  return componentMap.get(name);
}

export function addComponent(name: string, component: Component) {
  componentMap.set(name, component);
}

export function removeComponent(name: string) {
  componentMap.delete(name);
}

export function hasComponent(name: string) {
  return componentMap.has(name);
}

export function getAllComponents() {
  return componentMap;
}

export function registerReaderComponentToVxe(vxeUI: any) {
  componentMap.forEach((comp, key) => {
    vxeUI.renderer.add(key, {
      renderDefault(renderOpts: any, params: any) {
        const { row, column } = params;
        const value = row[column.field];
        return h(comp, {
          ...renderOpts.props,
          value,
        });
      },
    });
  });
}
