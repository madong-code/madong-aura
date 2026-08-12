/**
 * 数据格式化相关工具函数
 */
import { formatDate as _formatDate } from '#/core/shared';

// 时间戳转时间
export function timestampToTime(
  timestamp: number = Date.now(),
  isMs: boolean = true,
): string {
  const date = new Date(isMs ? timestamp : timestamp * 1000);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// 数字格式化（千位分隔符）
export function commafy(num: number): string {
  return num.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 生成随机数
export function randomNum(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 移除HTML标签
export function removeHtmlTags(str: string = ''): string {
  return str.replaceAll(/<[^>]*>/g, '');
}

/**
 * ─────────────────────────────────────────────────────────
 *  日期时间格式化（封装层）
 *  统一通过 #/utils 引用，不直接依赖 #/core/shared
 *  后续 #/core/shared 接口变化时，只需修改此文件
 * ─────────────────────────────────────────────────────────
 */

/**
 * 格式化日期（时区感知，自动适配用户配置时区）
 * @param time 日期值（ISO 字符串 / 时间戳 / Date）
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(
  time: Date | null | number | string | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (time === undefined || time === null) return '';
  // 兼容秒级时间戳（10位数字），转为毫秒
  if (typeof time === 'number' && time.toString().length === 10) {
    time = time * 1000;
  }
  return _formatDate(time, format as any);
}

/**
 * 格式化 ISO 8601 日期字符串（时区感知，自动适配用户配置时区）
 * @param isoDate ISO 8601 日期字符串
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatISODate(
  isoDate: string,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!isoDate) return '';
  try {
    return _formatDate(isoDate, format as any);
  } catch {
    return isoDate;
  }
}

/**
 * 格式化时间戳
 * @param dateTime 时间戳
 * @param fmt 格式化方式，默认：yyyy-mm-dd hh:MM:ss
 */
export const timestampFormat = (
  dateTime: null | number | string = null,
  fmt = 'yyyy-mm-dd hh:MM:ss',
) => {
  if (!dateTime) dateTime = Date.now();
  if (dateTime.toString().length === 10) {
    dateTime = +dateTime * 1000;
  }

  const date = new Date(dateTime);
  let ret;
  const opt: any = {
    'y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'h+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    's+': date.getSeconds().toString(), // 秒
  };
  for (const k in opt) {
    ret = new RegExp(`(${k})`).exec(fmt);
    if (ret) {
      const match = ret[1];
      if (!match) continue;
      const value = opt[k] as string;
      fmt = fmt.replace(
        match,
        match.length === 1 ? value : padStart(value, match.length, '0'),
      );
    }
  }
  return fmt;
};

/**
 * 字符串补位
 */
const padStart = (str: string, maxLength: number, fillString = ' ') => {
  if (str.length >= maxLength) return str;

  const fillLength = maxLength - str.length;
  let times = Math.ceil(fillLength / fillString.length);
  while ((times >>= 1)) {
    fillString += fillString;
    if (times === 1) {
      fillString += fillString;
    }
  }
  return fillString.slice(0, fillLength) + str;
};
