// const modules: any = import.meta.glob('./components/**/**.vue', { eager: true })
import { Component } from 'vue'
import ApiDict from './components/api-dict.vue'
import Select from './components/select.vue'
export const componentMap = new Map<string, Component>()

componentMap.set('ApiDict', ApiDict)
componentMap.set('Select', Select)
