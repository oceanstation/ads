import Vue from 'vue'
import Router from 'vue-router'
import Situation from '@/views/Situation'
import Analysis from '@/views/Analysis'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Situation',
      component: Situation
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: Analysis
    }
  ]
})
