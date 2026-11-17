<!-- 租户搜索器：登录页按租户代码/名称搜索，提交值始终为租户 code -->
<template>
  <ElSelect
    v-model="value"
    :loading="loading"
    :placeholder="placeholder"
    :remote-method="remoteMethod"
    allow-create
    class="w-full"
    filterable
    remote
    @visible-change="onVisibleChange"
  >
    <ElOption
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    >
      <template #default>
        <div class="tenant-searcher__item">
          <span class="tenant-searcher__name">{{ opt.label }}</span>
          <span class="tenant-searcher__code">{{ opt.code }}</span>
        </div>
      </template>
    </ElOption>
    <template v-if="hasMore" #footer>
      <div class="tenant-searcher__more" @click="loadMore">
        {{ $t('tenant.searcher.loadMore', { loaded: options.length, total }) }}
      </div>
    </template>
  </ElSelect>
</template>

<script setup lang="ts">
  import { getTenantPageApi } from '#/api'
  import { computed, onMounted, ref } from 'vue'

  interface Props {
    modelValue?: string
    /** 分页阈值：命中总数不超过该值时不出现「加载更多」 */
    threshold?: number
    pageSize?: number
    placeholder?: string
    /** 首次加载后若只有一个租户，自动选中 */
    autoFirst?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    threshold: 20,
    pageSize: undefined,
    placeholder: '输入租户代码或名称搜索',
    autoFirst: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const value = computed({
    get: () => props.modelValue ?? '',
    set: (val) => {
      const next = val ?? ''
      // ElSelect 初始化/清空回写空值，与当前值相同则不上抛：
      // 否则表单会把该字段标记为已校验，登录页一进来就显示必填错误
      if (next === (props.modelValue ?? '')) return
      emit('update:modelValue', next)
    }
  })

  const options = ref<{ label: string; code: string; value: string }[]>([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const keyword = ref('')

  const size = computed(() => props.pageSize ?? props.threshold)
  const hasMore = computed(() => options.value.length < total.value)

  let timer: ReturnType<typeof setTimeout> | undefined
  let requestSeq = 0
  let initialized = false
  const nameCache = new Map<string, string>()

  function withSelected(list: { label: string; code: string; value: string }[]) {
    const cur = value.value
    if (!cur || list.some((o) => o.value === cur)) return list
    const name = nameCache.get(cur)
    if (!name) return list
    return [{ label: name, code: cur, value: cur }, ...list]
  }

  function currentLabel(): string {
    const opt = options.value.find((o) => o.value === value.value)
    return opt ? opt.label : value.value ?? ''
  }

  async function load(reset = false) {
    const seq = ++requestSeq
    const targetPage = reset ? 1 : page.value + 1
    loading.value = true
    try {
      const res = await getTenantPageApi({
        keyword: keyword.value,
        page: targetPage,
        page_size: size.value
      })
      if (seq !== requestSeq) return
      res.list.forEach((t) => nameCache.set(t.code, t.name))
      const list = res.list.map((t) => ({
        label: t.name,
        code: t.code,
        value: t.code
      }))
      options.value = reset ? withSelected(list) : [...options.value, ...list]
      total.value = res.total
      page.value = targetPage
    } catch {
      if (seq !== requestSeq) return
      if (reset) {
        options.value = []
        total.value = 0
      }
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function scheduleLoad(reset = true) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => load(reset), 300)
  }

  function remoteMethod(query: string) {
    const q = (query ?? '').trim()
    if (q === '' || q === currentLabel()) return
    keyword.value = q
    initialized = true
    scheduleLoad(true)
  }

  function onVisibleChange(visible: boolean) {
    if (!visible || initialized) return
    initialized = true
    keyword.value = ''
    load(true)
  }

  function loadMore() {
    if (!hasMore.value || loading.value) return
    load(false)
  }

  // 仅在平台只有一个租户时自动选中；多租户下静默选中第一个会误提交他人租户 code
  onMounted(() => {
    if (!props.autoFirst || value.value) return
    getTenantPageApi({ page: 1, page_size: 1 })
      .then((res) => {
        if (res.total !== 1) return
        const first = res.list[0]
        if (!first) return
        nameCache.set(first.code, first.name)
        if (!value.value) value.value = first.code
        options.value = withSelected(options.value)
      })
      .catch(() => {})
  })
</script>

<style scoped>
  :deep(.el-select__wrapper) {
    min-height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    font-size: 14px;
  }

  .tenant-searcher__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .tenant-searcher__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tenant-searcher__code {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .tenant-searcher__more {
    cursor: pointer;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--el-color-primary);
    text-align: center;
  }

  .tenant-searcher__more:hover {
    background: var(--el-fill-color-light);
  }
</style>
