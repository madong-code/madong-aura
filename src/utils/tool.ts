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

/**
 * 根据指定ID获取树形结构中该节点及其所有子节点的ID
 * @param data 树形数据数组
 * @param id 当前节点ID
 * @param idKey ID字段名，默认为'id'
 * @param childrenKey 子节点字段名，默认为'children'
 * @returns 包含当前节点及所有子节点ID的数组
 */
export const getTreeNodeAndChildrenIds = (
  data: any[],
  id: any,
  idKey = 'id',
  childrenKey = 'children'
): any[] => {
  const result: any[] = []

  const traverse = (nodes: any[]) => {
    if (!nodes || !Array.isArray(nodes)) return

    for (const node of nodes) {
      if (node[idKey] === id) {
        // 找到目标节点，收集该节点及其所有子节点
        const collectIds = (n: any) => {
          result.push(n[idKey])
          if (n[childrenKey] && Array.isArray(n[childrenKey])) {
            n[childrenKey].forEach((child: any) => collectIds(child))
          }
        }
        collectIds(node)
        return // 找到目标节点后可以提前结束
      }

      // 递归查找子节点
      if (node[childrenKey] && Array.isArray(node[childrenKey])) {
        traverse(node[childrenKey])
      }
    }
  }

  traverse(data)
  return result
}
