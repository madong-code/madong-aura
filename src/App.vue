<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { systemUpgrade } from './utils/sys'

  import { setThemeTransitionClass } from './utils/theme/animation'
  import { checkStorageCompatibility } from './utils/storage'
  import { useDictStore } from './store/modules/dict'

  const userStore = useUserStore()
  const dictStore = useDictStore()
  const { language } = storeToRefs(userStore)

  const locales = {
    zh: zh,
    en: en
  }

  onBeforeMount(() => {
    setThemeTransitionClass(true)
    // 这里可以一次性初始化所有字典
    dictStore.initAllDicts(() => {
      return Promise.resolve([
        {
          name: '性别',
          dictKey: 'sex',
          items: [
            {
              name: '男',
              dictItemValue: 1,
              dictItemKey: 'MAN'
            },
            {
              name: '女',
              dictItemValue: 2,
              dictItemKey: 'WOMAN'
            },
            {
              name: '未知',
              dictItemValue: 3,
              dictItemKey: 'UN_KNOW'
            }
          ]
        }
      ])
    })
  })

  onMounted(() => {
    // 检查存储兼容性
    checkStorageCompatibility()
    // 提升暗黑主题下页面刷新视觉体验
    setThemeTransitionClass(false)
    // 系统升级
    systemUpgrade()
  })
</script>
