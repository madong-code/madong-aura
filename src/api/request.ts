/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '#/core/request';

import { ElMessage } from 'element-plus';

import { useAppConfig } from '#/core/composables';
import { preferences } from '#/core/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '#/core/request';
import { useAccessStore } from '#/core/stores';
import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const refreshToken = accessStore.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const resp = await refreshTokenApi(refreshToken);
    const data = resp.data?.data;
    if (!data?.access_token) {
      throw new Error('Invalid refresh token response');
    }
    accessStore.setAccessToken(data.access_token);
    if (data.refresh_token) {
      accessStore.setRefreshToken(data.refresh_token);
    }
    return data.access_token as string;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;

      return config;
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: (code) => code === 0 || code === 200,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {};
      const errorMessage =
        responseData?.error ?? responseData?.message ?? responseData?.msg ?? '';
      // 如果没有错误信息，则会根据状态码进行提示
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });

/**
 * SSE (Server-Sent Events) 请求方法
 *
 * 基于原生 EventSource 封装，自动注入认证 Token 和 BaseURL
 * 支持注册自定义事件监听（如 success / error / progress 等）
 *
 * @example
 * ```ts
 * import { sse } from '#/api/request';
 *
 * const conn = sse('/content/message/notify/sse', {
 *   onOpen: () => console.log('连接成功'),
 *   success: (payload) => { console.log('unread:', payload?.data?.data); },
 *   error: (payload) => { console.error('服务端错误:', payload?.data?.message); },
 *   onError: (event) => console.error('连接错误'),
 * });
 *
 * // 关闭连接
 * conn.close();
 * ```
 */
// SSE 连接缓存，确保相同 URL 只保持一个活跃连接
const sseConnections = new Map<string, { close: () => void }>();

export function sse(
  url: string,
  eventHandlers: {
    [customEvent: string]:
      | ((data: any, event?: MessageEvent) => void)
      | undefined;
    connectionError?: (event: Event) => void;
    onError?: (event: Event) => void;
    onMessage?: (data: any) => void;
    onOpen?: () => void;
  } = {},
  extraParams?: Record<string, string | undefined>,
) {
  // 构建完整 URL
  let fullUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    const base = apiURL.endsWith('/') ? apiURL.slice(0, -1) : apiURL;
    fullUrl = `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // 关闭同 URL 的旧连接，防止多个 Timer
  const existing = sseConnections.get(fullUrl);
  if (existing) {
    existing.close();
    sseConnections.delete(fullUrl);
  }

  // 注入额外参数（如 uuid）
  if (extraParams) {
    const searchParams = new URLSearchParams();
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  // 注入认证 Token（EventSource 不支持自定义 headers，通过 URL 参数传递）
  const accessStore = useAccessStore();
  const token = accessStore.accessToken;
  if (token) {
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    fullUrl += `${
      fullUrl.includes('?') ? '&' : '?'
    }token=${encodeURIComponent(bearerToken)}`;
  }

  const eventSource = new EventSource(fullUrl, { withCredentials: true });

  // 注册 onOpen
  const onOpen = eventHandlers.onOpen;
  if (onOpen) {
    eventSource.addEventListener('open', onOpen);
  }

  // 注册默认 message 事件
  const onMessage = eventHandlers.onMessage;
  if (onMessage) {
    eventSource.addEventListener('message', (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        onMessage(event.data);
      }
    });
  }

  // 注册自定义事件（progress / completed / heartbeat 等，排除 error 由原生处理）
  Object.entries(eventHandlers).forEach(([eventName, handler]) => {
    if (
      ['connectionError', 'error', 'onError', 'onMessage', 'onOpen'].includes(
        eventName,
      ) ||
      typeof handler !== 'function'
    )
      return;
    eventSource.addEventListener(eventName, (event: Event) => {
      try {
        (handler as (data: any, event?: MessageEvent) => void)(
          JSON.parse((event as MessageEvent).data),
          event as MessageEvent,
        );
      } catch {
        (handler as (data: any) => void)((event as MessageEvent).data);
      }
    });
  });

  // 原生 error 事件同时由两类场景触发，通过 event.data 区分：
  // 1) 服务器主动发 event: error + data → 调用 eventHandlers.error（业务错误）
  // 2) 连接断开（data 为空）→ 调用 eventHandlers.onError（连接异常）
  eventSource.addEventListener('error', (event) => {
    const me = event as MessageEvent;
    if (me.data) {
      // 服务器发送的 event: error 事件
      if (eventHandlers.error) {
        try {
          eventHandlers.error(JSON.parse(me.data));
        } catch {
          eventHandlers.error(me.data);
        }
      }
    } else if (eventHandlers.onError) {
      // 连接断开（非服务器主动错误）
      eventHandlers.onError(event);
    }
  });

  const cleanup = {
    eventSource,
    close: () => {
      sseConnections.delete(fullUrl);
      eventSource.close();
    },
    readyState: () => eventSource.readyState,
  };

  // 注册到缓存（防重复创建）
  sseConnections.set(fullUrl, cleanup);

  return cleanup;
}
