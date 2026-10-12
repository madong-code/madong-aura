import type { App, Component, Plugin } from 'vue';

import { getCurrentInstance, onBeforeMount, ref } from 'vue';
import * as Vue from 'vue';

import visualFormUmdUrl from '#lib/visual-form/designer.umd.js?url';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { installVisualFormElementPlus } from 'virtual:visual-form-element-plus';

type NamedComponent = Component & { name?: string };

interface VisualFormModule {
  install?: (app: App) => void;
  VFormDesigner?: NamedComponent;
  VFormRender?: NamedComponent;
}

const visualFormRuntime = globalThis as typeof globalThis & {
  ElementPlusIconsVue?: typeof ElementPlusIconsVue;
  VFormDesigner?: VisualFormModule;
  Vue?: typeof Vue;
};

const installedApps = new WeakSet<App>();
let modulePromise: null | Promise<VisualFormModule> = null;

async function loadVisualFormModule() {
  if (visualFormRuntime.VFormDesigner) {
    return visualFormRuntime.VFormDesigner;
  }

  if (!modulePromise) {
    modulePromise = (async () => {
      visualFormRuntime.Vue = Vue;
      visualFormRuntime.ElementPlusIconsVue = ElementPlusIconsVue;

      await import('element-plus/theme-chalk/dark/css-vars.css');
      await import('#lib/visual-form/designer.style.css');
      await import('./style.css');

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = visualFormUmdUrl;
        script.dataset.visualFormLoader = 'true';
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener(
          'error',
          () => {
            script.remove();
            reject(new Error('VForm3 UMD 脚本加载失败'));
          },
          { once: true },
        );
        document.head.append(script);
      });

      const visualFormModule = visualFormRuntime.VFormDesigner;
      if (!visualFormModule) {
        throw new Error('全局 VFormDesigner 未定义');
      }

      return visualFormModule;
    })().catch((error) => {
      modulePromise = null;
      throw error;
    });
  }

  return modulePromise;
}

export async function installVisualForm(app: App) {
  // 检查是否已安装过（但也要验证组件是否真的注册了）
  if (installedApps.has(app)) {
    // 即使标记为已安装，也要验证关键组件是否真的注册了
    // 因为 bootstrap 阶段可能中途失败
    const vFormRender = visualFormRuntime.VFormDesigner?.VFormRender;
    if (vFormRender?.name) {
      try {
        const existing = app.component(vFormRender.name);
        if (existing) {
          console.log(
            '[VisualForm] VFormRender already registered, skip install',
          );
          return;
        }
      } catch {
        // 查询失败，继续尝试注册
      }
    }
    console.warn(
      '[VisualForm] Marked as installed but component missing, re-installing...',
    );
  }

  try {
    installVisualFormElementPlus(app);
  } catch (e) {
    console.warn('[VisualForm] installVisualFormElementPlus failed:', e);
    // Element Plus 组件安装失败不影响 VForm3 本身，继续执行
  }

  const visualFormModule = await loadVisualFormModule();

  try {
    if (typeof visualFormModule.install === 'function') {
      console.log('[VisualForm] Installing via plugin install method...');
      app.use(visualFormModule as Plugin);
    } else {
      console.log(
        '[VisualForm] Installing via manual component registration...',
      );
      const components = [
        visualFormModule.VFormDesigner,
        visualFormModule.VFormRender,
      ];
      for (const component of components) {
        if (component?.name) {
          app.component(component.name, component);
          console.log('[VisualForm] Registered component:', component.name);
        }
      }
    }

    installedApps.add(app);
    console.log('[VisualForm] Installation completed successfully');
  } catch (e) {
    console.error('[VisualForm] Installation failed:', e);
    // 即使 install 方法失败，也尝试手动注册核心组件
    try {
      const components = [
        visualFormModule.VFormDesigner,
        visualFormModule.VFormRender,
      ];
      for (const component of components) {
        if (component?.name) {
          app.component(component.name, component);
          console.log(
            '[VisualForm] Fallback: registered component:',
            component.name,
          );
        }
      }
      installedApps.add(app);
    } catch (e2) {
      console.error('[VisualForm] Fallback registration also failed:', e2);
      throw e2;
    }
  }
}

export function useVForm() {
  const isReady = ref(false);
  const error = ref<null | string>(null);

  onBeforeMount(async () => {
    try {
      const app = getCurrentInstance()?.appContext.app;
      if (!app) {
        throw new Error('无法获取 Vue 应用实例');
      }

      await installVisualForm(app);
      isReady.value = true;
    } catch (error_) {
      const message = `VForm3 加载失败: ${
        error_ instanceof Error ? error_.message : String(error_)
      }`;
      console.error(message, error_);
      error.value = message;
    }
  });

  return { error, isReady };
}
