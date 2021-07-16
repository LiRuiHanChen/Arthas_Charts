import request from '@/utils/request'

export function getModelNameToList(modelName, offset, limit) {
  return request({
    url: '/document/modelNameList',
    method: 'get',
    timeout: 20000,
    params: {
      modelName,
      offset,
      limit
    }
  })
}

export function getDocumentById(documentId) {
  return request({
    url: '/document/byId',
    method: 'get',
    timeout: 50000,
    params: {
      id: documentId
    }
  })
}

export function modelList() {
  return request({
    url: '/document/modelList',
    method: 'get',
    timeout: 50000,
    params: {
    }
  })
}

export function saveDocument(modelName, content) {
  return request({
    url: '/document/save/document',
    method: 'post',
    timeout: 50000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      modelName: modelName,
      content: content
    },
    transformRequest: [function(data) {
      let ret = ''
      for (const it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }]
  })
}

export function editDocument(document) {
  return request({
    url: '/document/edit/document',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data: JSON.stringify(document)
  })
}
