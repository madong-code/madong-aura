// @ts-expect-error: webman-push.js has no type declarations
import { Push } from './webman-push.js';

let pushClient: InstanceType<typeof Push> | null = null;
const channelCache = new Map<string, any>();

function isWssEnabled(): boolean {
  return import.meta.env.VITE_GLOB_ENABLE_WSS === 'true';
}

function getWssConfig(): { url: string; appKey: string } | null {
  const wssUrl = import.meta.env.VITE_GLOB_WSS_URL;
  const appKey = import.meta.env.VITE_GLOB_WSS_APPKEY;
  if (!wssUrl || !appKey) {
    console.warn('[PushClient] WSS 未配置');
    return null;
  }
  return { url: wssUrl, appKey };
}

export function getPushClient(): InstanceType<typeof Push> | null {
  if (!isWssEnabled()) return null;

  if (!pushClient) {
    const config = getWssConfig();
    if (!config) return null;

    pushClient = new Push({
      url: config.url,
      app_key: config.appKey,
      auth: '/adminapi/plugin/webman/push/auth',
    });

    console.log('[PushClient] WebSocket 连接已创建');
  }

  return pushClient;
}

export function subscribeUserChannel(userId: string): any | null {
  if (!isWssEnabled()) return null;

  const client = getPushClient();
  if (!client) return null;

  const channelName = `backend-admin-${userId}`;

  if (channelCache.has(channelName)) {
    return channelCache.get(channelName);
  }

  const channel = client.subscribe(channelName);
  channelCache.set(channelName, channel);

  console.log(`[PushClient] 订阅频道: ${channelName}`);

  return channel;
}

export function destroyPushClient(): void {
  channelCache.clear();
  if (pushClient) {
    pushClient.disconnect();
    pushClient = null;
    console.log('[PushClient] WebSocket 连接已销毁');
  }
}

export function resetPushClient(): void {
  destroyPushClient();
}
