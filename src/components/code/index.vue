<template>
  <pre class="code-pre"><code class="hljs" v-html="highlightedCode"></code></pre>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/qtcreator-dark.min.css";

// 定义组件属性接口
interface CodeHighlightProps {
  code: string;
  language?: string;
}

// 定义组件属性
const props = withDefaults(defineProps<CodeHighlightProps>(), {
  language: "php",
});

// 响应式变量
const highlightedCode = ref<string>("");

// 高亮处理函数
const handleHighlight = (): void => {
  if (!props.code) {
    highlightedCode.value = "";
    return;
  }

  try {
    highlightedCode.value = hljs.highlight(props.code, {
      language: props.language,
      ignoreIllegals: true,
    }).value;
  } catch (error) {
    console.error("代码高亮失败", error);
    highlightedCode.value = props.code; // 降级处理
  }
};

// 监听属性变化
watch(() => [props.code, props.language], handleHighlight);

// 组件挂载时执行高亮
onMounted(handleHighlight);
</script>

<style scoped>
.code-pre {
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}
</style>
