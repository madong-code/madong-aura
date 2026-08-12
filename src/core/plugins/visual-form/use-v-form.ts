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
  if (installedApps.has(app)) return;

  installVisualFormElementPlus(app);
  const visualFormModule = await loadVisualFormModule();

  if (typeof visualFormModule.install === 'function') {
    app.use(visualFormModule as Plugin);
  } else {
    const components = [
      visualFormModule.VFormDesigner,
      visualFormModule.VFormRender,
    ];
    for (const component of components) {
      if (component?.name) {
        app.component(component.name, component);
      }
    }
  }

  installedApps.add(app);
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
