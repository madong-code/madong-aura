/**
 * 查看器多类型自动格式化工具（纯函数，无 Vue 依赖，可单测）。
 *
 * 设计原则：
 * - 永不抛异常：任何输入（含异常格式数据）都产出可展示的字符串/兜底标记；
 * - 空值统一：null / undefined / '' / 空数组 视为空，调用方渲染 `--`；
 * - 大数据安全：超长文本截断展示，完整内容通过 title 提示。
 */
import dayjs from 'dayjs';

import type {
  ViewerAmountOptions,
  ViewerDateOptions,
  ViewerEnumOption,
  ViewerFormatType,
} from './types';

/** 默认空值占位符 */
export const VIEWER_EMPTY_TEXT = '--';

/** 判断是否为空值（null / undefined / 空串 / 空数组） */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/** 安全转字符串（NaN / Symbol / 异常对象等均不抛错） */
function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : VIEWER_EMPTY_TEXT;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'symbol' || typeof value === 'function') return VIEWER_EMPTY_TEXT;
  if (value instanceof Date) return formatDateValue(value);
  if (typeof value === 'object') return safeJsonStringify(value);
  return String(value ?? VIEWER_EMPTY_TEXT);
}

/** 安全 JSON 序列化（循环引用/异常对象不抛错） */
export function safeJsonStringify(value: unknown, spaces = 2): string {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (_key, val: any) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        if (typeof val === 'bigint') return val.toString();
        return val;
      },
      spaces,
    );
  } catch {
    return VIEWER_EMPTY_TEXT;
  }
}

/** 数组/逗号分隔串统一为字符串数组（缺项、混合类型均安全） */
export function normalizeListValue(value: unknown): string[] {
  if (isEmptyValue(value)) return [];
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item));
  }
  return safeString(value)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

/** 日期格式化：支持 Date / 时间戳（秒与毫秒自适配）/ ISO 字符串 / dayjs 可解析串 */
export function formatDateValue(
  value: unknown,
  options: ViewerDateOptions = {},
): string {
  const { format = 'YYYY-MM-DD HH:mm:ss' } = options;
  if (isEmptyValue(value)) return VIEWER_EMPTY_TEXT;
  // 类型守卫：boolean/symbol/function/普通对象等非法类型直接回退，
  // 避免 new Date(true) 之类被解析为 epoch 附近的错乱时间
  const isLegalInput =
    value instanceof Date ||
    dayjs.isDayjs(value) ||
    ['number', 'string'].includes(typeof value);
  if (!isLegalInput) return VIEWER_EMPTY_TEXT;
  let input: dayjs.ConfigType = value as any;
  // 秒级时间戳（10 位）自动转毫秒
  if (typeof value === 'number') {
    input = String(value).length <= 10 ? value * 1000 : value;
  }
  // 纯数字字符串时间戳（10 位秒级 / 11-13 位毫秒级）
  if (typeof value === 'string' && /^\d{10,13}$/.test(value.trim())) {
    const raw = value.trim();
    const num = Number(raw);
    input = raw.length <= 10 ? num * 1000 : num;
  }
  // ISO 类日期串基础有效性预校验：dayjs 对 13 月/45 日等溢出值会进位产生
  // 错乱日期（如 2026-13-45 → 2027-02-14），此处先拦截非法月日
  if (typeof input === 'string') {
    const match = input.trim().match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
    if (match) {
      const month = Number(match[2]);
      const day = Number(match[3] ?? 1);
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return VIEWER_EMPTY_TEXT;
      }
    }
  }
  const day = dayjs(input);
  // epoch 0 / 负值视为无效（非法日期串经 Date 构造溢出常产生 epoch 0）
  return day.isValid() && day.valueOf() > 0
    ? day.format(format)
    : VIEWER_EMPTY_TEXT;
}

/** 金额格式化：千分位 + 精度 + 前后缀；非数值输入原样返回 */
export function formatAmountValue(
  value: unknown,
  options: ViewerAmountOptions = {},
): string {
  const { precision = 2, prefix = '', separator = true, suffix = '' } = options;
  if (isEmptyValue(value)) return VIEWER_EMPTY_TEXT;
  const num = typeof value === 'string' ? Number(value.trim()) : value;
  if (typeof num !== 'number' || !Number.isFinite(num)) {
    // 异常格式（如 "abc"）原样展示，不做静默改写
    return `${prefix}${safeString(value)}${suffix}`;
  }
  const fixed = Math.abs(num).toFixed(precision);
  const [intPart = '0', decimalPart] = fixed.split('.');
  const grouped = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : intPart;
  const sign = num < 0 ? '-' : '';
  return `${prefix}${sign}${grouped}${decimalPart ? `.${decimalPart}` : ''}${suffix}`;
}

/** 枚举映射：数组或键值对象 → { label, color }；未命中回退原值 */
export function formatEnumValue(
  value: unknown,
  options: ViewerEnumOption[] | Record<number | string, string> = [],
): { color?: ViewerEnumOption['color']; label: string; matched: boolean } {
  if (isEmptyValue(value)) return { label: VIEWER_EMPTY_TEXT, matched: false };
  if (Array.isArray(options)) {
    const hit = options.find(
      (item) => String(item.value) === String(value),
    );
    return hit
      ? { color: hit.color, label: hit.label, matched: true }
      : { label: safeString(value), matched: false };
  }
  const label = options[String(value) as never] ?? options[value as never];
  return typeof label === 'string'
    ? { label, matched: true }
    : { label: safeString(value), matched: false };
}

/** 长文本截断：超出 limit 显示省略号，完整文本由调用方放 title */
export function formatTextValue(value: unknown, limit = 0): string {
  if (isEmptyValue(value)) return VIEWER_EMPTY_TEXT;
  const text = safeString(value);
  if (limit > 0 && text.length > limit) {
    return `${text.slice(0, limit)}...`;
  }
  return text;
}

/**
 * 统一分发入口：按 format 类型自动格式化。
 * 用于 viewer.vue 的无组件 fallback 与各基础查看器内部。
 */
export function formatViewerValue(
  value: unknown,
  config: {
    format?: ViewerFormatType;
    amount?: ViewerAmountOptions;
    date?: ViewerDateOptions;
    enum?: ViewerEnumOption[] | Record<number | string, string>;
    textLimit?: number;
  } = {},
): string {
  if (isEmptyValue(value)) return VIEWER_EMPTY_TEXT;
  switch (config.format) {
    case 'amount': {
      return formatAmountValue(value, config.amount);
    }
    case 'date': {
      return formatDateValue(value, {
        ...config.date,
        format: config.date?.format ?? 'YYYY-MM-DD',
      });
    }
    case 'datetime': {
      return formatDateValue(value, config.date);
    }
    case 'enum': {
      return formatEnumValue(value, config.enum).label;
    }
    case 'json': {
      return typeof value === 'string' ? value : safeJsonStringify(value);
    }
    default: {
      // text：对象自动 JSON，数组/逗号串统一拼接
      if (Array.isArray(value)) return normalizeListValue(value).join(', ');
      if (typeof value === 'object' && value !== null) {
        return safeJsonStringify(value);
      }
      return formatTextValue(value, config.textLimit);
    }
  }
}
