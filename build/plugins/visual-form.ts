import type { Plugin } from 'vite';

import { readFileSync } from 'node:fs';

const VIRTUAL_MODULE_ID = 'virtual:visual-form-element-plus';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}.js`;

interface ElementPlusDependency {
  exportName: string;
  moduleName: string;
}

interface VisualFormElementPlusPluginOptions {
  umdPath: string;
}

const elementPlusServices: ElementPlusDependency[] = [
  { exportName: 'ElLoading', moduleName: 'loading' },
  { exportName: 'ElMessage', moduleName: 'message' },
  { exportName: 'ElMessageBox', moduleName: 'message-box' },
];

function createVirtualModule(dependencies: ElementPlusDependency[]) {
  const componentDependencies = dependencies.filter(
    ({ exportName }) =>
      !elementPlusServices.some((service) => service.exportName === exportName),
  );
  const imports = dependencies
    .map(({ exportName }) => `  ${exportName},`)
    .join('\n');
  const components = componentDependencies
    .map(({ exportName }) => `  ${exportName},`)
    .join('\n');
  // unplugin-element-plus（useSource 样式注入）不转换 \0virtual: 模块，
  // 此处必须显式引入全部被扫描组件的样式；否则宿主业务中从未使用的
  // Element Plus 布局组件（el-container/el-aside/el-main）样式缺失，
  // 设计器 flex 布局会塌缩（右侧留白、折叠箭头错位）。
  const styleImports = dependencies
    .map(
      ({ moduleName }) =>
        `import 'element-plus/es/components/${moduleName}/style/css';`,
    )
    .join('\n');

  return `import {
${imports}
} from 'element-plus';
${styleImports}

const components = [
${components}
];
const installedApps = new WeakSet();

export function installVisualFormElementPlus(app) {
  if (installedApps.has(app)) return;

  for (const component of components) {
    app.use(component);
  }

  if (app.directive('loading') !== ElLoading.directive) {
    app.directive('loading', ElLoading.directive);
  }
  app.config.globalProperties.$loading = ElLoading.service;
  app.use(ElMessage);
  app.use(ElMessageBox);

  installedApps.add(app);
}
`;
}

function kebabToElementPlusExportName(name: string) {
  const pascalName = name
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');

  return `El${pascalName}`;
}

function scanElementPlusDependencies(umdPath: string) {
  const source = readFileSync(umdPath, 'utf8');
  const componentNames = new Set<string>();
  const componentPattern = /resolveComponent\((["'])(el-[a-z0-9-]+)\1\)/g;

  for (const match of source.matchAll(componentPattern)) {
    const tagName = match[2];
    if (tagName && !tagName.startsWith('el-icon-')) {
      componentNames.add(tagName.slice(3));
    }
  }

  if (componentNames.size === 0) {
    throw new Error(
      `[visual-form] No Element Plus components found in ${umdPath}`,
    );
  }

  const components = [...componentNames].toSorted().map((moduleName) => ({
    exportName: kebabToElementPlusExportName(moduleName),
    moduleName,
  }));

  return [...components, ...elementPlusServices];
}

function viteVisualFormElementPlusPlugin({
  umdPath,
}: VisualFormElementPlusPluginOptions): Plugin {
  return {
    name: 'vite-visual-form-element-plus',
    enforce: 'pre',
    config() {
      const dependencies = scanElementPlusDependencies(umdPath);
      return {
        optimizeDeps: {
          include: dependencies.map(
            ({ moduleName }) =>
              `element-plus/es/components/${moduleName}/style/css`,
          ),
        },
      };
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return null;

      this.addWatchFile(umdPath);
      return createVirtualModule(scanElementPlusDependencies(umdPath));
    },
    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : null;
    },
    configureServer(server) {
      // UMD 以经典 <script> 方式注入，dev 下须原样分发；
      // 否则会被 Vite 转换管线改写为 ESM（顶部注入 import），导致
      // “Cannot use import statement outside a module” 且全局 VFormDesigner 不挂载
      server.middlewares.use((req, res, next) => {
        // 仅拦截经典脚本的无查询串请求；?url 等模块请求必须走 Vite 转换管线
        if (req.method === 'GET' && req.url === '/lib/visual-form/designer.umd.js') {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(readFileSync(umdPath));
          return;
        }
        next();
      });
    },
  };
}

export { viteVisualFormElementPlusPlugin };
