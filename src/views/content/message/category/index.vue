<script setup lang="ts">
import type { CrudSchema } from '#/components/crud/components/types';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';

import { useCrudSchema } from './schemas';

const crudConfig: CrudSchema = {
  ...useCrudSchema(),
};

const [BasicCrud] = useCrud(crudConfig);
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
  </Page>
</template>
