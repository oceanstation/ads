import request from '@/utils/request'

export function getEntropy (params) {
  return request({
    url: '/entropy',
    method: 'get',
    params: params
  })
}

export function getScatter (params) {
  return request({
    url: '/scatter',
    method: 'get',
    params: params
  })
}

export function getChord (params) {
  return request({
    url: '/chord',
    method: 'get',
    params: params
  })
}

export function getIps (params) {
  return request({
    url: '/ips',
    method: 'get',
    params: params
  })
}
