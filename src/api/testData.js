import request from '@/utils/request'

/*
  获取测试数据
  return List<>
*/
export function getTestData(url) {
  return request({
    url: '/test/data/info_by_url',
    method: 'get',
    params: {
      url
    }
  })
}

/*
  保存测试数据
  return List<Map<Integer, Boolean>>
*/
export function saveTestData(testData) {
  return request({
    url: '/test/data/save',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data: JSON.stringify(testData)
  })
}

/*
  获取级联接口信息
*/
export function getCascadeInfo() {
  return request({
    url: '/interface/cascade/info',
    method: 'get',
    params: {
    }
  })
}
