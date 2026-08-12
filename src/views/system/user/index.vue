<script lang="ts" setup>
import { useCrud } from '#/adapter/crud';
import { Page } from '#/core/ui/common';

import { useCrudSchema } from './schemas';

const schema = useCrudSchema();
const [Grid] = useCrud(schema);
</script>
<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
