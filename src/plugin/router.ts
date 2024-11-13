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
      name: "音乐搜索",
      path: '/search',
      component: () => import('@/pages/search/index.vue')
    }, {
      name: "设置",
      path: '/setting',
      component: () => import('@/pages/setting/index.vue')
    }, {
      name: "我的歌单",
      path: '/music-group',
      component: () => import('@/pages/MusicGroup/index.vue')
    }]
});

router.beforeEach(to => {
  useUmami.page(to.path, to.name as string)
})

export default router;
