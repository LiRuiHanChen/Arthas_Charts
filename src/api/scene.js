import request from '@/utils/request'

// 获取场景信息
export function getScene(url, sceneId) {
  return request({
    url: '/scene/info',
    method: 'get',
    params: {
      url,
      sceneId
    }
  })
}

// 运行场景
export function runScene(httpRequestEngineBody) {
  return request({
    url: '/scene/run',
    method: 'post',
    httpRequestEngineBody
  })
}

/*
  保存场景
  List<ScenariosData>
*/
export function saveScene(list) {
  return request({
    url: '/scene/save',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data: JSON.stringify(list)
  })
}
