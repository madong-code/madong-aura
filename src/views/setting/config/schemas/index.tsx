
/**
 * 返回模板字段
 * @param groupCode
 * @returns
 */
export const templateField = function (groupCode: string) {
  const data = {
    local: ['root', 'dirname', 'domain', 'remark'],
    oss: ['accessKeyId', 'accessKeySecret', 'bucket', 'domain', 'endpoint', 'dirname', 'remark'],
    cos: ['secretId', 'secretKey', 'bucket', 'domain', 'region', 'dirname', 'remark'],
    qiniu: ['accessKey', 'secretKey', 'bucket', 'domain', 'region', 'dirname', 'remark'],
    s3: [
      'key',
      'secret',
      'bucket',
      'dirname',
      'domain',
      'region',
      'version',
      'endpoint',
      'acl',
      'remark'
    ]
  }
  //@ts-ignore
  return data[groupCode] || []
}

export const convertStringNumbers = (obj: Record<string, any>): Record<string, any> => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      obj[key] = Number(value)
    }
  })
  return obj
}
