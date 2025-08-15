export const omit = (obj: any, keysToOmit: string[]) => {
  // 如果 obj 不是对象或者 keysToOmit 不是数组，则直接返回 obj
  if (typeof obj !== 'object' || !Array.isArray(keysToOmit)) {
    return obj
  }

  // 创建一个新的对象，避免修改原始对象
  const result = {} as any

  // 遍历 obj 的所有键值对
  for (const key in obj) {
    // 如果当前键不在要忽略的键列表中，则复制到新对象
    if (!keysToOmit.includes(key)) {
      result[key] = obj[key]
    }
  }

  return result
}
export const get = (object: any, path: string) => {
  // 如果 object 不是对象或者 path 不是字符串，则直接返回 defaultValue
  if (typeof object !== 'object' || object === null || typeof path !== 'string') {
    return undefined
  }

  // 将路径字符串转换为数组
  const pathArray = path.split('.').filter(Boolean) // 过滤掉空字符串
  let current = object

  // 遍历路径数组
  for (const element of pathArray) {
    // 如果当前层级不是对象或没有对应的键，则返回 defaultValue
    if (typeof current !== 'object' || current === null || !(element in current)) {
      return undefined
    }
    // 更新 current 到下一层级
    current = current[element]
  }

  // 返回最终找到的值
  return current
}
