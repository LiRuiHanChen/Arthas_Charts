import request from '@/utils/request'

/*
  获取接口信息
  return List<InterfaceInfo>
*/
export function getInterface(url, id, method, serviceName) {
  return request({
    url: '/interface/list',
    method: 'get',
    param: {
      url,
      id,
      method,
      serviceName
    }
  })
}

/*
  保存接口信息
  return List<Map<String, Boolean>>
*/
export function saveInterfaceList(interfaceInfoList) {
  return request({
    url: '/interface/save',
    method: 'post',
    interfaceInfoList
  })
}

export function getUrlList(serviceName, modelName) {
  return request({
    url: '/interface/urlList',
    method: 'get',
    param: {
      serviceName,
      modelName
    }
  })
}
