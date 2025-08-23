<template>
  <Dialog>
    <BasicCrud>
      <template #toolbar-actions>
        账号 {{ record.userName }} （{{ record.realName }}）目前已在
        {{ record.tokenList?.length }} 个客户端登录
      </template>
    </BasicCrud>
  </Dialog>
</template>
<script lang="ts" setup>
  import { useDialog } from '@/components/dialog'

  const record = ref()
  import { useCrud } from '@/components/crud'
  import { getRelativeTime } from '@/utils/tool'
  import { UserService } from '@/api/sys/user'
  const dataSource = ref<any>([])
  const handlePage = (params: any) => {
    const { pageNum, pageSize, keywords } = params

    // 1. 从dataSource获取所有数据
    let filteredData = [...dataSource.value]

    // 2. 如果有关键词，进行过滤（匹配id、userName或realName）
    if (keywords) {
      const keywordStr = keywords.toString().toLowerCase()
      filteredData = filteredData.filter(
        (item: any) =>
          item.id?.toString().toLowerCase().includes(keywordStr) ||
          item.userName?.toLowerCase().includes(keywordStr) ||
          item.realName?.toLowerCase().includes(keywordStr)
      )
    }

    // 3. 返回分页结果
    return Promise.resolve({
      recordCount: filteredData.length,
      totalPage: Math.ceil(filteredData.length / pageSize),
      rows: filteredData.slice((pageNum - 1) * pageSize, pageNum * pageSize)
    })
  }
  const [BasicCrud, crudApi] = useCrud({
    useCrud: false,
    rowKey: 'tokenValue',
    api: async (params: any) => {
      return await handlePage(params)
    },
    useSearchForm: false,
    columns: [
      {
        prop: 'tokenValue',
        label: 'Token凭证',
        align: 'left'
      },
      {
        prop: 'loginTime',
        label: '登录于',
        align: 'center',
        formatter: (row: any) => {
          return h('div', { class: 'text-center' }, [
            h('span', `${row.loginTime} - `),
            h(
              'span',
              {
                style: {
                  color: 'green'
                }
              },
              getRelativeTime(row.loginTime)
            )
          ])
        }
      },
      {
        prop: 'loginIp',
        label: '登录IP',
        align: 'left'
      },
      {
        prop: 'loginBrowser',
        label: '浏览器',
        align: 'left'
      },
      {
        prop: 'expireTime',
        label: '凭证失效于',
        align: 'center',
        formatter: (row: any) => {
          return h('div', { class: 'text-center' }, [
            h('span', `${row.expireTime} - `),
            h(
              'span',
              {
                style: {
                  color: 'green'
                }
              },
              getRelativeTime(row.expireTime)
            )
          ])
        }
      }
    ],
    toolbarConfig: {
      // 禁用表格右上角工具栏刷新按钮
      refresh: false
    },
    // hasAdd: true,
    // 左侧工具栏
    toolbarActions: [],
    // 左侧栏工具-下拉菜单
    dropDownToolbarActions: [],
    // 表格行操作
    tableActions: [
      {
        label: '踢下线',
        type: 'primary',
        link: true,
        confirm: {
          title: '提示',
          content: '确定踢下线吗？',
          ok: (row: any) => {
            handleDelete(row, 'kickoutByTokenValue')
          }
        },
        dynamicProps(row) {
          return {
            disabled: row.isCurrentUser || row.superAdmin
          }
        },
        auth: 'sys:user:logoutByTokenValue'
      },
      {
        label: '强制注销',
        type: 'primary',
        link: true,
        confirm: {
          title: '提示',
          content: '确定强制注销吗？',
          ok: (row: any) => {
            handleDelete(row, 'logoutByTokenValue')
          }
        },
        dynamicProps(row) {
          return {
            disabled: row.isCurrentUser || row.superAdmin
          }
        },
        auth: 'sys:user:logoutByTokenValue'
      }
    ],
    // 表格行操作-下拉菜单
    dropDownActions: []
  })
  const handleDelete = (record: any, type: string) => {
    const ids: any = []
    if (record && record.tokenValue) {
      ids.push(record.tokenValue)
    }
    const api =
      type === 'logoutByTokenValue'
        ? UserService.logoutByTokenValue
        : UserService.kickoutByTokenValue
    const msg = type === 'logoutByTokenValue' ? '强制注销成功' : '踢下线成功'
    api({
      ids
    }).then(() => {
      ElMessage.success(msg)
      dataSource.value = dataSource.value.filter((item: any) => !ids.includes(item.tokenValue))
      crudApi.refreshRemove()
    })
  }
  const [Dialog, dialogApi] = useDialog({
    title: '在线用户详情',
    footer: false
  })
  defineExpose({
    show({ data }: { data: any }) {
      record.value = data
      dataSource.value = record.value.tokenList || []
      dialogApi.open()
    }
  })
</script>
