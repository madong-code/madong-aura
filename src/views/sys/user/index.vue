<template>
  <div class="user-page art-full-height">
    <el-card header="自定义指令（后端控制模式）">
      <el-button type="primary" v-auth="'sys:user:save'">添加</el-button>
      <el-button type="primary" v-auth="'sys:user:update'">修改</el-button>
      <el-button type="danger" v-auth="'sys:user:remove'">删除</el-button>
    </el-card>
    <el-card header="hasAuth方法">
      <el-button type="primary" v-if="hasAuth('sys:user:save')">添加</el-button>
      <el-button type="primary" v-if="hasAuth('sys:user:update')">修改</el-button>
      <el-button type="danger" v-if="hasAuth('sys:user:remove')">删除</el-button>
    </el-card>
  </div>
</template>
<script setup lang="ts">
  defineOptions({ name: 'sys:user' })
  import { useAuth } from '@/composables/useAuth'
  const { hasAuth } = useAuth()
</script>
<style lang="less" scoped></style>
