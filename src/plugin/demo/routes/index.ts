import type { RouteRecordStringComponent } from '#/core/shared/types';

/**
 * 插件路由定义类型：component 可选，无 component 但有 children 时自动渲染为 RouterView 容器
 */
type PluginRoute = Omit<
  RouteRecordStringComponent,
  'children' | 'component'
> & {
  children?: PluginRoute[];
  component?: null | string;
};

/**
 * demo 插件前端路由定义（开发环境）。
 *
 * 本文件由插件包 resource/data/menu/admin.php（后端 sys_menu 种子）转换生成，
 * 仅供 dev scanner 扫描合并：开发环境下无需后端配置菜单即可访问插件页面。
 * 生产环境菜单始终以后端安装插件时写入的 sys_menu 为权威（source='plugin:demo'，
 * 后端自动注入 meta.module='demo'），插件目录与菜单 code 均为 demo，
 * 故 dev 与生产解析到的组件路径完全一致。
 *
 * 字段语义同后端菜单：component 为相对 src/plugin/demo/views/ 的裸路径，
 * 根节点使用 BasicLayout 布局哨兵；scanner 会为非布局节点注入 meta.module='demo'。
 */
const routes: PluginRoute[] =   [
    {
      "name": "demo",
      "path": "/demo",
      "component": "BasicLayout",
      "redirect": "/demo/crud/basic",
      "meta": {
        "title": "示例演示",
        "icon": "lucide:flask-conical",
        "order": 9999,
        "keepAlive": false,
        "hideInMenu": false
      },
      "children": [
        {
          "name": "demo:crud",
          "path": "/demo/crud",
          "component": null,
          "redirect": "/demo/crud/basic",
          "meta": {
            "title": "CRUD 示例",
            "icon": "lucide:database",
            "order": 1,
            "keepAlive": false,
            "hideInMenu": false
          },
          "children": [
            {
              "name": "demo:crud:basic",
              "path": "/demo/crud/basic",
              "component": "crud/basic",
              "redirect": "",
              "meta": {
                "title": "基础表格",
                "icon": "lucide:file-spreadsheet",
                "order": 1,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:crud:tree",
              "path": "/demo/crud/tree",
              "component": "crud/tree",
              "redirect": "",
              "meta": {
                "title": "树形表格",
                "icon": "lucide:git-fork",
                "order": 2,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:crud:drawer",
              "path": "/demo/crud/drawer",
              "component": "crud/drawer",
              "redirect": "",
              "meta": {
                "title": "抽屉模式",
                "icon": "lucide:panel-right-open",
                "order": 3,
                "keepAlive": false,
                "hideInMenu": false
              }
            }
          ]
        },
        {
          "name": "demo:form",
          "path": "/demo/form",
          "component": null,
          "redirect": "/demo/form/overview",
          "meta": {
            "title": "表单示例",
            "icon": "lucide:clipboard-list",
            "order": 2,
            "keepAlive": false,
            "hideInMenu": false
          },
          "children": [
            {
              "name": "demo:form:overview",
              "path": "/demo/form/overview",
              "component": "form/overview",
              "redirect": "",
              "meta": {
                "title": "表单总览",
                "icon": "lucide:layout-dashboard",
                "order": 1,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:basic",
              "path": "/demo/form/basic",
              "component": "form/basic",
              "redirect": "",
              "meta": {
                "title": "基础表单",
                "icon": "lucide:file-text",
                "order": 2,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:query",
              "path": "/demo/form/query",
              "component": "form/query",
              "redirect": "",
              "meta": {
                "title": "查询表单",
                "icon": "lucide:search",
                "order": 3,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:rules",
              "path": "/demo/form/rules",
              "component": "form/rules",
              "redirect": "",
              "meta": {
                "title": "表单校验",
                "icon": "lucide:shield-check",
                "order": 4,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:dynamic",
              "path": "/demo/form/dynamic",
              "component": "form/dynamic",
              "redirect": "",
              "meta": {
                "title": "动态表单",
                "icon": "lucide:git-branch",
                "order": 5,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:api",
              "path": "/demo/form/api",
              "component": "form/api",
              "redirect": "",
              "meta": {
                "title": "表单API",
                "icon": "lucide:code-2",
                "order": 6,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:merge",
              "path": "/demo/form/merge",
              "component": "form/merge",
              "redirect": "",
              "meta": {
                "title": "合并表单",
                "icon": "lucide:combine",
                "order": 7,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:form:custom-layout",
              "path": "/demo/form/custom-layout",
              "component": "form/custom-layout",
              "redirect": "",
              "meta": {
                "title": "自定义布局",
                "icon": "lucide:panels-top-left",
                "order": 8,
                "keepAlive": false,
                "hideInMenu": false
              }
            }
          ]
        },
        {
          "name": "demo:vxe-table",
          "path": "/demo/vxe-table",
          "component": null,
          "redirect": "/demo/vxe-table/basic",
          "meta": {
            "title": "Vxe 表格",
            "icon": "lucide:sheet",
            "order": 3,
            "keepAlive": false,
            "hideInMenu": false
          },
          "children": [
            {
              "name": "demo:vxe-table:basic",
              "path": "/demo/vxe-table/basic",
              "component": "vxe-table/basic",
              "redirect": "",
              "meta": {
                "title": "基础表格",
                "icon": "lucide:table",
                "order": 1,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:remote",
              "path": "/demo/vxe-table/remote",
              "component": "vxe-table/remote",
              "redirect": "",
              "meta": {
                "title": "远程加载",
                "icon": "lucide:cloud-download",
                "order": 2,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:tree",
              "path": "/demo/vxe-table/tree",
              "component": "vxe-table/tree",
              "redirect": "",
              "meta": {
                "title": "树形表格",
                "icon": "lucide:list-tree",
                "order": 3,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:custom-cell",
              "path": "/demo/vxe-table/custom-cell",
              "component": "vxe-table/custom-cell",
              "redirect": "",
              "meta": {
                "title": "自定义单元格",
                "icon": "lucide:square-stack",
                "order": 4,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:edit-cell",
              "path": "/demo/vxe-table/edit-cell",
              "component": "vxe-table/edit-cell",
              "redirect": "",
              "meta": {
                "title": "单元格编辑",
                "icon": "lucide:pencil-line",
                "order": 5,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:edit-row",
              "path": "/demo/vxe-table/edit-row",
              "component": "vxe-table/edit-row",
              "redirect": "",
              "meta": {
                "title": "行编辑",
                "icon": "lucide:edit-3",
                "order": 6,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:fixed",
              "path": "/demo/vxe-table/fixed",
              "component": "vxe-table/fixed",
              "redirect": "",
              "meta": {
                "title": "固定表头/列",
                "icon": "lucide:pin",
                "order": 7,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:form",
              "path": "/demo/vxe-table/form",
              "component": "vxe-table/form",
              "redirect": "",
              "meta": {
                "title": "搜索表单",
                "icon": "lucide:table-properties",
                "order": 8,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:vxe-table:virtual",
              "path": "/demo/vxe-table/virtual",
              "component": "vxe-table/virtual",
              "redirect": "",
              "meta": {
                "title": "虚拟滚动",
                "icon": "lucide:zap",
                "order": 9,
                "keepAlive": false,
                "hideInMenu": false
              }
            }
          ]
        },
        {
          "name": "demo:widgets",
          "path": "/demo/widgets",
          "component": null,
          "redirect": "/demo/widgets/form-builder",
          "meta": {
            "title": "控件中心",
            "icon": "lucide:blocks",
            "order": 4,
            "keepAlive": false,
            "hideInMenu": false
          },
          "children": [
            {
              "name": "demo:widgets:form-builder",
              "path": "/demo/widgets/form-builder",
              "component": "widgets/form-builder/builder/index",
              "redirect": "",
              "meta": {
                "title": "表单设计器",
                "icon": "lucide:layout-template",
                "order": 1,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:visual-flow",
              "path": "/demo/widgets/visual-flow",
              "component": "widgets/visual-flow/index",
              "redirect": "",
              "meta": {
                "title": "流程设计器",
                "icon": "lucide:workflow",
                "order": 2,
                "keepAlive": true,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:image-selector",
              "path": "/demo/widgets/image-selector",
              "component": "widgets/image-selector/index",
              "redirect": "",
              "meta": {
                "title": "图片选择器",
                "icon": "lucide:image",
                "order": 3,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:modal",
              "path": "/demo/widgets/modal",
              "component": "widgets/modal/index",
              "redirect": "",
              "meta": {
                "title": "弹窗",
                "icon": "lucide:app-window",
                "order": 4,
                "keepAlive": true,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:drawer",
              "path": "/demo/widgets/drawer",
              "component": "widgets/drawer/index",
              "redirect": "",
              "meta": {
                "title": "抽屉",
                "icon": "lucide:panel-right",
                "order": 5,
                "keepAlive": true,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:captcha",
              "path": "/demo/widgets/captcha",
              "component": "widgets/captcha/slider-captcha",
              "redirect": "",
              "meta": {
                "title": "滑块验证",
                "icon": "lucide:shield",
                "order": 6,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:ellipsis",
              "path": "/demo/widgets/ellipsis",
              "component": "widgets/ellipsis/index",
              "redirect": "",
              "meta": {
                "title": "文本省略",
                "icon": "lucide:more-horizontal",
                "order": 7,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:json-viewer",
              "path": "/demo/widgets/json-viewer",
              "component": "widgets/json-viewer/index",
              "redirect": "",
              "meta": {
                "title": "JsonViewer",
                "icon": "lucide:braces",
                "order": 8,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:loading",
              "path": "/demo/widgets/loading",
              "component": "widgets/loading/index",
              "redirect": "",
              "meta": {
                "title": "Loading",
                "icon": "lucide:loader-circle",
                "order": 9,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:count-to",
              "path": "/demo/widgets/count-to",
              "component": "widgets/count-to/index",
              "redirect": "",
              "meta": {
                "title": "CountTo",
                "icon": "lucide:hash",
                "order": 10,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:cropper",
              "path": "/demo/widgets/cropper",
              "component": "widgets/cropper/index",
              "redirect": "",
              "meta": {
                "title": "图片裁剪",
                "icon": "lucide:crop",
                "order": 11,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:context-menu",
              "path": "/demo/widgets/context-menu",
              "component": "widgets/context-menu/index",
              "redirect": "",
              "meta": {
                "title": "上下文菜单",
                "icon": "lucide:mouse-pointer-click",
                "order": 12,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:resize",
              "path": "/demo/widgets/resize",
              "component": "widgets/resize/basic",
              "redirect": "",
              "meta": {
                "title": "拖动调整",
                "icon": "lucide:maximize-2",
                "order": 13,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:tippy",
              "path": "/demo/widgets/tippy",
              "component": "widgets/tippy/index",
              "redirect": "",
              "meta": {
                "title": "Tippy",
                "icon": "lucide:message-square",
                "order": 14,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:tiptap",
              "path": "/demo/widgets/tiptap",
              "component": "widgets/tiptap/index",
              "redirect": "",
              "meta": {
                "title": "富文本编辑器",
                "icon": "lucide:pen-tool",
                "order": 15,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:motion",
              "path": "/demo/widgets/motion",
              "component": "widgets/motion/index",
              "redirect": "",
              "meta": {
                "title": "Motion",
                "icon": "lucide:wand-2",
                "order": 16,
                "keepAlive": false,
                "hideInMenu": false
              }
            },
            {
              "name": "demo:widgets:locale",
              "path": "/demo/widgets/locale",
              "component": "widgets/locale/index",
              "redirect": "",
              "meta": {
                "title": "多语言示例",
                "icon": "lucide:languages",
                "order": 17,
                "keepAlive": false,
                "hideInMenu": false
              }
            }
          ]
        }
      ]
    }
  ];

export default routes;
