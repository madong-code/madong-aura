<template>
  <div class="divider">
    <span class="title">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string
  }>()
</script>

<style lang="scss" scoped>
  .divider {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    background-color: #3c567a;
    color: white;
    font-size: 14px;
    padding: 0 16px;
    box-sizing: border-box;
    .title {
      color: #fff;
      font-size: 15px;
      font-weight: 400;
    }
  }
</style>
