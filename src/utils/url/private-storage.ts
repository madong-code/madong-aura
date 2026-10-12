/**
 * 私有存储资源地址解析
 *
 * 私有空间（非公开读）下，资源不能由前端自行拼接访问地址，
 * 必须按「资源 key + 用户身份」向后端换取带签名的临时直链：
 *
 *   前端 → POST /system/files/access-urls（keys）
 *        → 后端校验身份并生成七牛私有签名 URL
 *        → 前端 <img src="签名地址">
 *
 * 公开空间不发起任何请求，仍由调用方直接拼接访问域名。
 */

import { ref } from 'vue';

import { FilesService } from '#/api/system/files';
import { useSiteConfigStore } from '#/store/modules/site-config';

/** 单次请求换取的数量上限（与后端 StorageUrl::MAX_BATCH 对齐） */
const MAX_BATCH = 200;

/** 失败后同一 key 的重试间隔，避免渲染频繁触发重复请求 */
const RETRY_INTERVAL = 3000;

/** 资源地址 => 签名地址 */
const signedUrls = ref<Record<string, string>>({});

/** 后端未返回（非本空间资源）的 key，不再重复请求 */
const unresolved = new Set<string>();

/** 上次请求时间，用于失败重试节流 */
const lastAttemptAt = new Map<string, number>();

/** 待换取队列 */
const queue = new Set<string>();

let flushing = false;

/** 当前配置 */
const siteConfig = () => {
  try {
    return useSiteConfigStore().getCurrentConfig() as Record<string, any>;
  } catch {
    return {} as Record<string, any>;
  }
};

/** 当前是否为私有空间（未开启则完全不需要请求后端） */
export const isPrivateStorage = (): boolean => siteConfig().is_private === true;

/**
 * 公开空间的资源访问域名
 *
 * @returns 配置了 CDN/静态域名时返回去尾斜杠的域名；空串表示同域访问（相对路径可直接访问）
 */
const publicBaseUrl = (): string => {
  const cfg = siteConfig();
  const base = String(cfg.static_url || cfg.cdn_url || '').trim();
  return base.replace(/\/+$/, '');
};

