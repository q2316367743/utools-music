import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import router from './plugin/router';
import {lazyVxeTable} from "@/plugin/vxe-table";
import ContextMenu from '@imengyu/vue3-context-menu'


// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import '@/assets/style/global.less';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

// 额外引入图标库
createApp(App)
  .use(createPinia())
  .use(router)
  .use(lazyVxeTable)
  .use(ContextMenu)
  .mount('#app');
