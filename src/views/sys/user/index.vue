<template>
  <div class="user-page art-full-height">
    <el-row>
      <el-button type="primary" v-auth="'sys:user:save'">添加</el-button>
      <el-button type="primary" v-auth="'sys:user:update'">修改</el-button>
      <el-button type="danger" v-auth="'sys:user:remove'">删除</el-button>
    </el-row>
  </div>
</template>
<script setup lang="ts">
  defineOptions({ name: 'sys:user' })
</script>
<style lang="less" scoped></style>
