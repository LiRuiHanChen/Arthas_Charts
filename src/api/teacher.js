import request from '@/utils/request'

export async function getCityInfo(id) {
  return request({
    url: '/load/city',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      id
    }
  })
}

export async function getSchoolInfo(cityIdList) {
  return request({
    url: '/load/school',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      cityIdList: cityIdList
    }
  })
}
