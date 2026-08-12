<script setup lang="ts">
import type { Recordable } from '#/core/shared/types';
import type { VbenFormSchema } from '#/core/ui/form';

import { computed, reactive } from 'vue';

import { $t } from '#/core/locales';
import { useVbenForm } from '#/core/ui/form';
import { VbenButton } from '#/core/ui/primitives';

interface Props {
  formSchema?: VbenFormSchema[];
}

const props = withDefaults(defineProps<Props>(), {
  formSchema: () => [],
});

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      // 所有表单项
      componentProps: {
        class: 'w-full',
      },
    },
    layout: 'horizontal',
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

async function handleSubmit() {
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();
  if (valid) {
    emit('submit', values);
  }
}

defineExpose({
  getFormApi: () => formApi,
});
</script>
<template>
  <div @keydown.enter.prevent="handleSubmit">
    <Form />
    <VbenButton type="submit" class="mt-4" @click="handleSubmit">
      {{ $t('profile.updateBasicProfile') }}
    </VbenButton>
  </div>
</template>
