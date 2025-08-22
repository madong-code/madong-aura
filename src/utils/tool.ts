// 通用工具
/**
 * 获取当前时间与给定时间的相对时间描述
 * @param dateString yyyy-MM-dd HH:mm:ss 格式的时间字符串
 * @returns 相对时间字符串，如"3天前"、"2小时前"、"1分钟前"等
 */
export const getRelativeTime = (dateString: string): string => {
  const targetDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - targetDate.getTime()
  const absDiffMs = Math.abs(diffMs)

  // 计算各时间单位差值
  const diffSeconds = Math.floor(absDiffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  const suffix = diffMs < 0 ? '后' : '前'

  if (diffMonths > 0) {
    return `${diffMonths}个月${suffix}`
  }
  if (diffWeeks > 0) {
    return `${diffWeeks}周${suffix}`
  }
  if (diffDays > 0) {
    return `${diffDays}天${suffix}`
  }
  if (diffHours > 0) {
    return `${diffHours}小时${suffix}`
  }
  if (diffMinutes > 0) {
    return `${diffMinutes}分钟${suffix}`
  }
  return `${diffSeconds}秒${suffix}`
}
