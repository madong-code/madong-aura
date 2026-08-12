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

  return `import {
${imports}
} from 'element-plus';

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
  };
}

export { viteVisualFormElementPlusPlugin };
