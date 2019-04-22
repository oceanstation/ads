import axios from 'axios'

const service = axios.create({
  baseURL: 'http://127.0.0.1:7001',
  timeout: 15000
})

service.interceptors.response.use(
  function (response) {
    return Promise.resolve(response.data)
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default service
