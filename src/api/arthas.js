import request from '@/utils/request'

export function arthasRequest(arthasRequestParam) {
  return request({
    url: '/action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: arthasRequestParam
  })
}
