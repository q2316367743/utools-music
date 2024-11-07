import {createRouter, createWebHashHistory} from 'vue-router';
import {useUmami} from "@/plugin/umami";
// 引入路由

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        name: "首页",
        path: '/',
        redirect: '/local',
    }, {
        name: "本地音乐",
        path: '/local',
        component: () => import('@/pages/local/index.vue')
    }, {
      name: "下载管理",
      path: '/download',
      component: () => import('@/pages/download/index.vue')
    }, {
      name: "插件管理",
      path: '/plugin',
      component: () => import('@/pages/plugin/index.vue')
    }, {
      name: "最近播放",
      path: '/lately',
      component: () => import('@/pages/lately/index.vue')
    }]
});

router.beforeEach(to => {
  useUmami.page(to.path, to.name as string)
})

export default router;
