import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    name: 'arthas',
    meta: {
      title: '监控',
      icon: 'database'
    },
    children: [
      {
        path: '/',
        name: 'arthas',
        component: () => import('@/views/arthas/arthasInfo'),
        meta: { title: 'Arthas' }
      }
    ]
  },
  {
    path: '/student',
    name: 'Student',
    component: Layout,
    meta: {
      title: 'Student',
      icon: 'nested'
    },
    children: [
      {
        path: '/info',
        name: 'info',
        component: () => import('@/views/student/student'),
        meta: { title: 'register' }
      }
    ]
  },

  // {
  //   path: '/testReport',
  //   component: Layout,
  //   // redirect: '/dashboard',
  //   children: [{
  //     path: 'dashboard',
  //     name: 'testReport',
  //     component: () => import('@/views/testReport/testReport'),
  //     meta: { title: '性能测试报告', icon: 'report' }
  //   }]
  // },

  // {
  //   // 上传脚本
  //   path: '/',
  //   redirect: '/uploadfiles',
  //   component: Layout,
  //   children: [{
  //     path: 'uploadfiles',
  //     name: 'uploadfiles',
  //     component: () => import('@/views/upload/uploadfiles'),
  //     meta: { title: '上传文件', icon: 'upload' }
  //   }]
  // },

  // {
  //   path: '/createTestPlan',
  //   component: Layout,
  //   name: 'createTestPlan',
  //   children: [
  //     {
  //       path: 'createTestPlan',
  //       name: 'Tree',
  //       component: () => import('@/views/createTestPlan/createTestPlan'),
  //       meta: { title: '性能测试计划', icon: 'http' }
  //     }
  //   ]
  // },

  // {
  //   path: '/autoInterface/testPlan',
  //   component: Layout,
  //   name: 'interfaceTestPlan',
  //   meta: {
  //     title: '接口测试计划',
  //     icon: 'plan'
  //   },
  //   children: [
  //     {
  //       path: '/interfaceTestPlan',
  //       component: () => import('@/views/autoInterface/testPlan/interfaceTestPlan'), // Parent router-view
  //       meta: { title: '接口测试计划' }
  //     }
  //   ]
  // },

  // {
  //   path: '/autoInterface/interfaceScene',
  //   component: Layout,
  //   name: 'scene',
  //   meta: {
  //     title: '接口测试场景',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: '/interfaceList',
  //       component: () => import('@/views/autoInterface/interfaceScene/scene'), // Parent router-view
  //       meta: { title: '接口测试场景' }
  //     }
  //   ]
  // },

  // {
  //   path: '/autoInterface/testData',
  //   component: Layout,
  //   name: 'testData',
  //   meta: {
  //     title: '测试数据',
  //     icon: 'database'
  //   },
  //   children: [
  //     {
  //       path: '/testData',
  //       component: () => import('@/views/autoInterface/testData/testData'),
  //       meta: { title: '测试数据' }
  //     }
  //   ]
  // },
  // {
  //   path: '/autoInterface/interfaceList',
  //   component: Layout,
  //   name: 'interfaceList',
  //   meta: {
  //     title: '接口文档',
  //     icon: 'interface'
  //   },
  //   children: [
  //     {
  //       path: '/addDocument',
  //       component: () => import('@/views/autoInterface/interfaceList/addDocument'),
  //       meta: { title: '添加接口文档' }
  //     },
  //     {
  //       path: '/documentList',
  //       component: () => import('@/views/autoInterface/interfaceList/documentList'),
  //       meta: { title: '查看接口文档' }
  //     },
  //     // 运行测试case的指定
  //     {
  //       path: '/autoInterface/interfaceScene/runTestCase',
  //       name: 'runTestCase',
  //       meta: { title: '运行测试场景' },
  //       component: () => import('@/views/autoInterface/interfaceScene/runTestCase')
  //     }
  //   ]
  // },

  // {
  //   path: '/autoInterface/interfaceReport',
  //   component: Layout,
  //   name: 'autoInterface',
  //   meta: {
  //     title: '接口测试报告',
  //     icon: 'report'
  //   },
  //   children: [
  //     {
  //       path: '/interfaceReport',
  //       component: () => import('@/views/autoInterface/interfaceReport/interfaceReport'),
  //       meta: { title: '接口自动化测试报告' }
  //     }
  //   ]
  // },
  // // 运行测试case的指定
  // {
  //   path: '/autoInterface/interfaceScene/runTestCase',
  //   name: 'runTestCase',
  //   hidden: true,
  //   component: () => import('@/views/autoInterface/interfaceScene/runTestCase')
  // },
  // // 编辑文档
  // {
  //   path: '/autoInterface/interfaceList/editDocument',
  //   name: 'editDocument',
  //   hidden: true,
  //   component: () => import('@/views/autoInterface/interfaceList/editDocument')
  // },
  {
    path: '/stackTrace',
    component: () => import('@/views/arthas/stackTrace'),
    hidden: true,
    name: 'stackTrace'
  },
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/arthas', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
