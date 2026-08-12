import type { RouteRecordStringComponent } from '#/core/shared/types';

import { $t } from '#/locales';

/** 插件路由定义类型：component 可选，无 component 但有 children 时自动渲染为 RouterView 容器 */
type PluginRoute = Omit<
  RouteRecordStringComponent,
  'children' | 'component'
> & {
  children?: PluginRoute[];
  component?: string;
};

// 一级菜单：代码生成
// 二级菜单（精简为两个业务板块，直接归类到 views/ 下）：
//   generate/  生成代码（列表 + 导入数据库抽屉 + 编辑 tab 页）
//   table/     数据表维护
const routes: PluginRoute[] = [
  {
    path: '/codegen',
    name: 'Codegen',
    meta: {
      title: $t('codegen.generate.menu'),
      icon: 'lucide:code-2',
      order: 100,
      constant: false,
    },
    children: [
      {
        path: '/codegen',
        name: 'CodegenGenerate',
        component: 'generate/index',
        meta: {
          title: $t('codegen.generate.menu_generate'),
          icon: 'lucide:table',
        },
      },
      {
        path: '/codegen/generator',
        name: 'CodegenGenerator',
        component: 'generate/generator',
        meta: {
          title: $t('codegen.generate.menu_generator'),
          icon: 'lucide:file-code-2',
          hideInMenu: true,
        },
      },
      {
        path: '/codegen/table',
        name: 'CodegenTable',
        component: 'table/index',
        meta: {
          title: $t('codegen.table.menu_table'),
          icon: 'lucide:database',
        },
      },
    ],
  },
];

export default routes;
