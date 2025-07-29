// const modules: any = import.meta.glob('./components/**/**.vue', { eager: true })
import { ColumnOption } from '@/types'
import { Component } from 'vue'
const componentMap = new Map<string, Component>()
const componentObj = import.meta.glob('./components/**/**.vue', { eager: true })
// 将key转换为大驼峰命名
function toPascalCase(str: string): string {
  // 从完整路径中提取文件名，例如：./components/api-dict.vue => api-dict
  const match = str.match(/\/([^/]+)\.vue$/)
  if (!match) return ''
  const fileName = match[1]
  // 按照减号分割并转换为大驼峰
  return fileName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('') // 合并为大驼峰
}
Object.keys(componentObj).forEach((key) => {
  const componentName = toPascalCase(key)
  // 假设组件在 componentObj[key] 中，注册逻辑可以在这里添加
  // console.log(componentName) // 输出处理后的组件名，如 ApiDict, Select 等
  const comm: any = componentObj[key]
  if (comm) {
    addComponent(componentName, comm.default as Component)
  }
})

const EmptyComponent = defineComponent({
  name: 'EmptyComponent',
  setup() {
    return {}
  }
})
// 获取组件
export function getComponent(name: string) {
  const comp = componentMap.get(name)
  if (comp) return comp
  return EmptyComponent
}
// 添加组件
export function addComponent(name: string, component: Component) {
  componentMap.set(name, component)
}
// 删除组件
export function removeComponent(name: string) {
  componentMap.delete(name)
}
// 判断组件是否存在
export function hasComponent(name: string) {
  return componentMap.has(name)
}
// 获取所有组件
export function getAllComponents() {
  return componentMap
}
/**
 * 列格式化
 * @param column 列配置
 */
export function viewColumnFormatter(column: ColumnOption<any>) {
  if (column.component && hasComponent(column.component as string)) {
    column.formatter = (row: any) => {
      const component = getComponent(column.component as string)
      return h(component, {
        ...column.componentProps,
        record: row,
        value: row[column.prop as string]
      })
    }
  }
}
