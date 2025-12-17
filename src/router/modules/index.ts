import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { widgetsRoutes } from './widgets'
import { examplesRoutes } from './examples'
// import { systemRoutes } from './system'
import { articleRoutes } from './article'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { safeguardRoutes } from './safeguard'
import { helpRoutes } from './help'
import { RoutesAlias } from '../routesAlias'

/**
 * 导出所有模块化路由
 */
// export const routeModules: AppRouteRecord[] = [
//   dashboardRoutes,
//   templateRoutes,
//   widgetsRoutes,
//   examplesRoutes,
//   systemRoutes,
//   articleRoutes,
//   resultRoutes,
//   exceptionRoutes,
//   safeguardRoutes,
//   ...helpRoutes
// ]


/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord = {
  path: '/playground',
  name: 'playground',
  component: RoutesAlias.Layout,
  meta: {
    title: '示例模块',
    icon: 'ant-design:form-outlined',
    roles: []
  },
  children: [
    dashboardRoutes,
    templateRoutes,
    widgetsRoutes,
    examplesRoutes,
    articleRoutes,
    resultRoutes,
    exceptionRoutes,
    safeguardRoutes,
    ...helpRoutes
  ]
}