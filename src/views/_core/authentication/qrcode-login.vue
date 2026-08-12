<script lang="ts" setup>
import { LOGIN_PATH } from '#/core/shared/constants';
import { AuthenticationQrCodeLogin } from '#/core/ui/common';

defineOptions({ name: 'QrCodeLogin' });
</script>

<template>
  <AuthenticationQrCodeLogin :login-path="LOGIN_PATH" />
</template>
