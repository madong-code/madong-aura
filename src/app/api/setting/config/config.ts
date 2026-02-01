import request from '@/utils/http'

const baseUrl = '/system/config'

export const ConfigService = {
  getByCode($code: string, params?: Record<string, any>) {
    return request.get({ url: `${baseUrl}/code/${$code}`, params })
  },
  getByGroup(groupCode: string, params?: Record<string, any>) {
    return request.get({ url: `${baseUrl}/group/${groupCode}`, params })
  },
  update(code: string, data: Record<string, any>) {
    return request.put({ url: `${baseUrl}/${code}`, data })
  },
  save(data: Record<string, any>) {
    return request.post({ url: baseUrl, data })
  }
}

export default ConfigService
