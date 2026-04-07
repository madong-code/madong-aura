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

/**
 * 获取树形数据中的所有叶子节点
 * @param data 树形数据数组
 * @param childrenKey 子节点字段名，默认为'children'
 * @returns 包含所有叶子节点的数组
 */
export const getTreeLeafNodes = (data: any[], childrenKey = 'children'): any[] => {
  const result: any[] = []

  const traverse = (nodes: any[]) => {
    if (!nodes || !Array.isArray(nodes)) return

    for (const node of nodes) {
      // 如果节点没有子节点或者子节点为空数组，则为叶子节点
      if (
        !node[childrenKey] ||
        !Array.isArray(node[childrenKey]) ||
        node[childrenKey].length === 0
      ) {
        result.push(node)
      } else {
        // 递归查找子节点
        traverse(node[childrenKey])
      }
    }
  }

  traverse(data)
  return result
}

/**
 * 获取树形数据中的所有叶子节点ID
 * @param data 树形数据数组
 * @param idKey ID字段名，默认为'id'
 * @param childrenKey 子节点字段名，默认为'children'
 * @returns 包含所有叶子节点ID的数组
 */
export const getTreeLeafNodeIds = (data: any[], idKey = 'id', childrenKey = 'children'): any[] => {
  const result: any[] = []

  const traverse = (nodes: any[]) => {
    if (!nodes || !Array.isArray(nodes)) return

    for (const node of nodes) {
      // 如果节点没有子节点或者子节点为空数组，则为叶子节点
      if (
        !node[childrenKey] ||
        !Array.isArray(node[childrenKey]) ||
        node[childrenKey].length === 0
      ) {
        result.push(node[idKey])
      } else {
        // 递归查找子节点
        traverse(node[childrenKey])
      }
    }
  }

  traverse(data)
  return result
}



/**
 * 数据格式化相关工具函数
 */

// 时间戳转时间
export function timestampToTime(timestamp: number = Date.now(), isMs: boolean = true): string {
  const date = new Date(isMs ? timestamp : timestamp * 1000)
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

// 数字格式化（千位分隔符）
export function commafy(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 生成随机数
export function randomNum(min: number, max?: number): number {
  if (max === undefined) {
    max = min
    min = 0
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 移除HTML标签
export function removeHtmlTags(str: string = ''): string {
  return str.replace(/<[^>]*>/g, '')
}






/**
 * 格式化时间戳
 * @param dateTime 时间戳
 * @param fmt 格式化方式，默认：yyyy-mm-dd hh:MM:ss
 */
export const timestampFormat = (dateTime: string | number | null = null, fmt = 'yyyy-mm-dd hh:MM:ss') => {
  if (!dateTime) dateTime = Number(new Date())
  if (dateTime.toString().length === 10) {
    dateTime = +dateTime * 1000
  }

  const date = new Date(dateTime)
  let ret
  const opt: any = {
    'y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'h+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    's+': date.getSeconds().toString(), // 秒
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : padStart(opt[k], ret[1].length, '0'))
    }
  }
  return fmt
}


/**
 * 字符串补位
 */
const padStart = (str: string, maxLength: number, fillString = ' ') => {
  if (str.length >= maxLength) return str

  const fillLength = maxLength - str.length
  let times = Math.ceil(fillLength / fillString.length)
  while ((times >>= 1)) {
    fillString += fillString
    if (times === 1) {
      fillString += fillString
    }
  }
  return fillString.slice(0, fillLength) + str
}


export function downloadFile(res: any, downName: string = '') {
  const aLink = document.createElement('a');
  let fileName = downName;
  let blob = res;

  // 处理 axios 响应（包含 data 字段的 blob）
  if (res && res.data instanceof Blob) {
    blob = res.data;
  }
  // 处理包含 data 字段的响应
  else if (res && res.data) {
    blob = new Blob([res.data], {
      type: res.headers?.['content-type']?.replace(';charset=utf8', '') || 'application/octet-stream'
    });
    if (!downName && res.headers && res.headers['content-disposition']) {
      const contentDisposition = decodeURI(res.headers['content-disposition']);
      const result = contentDisposition.match(/filename="(.+)/gi);
      fileName = result?.[0].replace(/filename="(.+)/gi, '') || '';
      fileName = fileName.replace('"', '');
    }
  }

  // 确保 blob 是有效的
  if (!blob || !(blob instanceof Blob)) {
    console.error('无效的文件数据:', blob);
    ElMessage.error('下载失败');
    return;
  }

  aLink.href = URL.createObjectURL(blob);
  aLink.setAttribute('download', fileName || 'download');
  document.body.appendChild(aLink);
  aLink.click();
  document.body.removeChild(aLink);
  URL.revokeObjectURL(aLink.href);
}
