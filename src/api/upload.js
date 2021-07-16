import request from '@/utils/request'

export function uploadFiles(files) {
  return request({
    url: '/upload/files',
    method: 'post',
    files
  })
}
