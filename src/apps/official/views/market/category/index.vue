<template>
  <div class="official-doc-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const route = useRoute();
const router = useRouter();
const formRef = ref<any>(null);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    return params;
  },
});
</script>
