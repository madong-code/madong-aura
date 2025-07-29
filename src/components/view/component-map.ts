// const modules: any = import.meta.glob('./components/**/**.vue', { eager: true })
import { Component } from 'vue'
import ApiDict from './components/api-dict.vue'
import Select from './components/select.vue'
const componentMap = new Map<string, Component>()

addComponent('ApiDict', ApiDict)
addComponent('Select', Select)
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