/** 取 URL 的主机名，非绝对地址返回空串 */
const hostOf = (url: string): string => {
  if (!url || !/^(https?:)?\/\//i.test(url)) return '';
  try {
    return new URL(url.startsWith('//') ? `http:${url}` : url).hostname;
  } catch {
    return '';
  }
};

/**
 * 判断是否为本站存储空间中的资源
 *
 * 命中条件（避免把站点自身的静态资源误当作存储资源）：
 * - 相对路径：以配置的存储根目录开头，如 /storage/xxx
 * - 绝对地址：主机名与当前存储访问域名一致
 */
export const isStorageResource = (path: string): boolean => {
  const trimmed = (path || '').trim();
  if (trimmed === '' || /^(data|blob):/i.test(trimmed)) return false;

  if (/^(https?:)?\/\//i.test(trimmed)) {
    const host = hostOf(trimmed);
    const ownHost = hostOf(String(siteConfig().cdn_url || ''));
    return host !== '' && ownHost !== '' && host.toLowerCase() === ownHost.toLowerCase();
  }

  const prefix = String(siteConfig().storage_prefix || '')
    .replace(/^\/+|\/+$/g, '');
  if (prefix === '') return false;
  return trimmed.replace(/^\/+/, '').startsWith(`${prefix}/`);
};

/** 请求后端换取签名地址 */
const fetchSignedUrls = async (keys: string[]): Promise<void> => {
  keys.forEach((key) => lastAttemptAt.set(key, Date.now()));
  try {
    const list: any = await FilesService.accessUrls(keys);
    const items: { key: string; url: string }[] = Array.isArray(list) ? list : [];

    const next = { ...signedUrls.value };
    let changed = false;
    const resolved = new Set<string>();
    for (const item of items) {
      if (!item?.key || typeof item.url !== 'string' || item.url === '') continue;
      resolved.add(item.key);
      if (next[item.key] !== item.url) {
        next[item.key] = item.url;
        changed = true;
      }
    }
    // 后端未返回的 key 说明不属于本站存储空间，回落到调用方的拼接逻辑
    keys.forEach((key) => {
      if (!resolved.has(key)) unresolved.add(key);
    });

    // 替换整个对象以触发依赖该 ref 的渲染重新计算
    if (changed) signedUrls.value = next;
  } catch (error) {
    // 请求失败不标记 unresolved，留待节流窗口后重试
    console.warn('私有资源地址换取失败', error);
  }
};

/** 消费队列（并发安全：同一时刻只有一次循环） */
const flush = async (): Promise<void> => {
  try {
    while (queue.size > 0) {
      const keys = [...queue].slice(0, MAX_BATCH);
      keys.forEach((key) => queue.delete(key));
      await fetchSignedUrls(keys);
    }
  } finally {
    flushing = false;
  }
};

/** 入队并调度批量请求（同一 tick 内的调用合并为一次请求） */
const enqueue = (key: string): void => {
  queue.add(key);
  if (flushing) return;
  flushing = true;
  void Promise.resolve().then(() => flush());
};

/**
 * 获取资源可访问地址
 *
 * @param path 资源地址（相对路径或绝对地址）
 * @returns 命中私有空间时返回签名地址（未就绪返回 null，由调用方回落拼接）；
 *          公开空间或非存储资源始终返回 null
 */
export const resolveSignedUrl = (path: string): null | string => {
  const trimmed = (path || '').trim();
  if (trimmed === '') return null;
  if (!isPrivateStorage() || !isStorageResource(trimmed)) return null;

  const cached = signedUrls.value[trimmed];
  if (cached) return cached;
  if (unresolved.has(trimmed)) return null;

  const lastAt = lastAttemptAt.get(trimmed) ?? 0;
  if (Date.now() - lastAt >= RETRY_INTERVAL) enqueue(trimmed);
  return null;
};

/**
 * 主动换取一批资源地址（用于非渲染期写入缓存，如落 preferences 前）
 *
 * 等待完成后调用 resolveSignedUrl 即可命中缓存。
 */
export const prefetchSignedUrls = async (
  paths: (string | undefined)[],
): Promise<void> => {
  if (!isPrivateStorage()) return;

  const keys = [...new Set(paths)]
    .filter((path): path is string => typeof path === 'string')
    .map((path) => path.trim())
    .filter((path) => path !== '' && isStorageResource(path))
    .filter((path) => !signedUrls.value[path] && !unresolved.has(path))
    .slice(0, MAX_BATCH);

  if (keys.length === 0) return;
  keys.forEach((key) => queue.delete(key));
  await fetchSignedUrls(keys);
};

/**
 * 把容器内的图片批量替换为可访问地址（正文型内容专用）
 *
 * 富文本 HTML / Markdown 渲染结果里的图片地址无法在模板层交给 buildStaticUrl 处理，
 * 只能在渲染完成后扫描 DOM 后回写 src：
 * - 私有空间：命中本站存储空间的图片换取签名地址（未就绪先跳过，缓存到齐后重扫）
 * - 公开空间：把相对存储路径补全为存储访问域名（编辑器内不会自动拼接域名）
 *
 * @param root 已渲染完成的内容容器（元素或文档）
 */
export const signContentImages = async (
  root: Document | Element | null | undefined,
): Promise<void> => {
  if (!root) return;

  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  if (images.length === 0) return;

  const srcOf = (img: HTMLImageElement): string =>
    (img.getAttribute('src') || '').trim();

  // 公开空间：相对存储路径在编辑器/正文容器里会按站点域名请求（404），需补全访问域名
  if (!isPrivateStorage()) {
    const base = publicBaseUrl();
    if (base === '') return;
    images.forEach((img) => {
      const src = srcOf(img);
      if (!src.startsWith('/') || !isStorageResource(src)) return;
      img.setAttribute('src', `${base}/${src.replace(/^\/+/, '')}`);
    });
    return;
  }

  /** 把命中的图片 src 替换为已获取到的签名地址（幂等，可重复调用） */
  const writeBack = () => {
    images.forEach((img) => {
      const src = srcOf(img);
      const signed = signedUrls.value[src];
      if (signed && signed !== src) img.setAttribute('src', signed);
    });
  };

  // 先回写缓存：重渲染可能把已签名的 src 又还原成原始路径
  writeBack();

  // 已经写过签名的图片跳过，避免把签名地址再当作资源 key 重复请求
  const signedValues = new Set(Object.values(signedUrls.value));
  const keys = [
    ...new Set(
      images
        .map(srcOf)
        .filter(
          (src) =>
            src !== '' && !signedValues.has(src) && isStorageResource(src),
        ),
    ),
  ];
  if (keys.length === 0) return;

  // 已缓存/已判定不属于本站空间的 key 会在内部被跳过
  await prefetchSignedUrls(keys);
  writeBack();
};