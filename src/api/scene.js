import request from '@/utils/request'

// 获取场景信息
export function getHomeWork(caseName, stage, subject, flag) {
  return request({
    url: '/getHomeWork',
    method: 'get',
    params: {
      caseName,
      stage,
      subject,
      flag
    }
  })
}

// 运行场景
export function runHomeWork(homeWorkTestCaseList) {
  return request({
    url: '/runHomeWorkTestCase',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(homeWorkTestCaseList)
  })
}

/*
  保存场景
  List<ScenariosData>
*/
export function saveHomeWork(homeWorkRequestBean) {
  return request({
    url: '/saveHomeWork',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data: homeWorkRequestBean
  })
}
