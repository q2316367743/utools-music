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
    name: "文件夹分组",
    path: '/local/folder/list',
    component: () => import('@/pages/folder/index.vue')
  }, {
    name: "文件夹详情",
    path: '/local/folder/info',
    component: () => import('@/pages/folder/FolderInfo.vue')
  }, {
    name: "我的歌单",
    path: '/music-group/list',
    component: () => import('@/pages/music-group/list/index.vue')
  }, {
    name: "歌单详情",
    path: '/music-group/info/:id',
    component: () => import('@/pages/music-group/info/MusicGroupInfo.vue')
  }, {
    name: "拓展工具",
    path: '/extra',
    component: () => import('@/pages/extra/index.vue'),
  }, {
    name: "拓展工具-插件管理",
    path: '/extra/plugin',
    component: () => import('@/pages/extra/subpage/plugin/index.vue')
  }, {
    name: "拓展工具-排行榜",
    path: '/extra/ranking',
    component: () => import('@/pages/extra/subpage/ranking/index.vue')
  }, {
    name: "拓展工具-热门歌单",
    path: '/extra/song-list',
    component: () => import('@/pages/extra/subpage/song-list/index.vue')
  }, {
    name: "拓展工具-音乐搜索",
    path: '/extra/search',
    component: () => import('@/pages/extra/subpage/search/index.vue')
  }, {
    name: "拓展工具-下载管理",
    path: '/extra/download',
    component: () => import('@/pages/extra/subpage/download/index.vue')
  }, {
    name: "设置",
    path: '/setting',
    component: () => import('@/pages/setting/index.vue')
  }, {
    name: '关于',
    path: '/about',
    component: () => import('@/pages/about/index.vue')
  }]
});

router.beforeEach(to => {
  useUmami.page(to.path, to.name as string)
})

export default router;
