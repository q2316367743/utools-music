import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'

import './main.less';
import 'tdesign-vue-next/es/style/index.css';
import '@/assets/style/global.less';

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import '@/assets/style/global.less';

// 额外引入图标库
createApp(App)
  .use(createPinia())
  .mount('#app');