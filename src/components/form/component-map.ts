// const modules: any = import.meta.glob('./components/**/**.vue', { eager: true })
import { Component, markRaw, defineComponent } from 'vue'
const componentMap = new Map<string, Component>()
const componentObj = import.meta.glob('./components/**/**.vue', { eager: true })
// 将key转换为大驼峰命名
function toPascalCase(str: string): string {
  // 处理目录结构，例如：
  // ./components/select-dept/index.vue => select-dept
  // ./components/select-dept/dept-select-modal.vue => dept-select-modal
  const pathParts = str.split('/')
  
  // 找到 components 目录的位置
  const componentsIndex = pathParts.indexOf('components')
  if (componentsIndex === -1) return ''
  
  // 提取组件路径部分
  const componentPath = pathParts.slice(componentsIndex + 1)
  
  // 处理文件名
  let componentName = ''
  if (componentPath.length > 1 && componentPath[componentPath.length - 1] === 'index.vue') {
    // 对于 index.vue 文件，使用目录名作为组件名
    componentName = componentPath[componentPath.length - 2]
  } else {
    // 对于其他文件，使用文件名（不含扩展名）作为组件名
    const fileName = componentPath[componentPath.length - 1]
    componentName = fileName.replace('.vue', '')
  }
  
  // 按照减号分割并转换为大驼峰
  return componentName
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
    addComponent(componentName, markRaw(comm.default as Component))
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
