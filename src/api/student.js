import request from '@/utils/request'

export function getTeacherInfo(id) {
  return request({
    url: '/check/teacher',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      id
    }
  })
}

export function joinsystemclazz(studentRegisterBody) {
  return request({
    url: '/register/student',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(studentRegisterBody),
    timeout: 90000
  })
}
