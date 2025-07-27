<template>
  <div>{{ value }}-{{ code }}</div>
</template>
<script lang="ts" setup>
  defineProps({
    value: {
      type: [String, Number, Array]
    },
    code: {
      type: String
    }
  })
</script>
